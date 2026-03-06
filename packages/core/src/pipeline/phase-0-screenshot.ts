import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  extractColors,
  extractBrand,
  extractFonts,
  extractIcons,
  extractBackgrounds,
  captureScreenshots,
} from "./color-extractor.js";
import { log } from "../ui/logger.js";
import { updateStatus } from "../ui/tui.js";
import type { PipelineContext, PhaseResult } from "./types.js";

const DEFAULT_FONT_DATA = JSON.stringify({
  fontFaces: [],
  roles: {
    body: "system-ui, -apple-system, sans-serif",
    heading: "system-ui, -apple-system, sans-serif",
    mono: '"SF Mono", ui-monospace, monospace',
  },
}, null, 2);

const DEFAULT_ICON_DATA = JSON.stringify({
  library: "none",
  icons: [],
  count: 0,
}, null, 2);

const DEFAULT_BRAND_DATA = JSON.stringify({
  companyName: null,
  tagline: null,
  description: null,
  logoUrl: null,
  faviconUrl: null,
  ogImageUrl: null,
  aboutText: "",
}, null, 2);

const DEFAULT_COLOR_DATA = JSON.stringify({
  backgrounds: { page: null, header: null, card: null, footer: null },
  text: { heading: null, body: null, muted: null, link: null },
  accents: { primary: null, primaryText: null },
  borders: { default: null },
  surfaces: { input: null },
}, null, 2);

// ── Phase 0 substep tracking (kept for orchestrator compat) ─────────

export function createPhase0EventHandler(
  _ctx: PipelineContext,
  outerOnEvent?: (event: Record<string, unknown>) => void,
): (event: Record<string, unknown>) => void {
  return (event: Record<string, unknown>) => {
    if (outerOnEvent) outerOnEvent(event);
  };
}

// ── Main ─────────────────────────────────────────────────────────────

export async function runPhase0(
  ctx: PipelineContext,
  _onEvent?: (event: Record<string, unknown>) => void,
): Promise<PhaseResult> {
  const start = Date.now();
  const screenshotDir = join(ctx.cwd, ctx.screenshotDir);

  try {
    // ── All extraction is deterministic via agent-browser ──
    // The browser session is opened by extractColors and reused by all subsequent calls.

    updateStatus("Extracting colors...");
    await extractColors(ctx.url, ctx.cwd);

    updateStatus("Extracting brand data...");
    await extractBrand(ctx.url, ctx.cwd);

    updateStatus("Extracting fonts...");
    await extractFonts(ctx.url, ctx.cwd);

    updateStatus("Extracting icons...");
    await extractIcons(ctx.cwd);

    updateStatus("Extracting backgrounds...");
    await extractBackgrounds(ctx.cwd);

    // Screenshots (replicate mode only)
    if (ctx.mode === "replicate") {
      updateStatus("Capturing screenshots...");
      await captureScreenshots(ctx.cwd);
    }

    // Close browser — all extraction is done
    try {
      execSync("agent-browser close", { stdio: "pipe", timeout: 5_000 });
    } catch { /* browser may already be closed */ }

    // ── Safety nets: write defaults for any missing files ──

    const colorsDir = join(ctx.cwd, ".claude/colors");
    const colorDataPath = join(colorsDir, "color-data.json");
    if (!existsSync(colorDataPath)) {
      writeFileSync(colorDataPath, DEFAULT_COLOR_DATA, "utf-8");
      log.warn("color-data.json — wrote default (extraction failed)");
    }

    const fontDataPath = join(ctx.cwd, ".claude/fonts/font-data.json");
    if (!existsSync(fontDataPath)) {
      writeFileSync(fontDataPath, DEFAULT_FONT_DATA, "utf-8");
      log.warn("font-data.json — wrote default (system fonts)");
    }

    const brandDataPath = join(ctx.cwd, ".claude/branding/brand-data.json");
    if (!existsSync(brandDataPath)) {
      let defaultBrand = JSON.parse(DEFAULT_BRAND_DATA);
      try {
        const u = new URL(ctx.url);
        const domain = u.hostname.replace(/^www\./, "");
        defaultBrand.companyName = domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1);
      } catch { /* ignore */ }
      writeFileSync(brandDataPath, JSON.stringify(defaultBrand, null, 2), "utf-8");
      log.warn("brand-data.json — wrote default from URL");
    }

    const iconDataPath = join(ctx.cwd, ".claude/icons/icon-data.json");
    if (!existsSync(iconDataPath)) {
      writeFileSync(iconDataPath, DEFAULT_ICON_DATA, "utf-8");
      log.warn("icon-data.json — wrote default (no icons)");
    }

    // ── Validation summary ──

    // Validate based on mode
    let valid: boolean;
    if (ctx.mode === "replicate") {
      valid = existsSync(join(screenshotDir, "full-page.png"));
      if (!valid) {
        log.error("full-page.png not found — screenshot capture failed");
      }
    } else {
      valid = existsSync(colorDataPath);
      if (!valid) {
        log.warn("color-data.json not found — will use defaults");
        valid = true; // Not fatal in design-system mode
      }
    }

    // Log summaries
    try {
      const iconData = JSON.parse(readFileSync(iconDataPath, "utf-8"));
      log.success(`icon-data.json: library="${iconData?.library ?? "none"}", ${iconData?.count ?? 0} icons`);
    } catch { /* ignore */ }

    try {
      const fontData = JSON.parse(readFileSync(fontDataPath, "utf-8"));
      const roles = fontData?.roles;
      log.success(`font-data.json: ${fontData?.fontFaces?.length ?? 0} faces, roles: ${roles ? Object.keys(roles).join("/") : "none"}`);
    } catch { /* ignore */ }

    try {
      const brandData = JSON.parse(readFileSync(brandDataPath, "utf-8"));
      log.success(`brand-data.json: ${brandData?.companyName ? `"${brandData.companyName}"` : "no company name"}`);
    } catch { /* ignore */ }

    return {
      phase: "phase-0-screenshot",
      success: valid,
      duration: Date.now() - start,
      costUsd: 0, // Fully deterministic — zero API cost
      error: valid ? undefined : "Screenshot file not created",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(msg);
    return {
      phase: "phase-0-screenshot",
      success: false,
      duration: Date.now() - start,
      error: msg,
    };
  }
}
