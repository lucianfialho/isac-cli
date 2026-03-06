import { execSync } from "node:child_process";
import { existsSync, writeFileSync, unlinkSync, statSync } from "node:fs";
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
 * This script is evaluated via agent-browser eval in the browser context.
 * It extracts all color data from the live DOM using getComputedStyle.
 * It's a constant — same script, every time, deterministic.
 *
 * Note: TypeScript annotations are stripped at compile time by tsup.
 * At runtime, .toString() returns valid JavaScript for agent-browser eval.
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

// ── Brand extraction script (runs inside the browser) ───────────────

/**
 * Extracts brand data: logo, favicon, OG image, company name, description.
 * Deterministic — same script, every time.
 */
export const BRAND_EXTRACTION_SCRIPT = () => {
  const meta = (name: string): string | null => {
    const el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
    return el?.getAttribute("content") || null;
  };

  // Company name: og:site_name → og:title → <title> (cleaned)
  let companyName = meta("og:site_name") || meta("og:title") || document.title || null;
  if (companyName) {
    // Clean common suffixes: "YouTube - Broadcast Yourself" → "YouTube"
    companyName = companyName.split(/\s*[-–|]\s*/)[0].trim();
  }

  // Description
  const description = meta("og:description") || meta("description") || "";

  // Tagline: og:description or meta description, truncated
  const tagline = description.length > 200 ? description.slice(0, 197) + "..." : description;

  // OG image
  const ogImageUrl = meta("og:image") || null;

  // Favicon: prefer 32x32, then apple-touch-icon, then any link[rel*="icon"]
  let faviconUrl: string | null = null;
  const faviconCandidates = document.querySelectorAll(
    'link[rel="icon"][sizes="32x32"], link[rel="apple-touch-icon"], link[rel*="icon"]'
  );
  for (const el of faviconCandidates) {
    const href = el.getAttribute("href");
    if (href) {
      try {
        faviconUrl = new URL(href, document.location.href).href;
        break;
      } catch { /* skip bad URLs */ }
    }
  }

  // Logo: find logo in header/nav
  let logoUrl: string | null = null;
  let logoSvg: string | null = null;
  let logoTextFill: string | null = null;

  const headerEl = document.querySelector("header, nav, [role=banner]");
  const searchRoot = headerEl || document.body;

  /** Check if an element or its ancestors have "logo" in class/id/aria-label */
  const hasLogoContext = (el: Element): boolean => {
    let cur: Element | null = el;
    for (let i = 0; i < 4 && cur; i++) {
      const cls = (cur.className?.toString?.() || "").toLowerCase();
      const id = (cur.id || "").toLowerCase();
      const label = (cur.getAttribute("aria-label") || "").toLowerCase();
      if (cls.includes("logo") || id.includes("logo") || label.includes("logo")) return true;
      cur = cur.parentElement;
    }
    return false;
  };

  /** Check if SVG looks like a common icon (hamburger, close, search, etc.) */
  const isIconSvg = (svg: SVGElement): boolean => {
    const rect = svg.getBoundingClientRect();
    // Icons are typically square and small (< 32px)
    const isSmallSquare = rect.width < 36 && rect.height < 36 && Math.abs(rect.width - rect.height) < 8;
    // Check for icon-related attributes
    const cls = (svg.className?.baseVal || "").toLowerCase();
    const label = (svg.getAttribute("aria-label") || "").toLowerCase();
    const iconKeywords = ["menu", "hamburger", "close", "search", "bell", "notification", "arrow", "chevron", "caret"];
    const hasIconClass = iconKeywords.some(k => cls.includes(k) || label.includes(k));
    return isSmallSquare || hasIconClass;
  };

  // 1. Try <img> with logo in alt/class/src/id
  const imgs = searchRoot.querySelectorAll("img");
  for (const img of imgs) {
    const alt = (img.getAttribute("alt") || "").toLowerCase();
    const cls = (img.className || "").toLowerCase();
    const src = (img.getAttribute("src") || "").toLowerCase();
    const id = (img.id || "").toLowerCase();
    if (alt.includes("logo") || cls.includes("logo") || src.includes("logo") || id.includes("logo")) {
      try {
        logoUrl = new URL(img.getAttribute("src") || "", document.location.href).href;
        break;
      } catch { /* skip */ }
    }
  }

  // 2. Try <a> or <div> with "logo" in class — check for img or SVG inside
  if (!logoUrl && !logoSvg) {
    const logoContainers = searchRoot.querySelectorAll(
      '[class*="logo"], [id*="logo"], [aria-label*="logo"], [aria-label*="Logo"], a[href="/"]'
    );
    for (const container of logoContainers) {
      const img = container.querySelector("img");
      if (img?.getAttribute("src")) {
        try {
          logoUrl = new URL(img.getAttribute("src") || "", document.location.href).href;
          break;
        } catch { /* skip */ }
      }
      const svg = container.querySelector("svg");
      if (svg) {
        const rect = svg.getBoundingClientRect();
        if (rect.width >= 20 && rect.height >= 10) {
          logoSvg = svg.outerHTML;
          const svgColor = getComputedStyle(svg).color;
          if (svgColor) {
            const rgbMatch = svgColor.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/);
            if (rgbMatch) {
              logoTextFill = "#" + [rgbMatch[1], rgbMatch[2], rgbMatch[3]]
                .map(x => (+x).toString(16).padStart(2, "0")).join("");
            }
          }
          break;
        }
      }
    }
  }

  // 3. Fallback: find the widest non-icon SVG in header (logos are usually wider than icons)
  if (!logoUrl && !logoSvg && headerEl) {
    let bestSvg: SVGElement | null = null;
    let bestWidth = 0;
    const svgs = headerEl.querySelectorAll("svg");
    for (const svg of svgs) {
      if (isIconSvg(svg)) continue;
      // Prefer SVGs with logo context
      if (hasLogoContext(svg)) {
        bestSvg = svg;
        break;
      }
      const rect = svg.getBoundingClientRect();
      // Must be wider than tall (logos are horizontal) and visible
      if (rect.width > 40 && rect.width > rect.height * 1.2 && rect.width > bestWidth) {
        bestSvg = svg;
        bestWidth = rect.width;
      }
    }
    if (bestSvg) {
      logoSvg = bestSvg.outerHTML;
      // Capture computed color so we can inject fill for paths without one
      const svgColor = getComputedStyle(bestSvg).color;
      if (svgColor) {
        const rgbMatch = svgColor.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
          logoTextFill = "#" + [rgbMatch[1], rgbMatch[2], rgbMatch[3]]
            .map(x => (+x).toString(16).padStart(2, "0")).join("");
        }
      }
    }
  }

  return {
    companyName,
    tagline,
    description,
    logoUrl,
    logoSvg,
    logoTextFill,
    faviconUrl,
    ogImageUrl,
    aboutText: "",
  };
};

