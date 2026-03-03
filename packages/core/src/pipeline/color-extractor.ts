import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { log } from "../ui/logger.js";

// ── Chrome executable detection ─────────────────────────────────────

const CHROME_PATHS: Record<string, string[]> = {
  darwin: [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
  ],
  linux: [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
  ],
  win32: [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ],
};

export function findChromePath(): string | null {
  const platform = process.platform;
  const candidates = CHROME_PATHS[platform] ?? [];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

// ── Color extraction script (runs inside the browser) ───────────────

/**
 * This script is evaluated via page.evaluate() in Playwright.
 * It extracts all color data from the live DOM using getComputedStyle.
 * It's a constant — same script, every time, deterministic.
 */
export const COLOR_EXTRACTION_SCRIPT = () => {
  const rgbToHex = (rgb: string): string => {
    const m = rgb.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return rgb;
    return "#" + [m[1], m[2], m[3]].map(x => (+x).toString(16).padStart(2, "0")).join("");
  };

  const isVisible = (el: Element | null): boolean => {
    if (!el) return false;
    const htmlEl = el as HTMLElement;
    if (htmlEl.offsetWidth === 0 && htmlEl.offsetHeight === 0) return false;
    const s = getComputedStyle(el);
    return s.display !== "none" && s.visibility !== "hidden" && s.opacity !== "0";
  };

  const qVisible = (selectors: string): Element | null => {
    const els = document.querySelectorAll(selectors);
    for (const el of els) {
      if (isVisible(el)) return el;
    }
    return null;
  };

  const getColor = (el: Element | null, prop: string): string | null => {
    if (!el) return null;
    const val = (getComputedStyle(el) as unknown as Record<string, string>)[prop];
    return val ? rgbToHex(val) : null;
  };

  const lum = (hex: string): number => {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const c = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };

  const sat = (hex: string): number => {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max === min) return 0;
    const l = (max + min) / 2;
    return l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
  };

  const pageBg = rgbToHex(getComputedStyle(document.body).backgroundColor);
  const pageLum = lum(pageBg);

  // Find heading with contrast against page bg
  let heading: Element | null = null;
  const headingEls = document.querySelectorAll("main h1, main h2, h1, h2, [class*=\"heading\"], [class*=\"title\"]");
  for (const el of headingEls) {
    if (!isVisible(el)) continue;
    const c = rgbToHex(getComputedStyle(el).color);
    if (c && Math.abs(lum(c) - pageLum) > 0.3) { heading = el; break; }
  }
  if (!heading) {
    const h3s = document.querySelectorAll("h3");
    for (const el of h3s) {
      if (!isVisible(el)) continue;
      const c = rgbToHex(getComputedStyle(el).color);
      if (c && Math.abs(lum(c) - pageLum) > 0.3) { heading = el; break; }
    }
  }

  // Find <p> with contrast against page bg
  let pEl: Element | null = null;
  const pCandidates = document.querySelectorAll("p");
  for (const el of pCandidates) {
    if (!isVisible(el)) continue;
    const c = rgbToHex(getComputedStyle(el).color);
    if (c && Math.abs(lum(c) - pageLum) > 0.3) { pEl = el; break; }
  }

  const body = document.body;
  const header = qVisible("header, [class*=\"header\"], nav");
  const card = qVisible("[class*=\"card\"], [class*=\"Card\"], article");
  const input = qVisible("input, textarea");
  const divider = qVisible("hr, [class*=\"divider\"], [class*=\"border\"]");
  const footer = qVisible("body > footer, footer:not([class*=\"Card\"] footer):not([class*=\"card\"] footer)");

  // Find link with contrast against page bg
  let a: Element | null = null;
  const linkEls = document.querySelectorAll("a:not([class*=\"logo\"])");
  for (const el of linkEls) {
    if (!isVisible(el)) continue;
    const c = rgbToHex(getComputedStyle(el).color);
    if (c && Math.abs(lum(c) - pageLum) > 0.3) { a = el; break; }
  }

  // Find button with chromatic (saturated) background
  let btn: Element | null = null;
  let btnFallback: Element | null = null;
  const btnCandidates = document.querySelectorAll("button, [class*=\"btn\"], [class*=\"Button\"], [role=\"button\"], a[class*=\"btn\"], a[class*=\"Button\"]");
  for (const el of btnCandidates) {
    if (!isVisible(el)) continue;
    const bg = getComputedStyle(el).backgroundColor;
    if (bg === "transparent" || bg.startsWith("rgba(0, 0, 0, 0)")) continue;
    const hex = rgbToHex(bg);
    if (!hex || hex === "#ffffff" || hex === "#000000") continue;
    if (!btnFallback) btnFallback = el;
    if (sat(hex) > 0.3) { btn = el; break; }
  }
  if (!btn) btn = btnFallback;

  // Extract CSS custom properties from :root
  const cssVarNames = [
    "--primary-color", "--accent-color", "--brand-color",
    "--primary", "--accent", "--color-primary",
    "--theme-primary", "--color-accent", "--brand-primary",
  ];
  const cssVars: Record<string, string> = {};
  const rootStyle = getComputedStyle(document.documentElement);
  for (const name of cssVarNames) {
    const val = rootStyle.getPropertyValue(name).trim();
    if (val) cssVars[name] = rgbToHex(val) || val;
  }

  const result: Record<string, unknown> = {
    backgrounds: {
      page: pageBg,
      header: getColor(header, "backgroundColor"),
      card: getColor(card, "backgroundColor"),
      footer: getColor(footer, "backgroundColor"),
    },
    text: {
      heading: getColor(heading, "color"),
      body: getColor(pEl, "color") || getColor(body, "color"),
      muted: getColor(qVisible("[class*=\"muted\"], [class*=\"secondary\"], small, .text-gray"), "color"),
      link: getColor(a, "color"),
    },
    accents: {
      primary: getColor(btn, "backgroundColor") || getColor(a, "color"),
      primaryText: getColor(btn, "color"),
    },
    borders: {
      default: getColor(input, "borderColor") || getColor(card, "borderColor") || getColor(divider, "borderColor"),
    },
    surfaces: {
      input: getColor(input, "backgroundColor"),
    },
  };
  if (Object.keys(cssVars).length > 0) result._cssVars = cssVars;
  return result;
};