/** Parse agent-browser eval output (may be double-stringified) and re-format with indentation */
function formatJson(raw: string): string {
  try {
    let parsed = JSON.parse(raw);
    // Handle double-stringified JSON
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return raw; // Return as-is if unparseable
  }
}

// ── Main extraction function ────────────────────────────────────────

export async function extractColors(url: string, cwd: string): Promise<void> {
  // Build the JS expression: IIFE that returns an object.
  // agent-browser eval serializes the return value as JSON automatically,
  // so we must NOT wrap in JSON.stringify (that causes double-stringification).
  // TypeScript annotations are stripped by tsup at build time, so .toString() is valid JS.
  const scriptExpr = `(${COLOR_EXTRACTION_SCRIPT.toString()})()`;

  try {
    // Navigate and wait for load
    execSync(`agent-browser open "${url}"`, { stdio: "pipe", timeout: 30_000 });
    execSync("agent-browser wait --load networkidle", { stdio: "pipe", timeout: 30_000 });
    execSync("agent-browser set viewport 1440 900", { stdio: "pipe" });

    // Light mode extraction
    const lightRaw = execSync("agent-browser eval --stdin", {
      input: scriptExpr,
      encoding: "utf-8",
      timeout: 15_000,
    }).trim();

    // agent-browser serializes return values as JSON — re-format with indentation
    const colorsDir = join(cwd, ".claude/colors");
    writeFileSync(join(colorsDir, "color-data.json"), formatJson(lightRaw), "utf-8");
    log.success("color-data.json (light mode — agent-browser)");

    // Dark mode extraction
    execSync("agent-browser set media dark", { stdio: "pipe" });
    execSync("agent-browser wait 500", { stdio: "pipe" });

    const darkRaw = execSync("agent-browser eval --stdin", {
      input: scriptExpr,
      encoding: "utf-8",
      timeout: 15_000,
    }).trim();

    writeFileSync(join(colorsDir, "color-data-dark.json"), formatJson(darkRaw), "utf-8");
    log.success("color-data-dark.json (dark mode — agent-browser)");

    // Reset to light mode — Claude agent will reuse this browser session
    execSync("agent-browser set media light", { stdio: "pipe" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.warn(`agent-browser color extraction failed: ${msg}`);
    // Not fatal — Phase 0 safety net will create defaults if needed
  }
}

// ── Deterministic brand extraction ──────────────────────────────────

export async function extractBrand(url: string, cwd: string): Promise<void> {
  const scriptExpr = `(${BRAND_EXTRACTION_SCRIPT.toString()})()`;

  try {
    const rawOutput = execSync("agent-browser eval --stdin", {
      input: scriptExpr,
      encoding: "utf-8",
      timeout: 15_000,
    }).trim();

    let brand: Record<string, unknown>;
    try {
      let parsed = JSON.parse(rawOutput);
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
      brand = parsed;
    } catch {
      log.warn("brand extraction: failed to parse eval output");
      return;
    }

    // If we got an inline SVG logo, save it to public/logo.svg and set logoUrl
    if (!brand.logoUrl && brand.logoSvg) {
      let svgContent = brand.logoSvg as string;

      // Clean up inline styles meant for the original page's inline rendering.
      // These cause sizing/display issues when loaded as <img>.
      svgContent = svgContent.replace(/\s*style="[^"]*"/g, "");
      svgContent = svgContent.replace(/\s*focusable="[^"]*"/g, "");
      svgContent = svgContent.replace(/\s*aria-hidden="[^"]*"/g, "");

      // SVG paths without explicit fill inherit currentColor, which works inline
      // but defaults to black in <img> (invisible on dark bg).
      // Add fill= on the root <svg> as a default — paths with explicit fill override it.
      const textFill = (brand.logoTextFill as string) || "#ffffff";
      svgContent = svgContent.replace(/^<svg /, `<svg fill="${textFill}" `);

      const svgPath = join(cwd, "public/logo.svg");
      writeFileSync(svgPath, svgContent, "utf-8");
      brand.logoUrl = "/logo.svg";
      log.success("logo.svg extracted (inline SVG)");
    }

    // Remove internal fields from the JSON output
    delete brand.logoSvg;
    delete brand.logoTextFill;

    const brandDir = join(cwd, ".claude/branding");
    writeFileSync(join(brandDir, "brand-data.json"), JSON.stringify(brand, null, 2), "utf-8");
    log.success(`brand-data.json (deterministic — ${brand.companyName || "unknown"})`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.warn(`agent-browser brand extraction failed: ${msg}`);
  }
}

// ── Font extraction script ──────────────────────────────────────────

export const FONT_EXTRACTION_SCRIPT = () => {
  const fonts: Array<{ family: string; url?: string; weight: string; style: string; source: string }> = [];
  const seen = new Set<string>();

  // Strategy A: CSSFontFaceRule
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule instanceof CSSFontFaceRule) {
          const family = rule.style.getPropertyValue("font-family").replace(/['"]/g, "");
          const src = rule.style.getPropertyValue("src");
          const weight = rule.style.getPropertyValue("font-weight") || "400";
          const style = rule.style.getPropertyValue("font-style") || "normal";
          const urlMatch = src.match(/url\("([^"]+)"\)/);
          const key = family + "|" + weight;
          if (!seen.has(key) && urlMatch && !family.includes("Fallback")) {
            seen.add(key);
            fonts.push({ family, url: new URL(urlMatch[1], location.href).href, weight, style, source: "CSSFontFaceRule" });
          }
        }
      }
    } catch (_e) { /* CORS blocked */ }
  }

  // Strategy B: Font Loading API (fallback)
  if (fonts.length === 0) {
    for (const face of document.fonts) {
      const family = face.family.replace(/['"]/g, "");
      const key = family + "|" + (face.weight || "400");
      if (!seen.has(key) && !family.includes("Fallback") && face.status === "loaded") {
        seen.add(key);
        fonts.push({ family, weight: face.weight || "400", style: face.style || "normal", source: "FontLoadingAPI" });
      }
    }
  }

  // Strategy C: Google Fonts link detection
  const gfLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]');
  for (const link of gfLinks) {
    const href = link.getAttribute("href") || "";
    const familyMatch = href.match(/family=([^&:]+)/);
    if (familyMatch) {
      const families = familyMatch[1].split("|");
      for (const f of families) {
        const name = decodeURIComponent(f.split(":")[0].replace(/\+/g, " "));
        const key = name + "|400";
        if (!seen.has(key)) {
          seen.add(key);
          fonts.push({ family: name, source: "GoogleFonts", weight: "400", style: "normal" });
        }
      }
    }
  }

  // Role detection
  const bodyFont = getComputedStyle(document.body).fontFamily;
  const h1El = document.querySelector('h1, h2, [class*="heading"], [class*="title"]');
  const headingFont = h1El ? getComputedStyle(h1El).fontFamily : bodyFont;
  const codeEl = document.querySelector('code, pre, [class*="mono"]');
  const monoFont = codeEl ? getComputedStyle(codeEl).fontFamily : '"SF Mono", monospace';

  return {
    fontFaces: fonts,
    roles: { body: bodyFont, heading: headingFont, mono: monoFont },
  };
};

// ── Icon extraction script ──────────────────────────────────────────

export const ICON_EXTRACTION_SCRIPT = () => {
  const result = { library: "none" as string, icons: [] as string[], count: 0 };

  // Lucide
  const lucide = document.querySelectorAll('[data-lucide], svg.lucide, [class*="lucide-"]');
  if (lucide.length > 0) {
    const names = new Set<string>();
    lucide.forEach(el => {
      const dl = el.getAttribute("data-lucide");
      if (dl) names.add(dl);
      el.classList.forEach(c => { if (c.startsWith("lucide-") && c !== "lucide-icon") names.add(c.replace("lucide-", "")); });
    });
    return { library: "lucide", icons: [...names], count: lucide.length };
  }

  // Heroicons
  const heroicons = document.querySelectorAll('[class*="heroicon-"], svg[data-slot]');
  if (heroicons.length > 0) {
    const names = new Set<string>();
    heroicons.forEach(el => {
      el.classList.forEach(c => { if (c.startsWith("heroicon-")) names.add(c); });
      const slot = el.getAttribute("data-slot");
      if (slot) names.add(slot);
    });
    return { library: "heroicons", icons: [...names], count: heroicons.length };
  }

  // Font Awesome
  const fa = document.querySelectorAll('[class*="fa-"]');
  if (fa.length > 0) {
    const skip = new Set(["fa-solid", "fa-regular", "fa-light", "fa-thin", "fa-duotone", "fa-brands", "fa-sharp", "fa-fw", "fa-lg", "fa-xl", "fa-2x", "fa-3x", "fa-4x", "fa-5x"]);
    const names = new Set<string>();
    fa.forEach(el => {
      el.classList.forEach(c => { if (c.startsWith("fa-") && !skip.has(c)) names.add(c.replace("fa-", "")); });
    });
    return { library: "font-awesome", icons: [...names], count: fa.length };
  }

  // Material Icons
  const material = document.querySelectorAll(".material-icons, .material-icons-outlined, .material-icons-round, .material-icons-sharp, .material-symbols-outlined, .material-symbols-rounded, .material-symbols-sharp");
  if (material.length > 0) {
    const names = new Set<string>();
    material.forEach(el => { const t = (el.textContent || "").trim(); if (t) names.add(t); });
    return { library: "material-icons", icons: [...names], count: material.length };
  }

  // Generic SVGs
  const svgs = document.querySelectorAll("svg");
  if (svgs.length > 3) {
    const names = new Set<string>();
    svgs.forEach(el => {
      const label = el.getAttribute("aria-label");
      if (label) names.add(label);
    });
    result.library = "svg";
    result.icons = [...names];
    result.count = svgs.length;
  }

  return result;
};

// ── Deterministic font extraction ───────────────────────────────────

export async function extractFonts(url: string, cwd: string): Promise<void> {
  const scriptExpr = `(${FONT_EXTRACTION_SCRIPT.toString()})()`;

  try {
    const rawOutput = execSync("agent-browser eval --stdin", {
      input: scriptExpr,
      encoding: "utf-8",
      timeout: 15_000,
    }).trim();

    let fontData: { fontFaces: Array<{ family: string; url?: string; weight: string; style: string }>; roles: Record<string, string> };
    try {
      let parsed = JSON.parse(rawOutput);
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
      fontData = parsed;
    } catch {
      log.warn("font extraction: failed to parse eval output");
      return;
    }

    // Download woff2 files
    const fontsDir = join(cwd, "public/fonts");
    let downloaded = 0;
    for (const face of fontData.fontFaces) {
      if (!face.url) continue;
      const fileName = face.family.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "");
      const weight = face.weight || "400";
      const outFile = join(fontsDir, `${fileName}-${weight}.woff2`);
      try {
        execSync(`curl -sL -H "Referer: ${url}" -o "${outFile}" "${face.url}"`, {
          stdio: "pipe",
          timeout: 15_000,
        });
        // Validate: delete if it's HTML (CORS redirect) or too small
        if (existsSync(outFile)) {
          const size = statSync(outFile).size;
          if (size < 100) {
            unlinkSync(outFile);
          } else {
            downloaded++;
          }
        }
      } catch { /* download failed — not fatal */ }
    }

    // Write font-data.json
    const fontDataJson = {
      fontFaces: fontData.fontFaces.map(f => ({
        family: f.family,
        url: f.url,
        weight: f.weight,
        style: f.style,
      })),
      roles: fontData.roles,
    };
    writeFileSync(join(cwd, ".claude/fonts/font-data.json"), JSON.stringify(fontDataJson, null, 2), "utf-8");
    log.success(`font-data.json (${fontData.fontFaces.length} faces, ${downloaded} downloaded)`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.warn(`agent-browser font extraction failed: ${msg}`);
  }
}

// ── Deterministic icon extraction ───────────────────────────────────

export async function extractIcons(cwd: string): Promise<void> {
  const scriptExpr = `(${ICON_EXTRACTION_SCRIPT.toString()})()`;

  try {
    const rawOutput = execSync("agent-browser eval --stdin", {
      input: scriptExpr,
      encoding: "utf-8",
      timeout: 15_000,
    }).trim();

    let iconData: { library: string; icons: string[]; count: number };
    try {
      let parsed = JSON.parse(rawOutput);
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
      iconData = parsed;
    } catch {
      log.warn("icon extraction: failed to parse eval output");
      return;
    }

    writeFileSync(join(cwd, ".claude/icons/icon-data.json"), JSON.stringify(iconData, null, 2), "utf-8");
    log.success(`icon-data.json (${iconData.library}, ${iconData.count} icons)`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.warn(`agent-browser icon extraction failed: ${msg}`);
  }
}

// ── Background extraction script (runs inside the browser) ──────────

/**
 * Extracts background styles from visible page sections.
 * Captures background-color, gradients, and images from hero, feature,
 * pricing, CTA, footer, and other major sections.
 */
export const BACKGROUND_EXTRACTION_SCRIPT = () => {
  const rgbToHex = (rgb: string): string => {
    const m = rgb.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return rgb;
    return "#" + [m[1], m[2], m[3]].map(x => (+x).toString(16).padStart(2, "0")).join("");
  };

  const isTransparent = (val: string): boolean => {
    return !val || val === "transparent" || val === "rgba(0, 0, 0, 0)" || val === "rgba(0,0,0,0)";
  };

  const getSectionLabel = (el: Element): string | null => {
    const text = (
      (el.className?.toString?.() || "") + " " +
      (el.id || "") + " " +
      (el.getAttribute("aria-label") || "") + " " +
      (el.getAttribute("data-section") || "")
    ).toLowerCase();

    if (text.match(/hero|banner|jumbotron|splash/)) return "Hero";
    if (text.match(/feature|benefit|capability/)) return "Features";
    if (text.match(/pricing|plan|tier/)) return "Pricing";
    if (text.match(/testimonial|review|quote/)) return "Testimonials";
    if (text.match(/cta|call.?to.?action|signup|subscribe/)) return "CTA";
    if (text.match(/faq|question|accordion/)) return "FAQ";
    if (text.match(/contact|form|get.?in.?touch/)) return "Contact";
    if (text.match(/about|team|story/)) return "About";
    if (text.match(/partner|client|logo|trust/)) return "Partners";
    if (text.match(/stat|number|metric|counter/)) return "Stats";
    return null;
  };

  const sections: Array<{
    label: string;
    tag: string;
    bgColor: string | null;
    bgGradient: string | null;
    bgImage: string | null;
    bgSize: string | null;
    bgPosition: string | null;
    textColor: string | null;
    borderBottom: string | null;
    hasOverlay: boolean;
    rect: { top: number; height: number };
  }> = [];

  const seen = new Set<string>();

  // Gather candidate sections
  const candidates = document.querySelectorAll(
    "section, [class*='section'], [class*='Section'], " +
    "header, footer, main > div, " +
    "[class*='hero'], [class*='Hero'], " +
    "[class*='banner'], [class*='Banner'], " +
    "[class*='cta'], [class*='CTA'], " +
    "[class*='pricing'], [class*='Pricing'], " +
    "[class*='feature'], [class*='Feature'], " +
    "[class*='testimonial'], [class*='Testimonial']"
  );

  for (const el of candidates) {
    const rect = el.getBoundingClientRect();
    // Skip tiny/invisible elements
    if (rect.height < 100 || rect.width < 200) continue;

    const s = getComputedStyle(el);
    const bgColor = s.backgroundColor;
    const bgImage = s.backgroundImage;
    const hasColor = !isTransparent(bgColor);
    const hasGradient = bgImage !== "none" && bgImage.includes("gradient");
    const hasBgImage = bgImage !== "none" && (bgImage.includes("url(") || hasGradient);

    // Skip sections with no interesting background
    if (!hasColor && !hasBgImage) continue;

    // Deduplicate by approximate position
    const posKey = `${Math.round(rect.top / 50)}-${Math.round(rect.height / 50)}`;
    if (seen.has(posKey)) continue;
    seen.add(posKey);

    // Determine label
    let label = getSectionLabel(el);
    if (!label) {
      const tag = el.tagName.toLowerCase();
      if (tag === "header" || (tag === "nav" && rect.top < 100)) label = "Header";
      else if (tag === "footer") label = "Footer";
      else if (rect.top < 200) label = "Hero";
      else label = `Section (${Math.round(rect.top)}px)`;
    }

    // Check for overlay pseudo-elements
    const before = getComputedStyle(el, "::before");
    const after = getComputedStyle(el, "::after");
    const hasOverlay = (
      (!isTransparent(before.backgroundColor) && before.position === "absolute") ||
      (!isTransparent(after.backgroundColor) && after.position === "absolute") ||
      (before.backgroundImage !== "none" && before.position === "absolute") ||
      (after.backgroundImage !== "none" && after.position === "absolute")
    );

    // Get text color from first visible heading or paragraph
    let textColor: string | null = null;
    const heading = el.querySelector("h1, h2, h3, p");
    if (heading) {
      textColor = rgbToHex(getComputedStyle(heading).color);
    }

    sections.push({
      label,
      tag: el.tagName.toLowerCase(),
      bgColor: hasColor ? rgbToHex(bgColor) : null,
      bgGradient: hasGradient ? bgImage : null,
      bgImage: bgImage.includes("url(") ? bgImage : null,
      bgSize: s.backgroundSize !== "auto" ? s.backgroundSize : null,
      bgPosition: s.backgroundPosition !== "0% 0%" ? s.backgroundPosition : null,
      textColor,
      borderBottom: s.borderBottomWidth !== "0px" ? `${s.borderBottomWidth} ${s.borderBottomStyle} ${rgbToHex(s.borderBottomColor)}` : null,
      hasOverlay,
      rect: { top: Math.round(rect.top), height: Math.round(rect.height) },
    });
  }

  // Sort by vertical position
  sections.sort((a, b) => a.rect.top - b.rect.top);

  // Also capture the page-level background
  const bodyBg = getComputedStyle(document.body).backgroundColor;
  const htmlBg = getComputedStyle(document.documentElement).backgroundColor;

  return {
    pageBackground: !isTransparent(bodyBg) ? rgbToHex(bodyBg) : (!isTransparent(htmlBg) ? rgbToHex(htmlBg) : "#ffffff"),
    sections,
  };
};

// ── Deterministic background extraction ─────────────────────────────

export async function extractBackgrounds(cwd: string): Promise<void> {
  const scriptExpr = `(${BACKGROUND_EXTRACTION_SCRIPT.toString()})()`;

  try {
    const rawOutput = execSync("agent-browser eval --stdin", {
      input: scriptExpr,
      encoding: "utf-8",
      timeout: 15_000,
    }).trim();

    let bgData: Record<string, unknown>;
    try {
      let parsed = JSON.parse(rawOutput);
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
      bgData = parsed;
    } catch {
      log.warn("background extraction: failed to parse eval output");
      return;
    }

    const bgDir = join(cwd, ".claude/backgrounds");
    writeFileSync(join(bgDir, "background-data.json"), JSON.stringify(bgData, null, 2), "utf-8");
    const sectionCount = Array.isArray(bgData.sections) ? bgData.sections.length : 0;
    log.success(`background-data.json (${sectionCount} sections)`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.warn(`agent-browser background extraction failed: ${msg}`);
  }
}

// ── Deterministic screenshot capture (replicate mode) ───────────────

export async function captureScreenshots(cwd: string): Promise<void> {
  const screenshotDir = join(cwd, ".claude/screenshots");

  try {
    // Light mode full-page
    execSync(`agent-browser screenshot --full "${join(screenshotDir, "full-page.png")}"`, {
      stdio: "pipe",
      timeout: 30_000,
    });
    log.success("full-page.png (light)");

    // Dark mode
    execSync("agent-browser set media dark", { stdio: "pipe" });
    execSync("agent-browser wait 500", { stdio: "pipe" });
    execSync(`agent-browser screenshot --full "${join(screenshotDir, "full-page-dark.png")}"`, {
      stdio: "pipe",
      timeout: 30_000,
    });
    log.success("full-page-dark.png (dark)");

    // Reset to light mode
    execSync("agent-browser set media light", { stdio: "pipe" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.warn(`screenshot capture failed: ${msg}`);
  }
}