// ── Main extraction function ────────────────────────────────────────

export async function extractColors(url: string, cwd: string): Promise<void> {
  const chromePath = findChromePath();
  if (!chromePath) {
    log.warn("Chrome not found — skipping Playwright color extraction (will use defaults)");
    return;
  }

  // Dynamic import to avoid breaking if playwright-core isn't installed
  const { chromium } = await import("playwright-core");

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: chromePath,
      headless: true,
      args: [
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-gpu",
        "--disable-extensions",
      ],
    });

    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    // Navigate and wait for network idle
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });

    // Light mode extraction
    const lightData = await page.evaluate(COLOR_EXTRACTION_SCRIPT);
    const colorsDir = join(cwd, ".claude/colors");
    writeFileSync(
      join(colorsDir, "color-data.json"),
      JSON.stringify(lightData, null, 2),
      "utf-8",
    );
    log.success("color-data.json (light mode — Playwright)");

    // Dark mode extraction
    await page.emulateMedia({ colorScheme: "dark" });
    // Brief wait for CSS transitions
    await page.waitForTimeout(500);

    const darkData = await page.evaluate(COLOR_EXTRACTION_SCRIPT);
    writeFileSync(
      join(colorsDir, "color-data-dark.json"),
      JSON.stringify(darkData, null, 2),
      "utf-8",
    );
    log.success("color-data-dark.json (dark mode — Playwright)");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.warn(`Playwright color extraction failed: ${msg}`);
    // Not fatal — Phase 0 safety net will create defaults if needed
  } finally {
    if (browser) await browser.close();
  }
}
