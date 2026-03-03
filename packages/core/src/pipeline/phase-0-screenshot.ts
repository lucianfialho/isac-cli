import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { runClaudePhase } from "./claude-runner.js";
import { PHASE_0_TOOLS } from "./tools.js";
import { getScreenshotPrompt } from "../prompts/screenshot-capturer.js";
import { extractColors } from "./color-extractor.js";
import { log } from "../ui/logger.js";
import { logLine, updateStatus } from "../ui/tui.js";
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

// ── Phase 0 substep tracking ──────────────────────────────────────

interface WatchedFile {
  path: string;
  label: string;
  replicateOnly?: boolean;
}

const WATCHED_FILES: WatchedFile[] = [
  { path: ".claude/fonts/font-data.json", label: "font-data.json" },
  { path: ".claude/branding/brand-data.json", label: "brand-data.json" },
  { path: ".claude/icons/icon-data.json", label: "icon-data.json" },
  { path: ".claude/colors/color-data.json", label: "color-data.json (light)" },
  { path: ".claude/colors/color-data-dark.json", label: "color-data-dark.json (dark)" },
  { path: ".claude/screenshots/full-page.png", label: "full-page.png (light)", replicateOnly: true },
  { path: ".claude/screenshots/full-page-dark.png", label: "full-page-dark.png (dark)", replicateOnly: true },
];

/**
 * Creates an enhanced event handler for Phase 0 that updates the spinner
 * status based on detected tool calls, providing granular substep feedback.
 */
export function createPhase0EventHandler(
  ctx: PipelineContext,
  outerOnEvent?: (event: Record<string, unknown>) => void,
): (event: Record<string, unknown>) => void {
  let evalScriptCount = 0;

  return (event: Record<string, unknown>) => {
    // Always forward to the outer handler (renderEvent via orchestrator)
    if (outerOnEvent) outerOnEvent(event);

    const type = event.type as string | undefined;
    if (type !== "assistant" || event.subtype !== "tool_use") return;

    const toolName = (event.tool_name as string) ?? "";

    if (toolName.includes("navigate_page")) {
      updateStatus("Navigating to page...");
    } else if (toolName.includes("emulate")) {
      updateStatus("Emulating dark mode...");
    } else if (toolName.includes("evaluate_script")) {
      evalScriptCount++;
      if (evalScriptCount <= 4) {
        updateStatus("Extracting fonts...");
      } else if (evalScriptCount === 5) {
        updateStatus("Extracting brand data...");
      } else if (evalScriptCount === 6) {
        updateStatus("Extracting icons...");
      } else {
        updateStatus("Extracting colors...");
      }
    } else if (toolName.includes("take_screenshot")) {
      updateStatus("Taking screenshots...");
    }
  };
}

export async function runPhase0(
  ctx: PipelineContext,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<PhaseResult> {
  const start = Date.now();

  // Directories are created by the orchestrator before Phase 0 runs
  const screenshotDir = join(ctx.cwd, ctx.screenshotDir);
  const fontsDir = join(ctx.cwd, ".claude/fonts");

  try {
    // Step 0: Deterministic color extraction via Playwright (before Claude agent)
    updateStatus("Extracting colors (Playwright)...");
    await extractColors(ctx.url, ctx.cwd);

    // File poller: check for created artifacts every 3s and log them
    const seen = new Set<string>();
    const poller = setInterval(() => {
      for (const { path, label, replicateOnly } of WATCHED_FILES) {
        if (replicateOnly && ctx.mode !== "replicate") continue;
        const full = join(ctx.cwd, path);
        if (!seen.has(path) && existsSync(full)) {
          seen.add(path);
          logLine(chalk.green(`    ✓ ${label}`));
        }
      }
    }, 3_000);

    let result: Awaited<ReturnType<typeof runClaudePhase>>;
    try {
      result = await runClaudePhase(
        {
          name: "phase-0-screenshot",
          prompt: getScreenshotPrompt(ctx.url, ctx.mode),
          allowedTools: [...PHASE_0_TOOLS],
          model: "claude-sonnet-4-6",
          timeout: 300_000, // 5 min — font/brand/icon/color extraction + dark mode emulation
          maxTurns: 30,
          activityTimeout: 180_000, // Chrome MCP startup + page load can have long gaps
        },
        ctx.cwd,
        ctx.sessionId,
        onEvent,
      );
    } finally {
      clearInterval(poller);
    }

    // Update session ID for chaining
    ctx.sessionId = result.sessionId;

    // Validate based on mode
    const colorsDir = join(ctx.cwd, ".claude/colors");
    const colorDataPath = join(colorsDir, "color-data.json");
    let valid: boolean;

    if (ctx.mode === "replicate") {
      // Replicate mode: screenshots are required
      const fullPagePath = join(screenshotDir, "full-page.png");
      valid = existsSync(fullPagePath);

      if (valid) {
        log.success("full-page.png (light)");
        const darkPath = join(screenshotDir, "full-page-dark.png");
        if (existsSync(darkPath)) {
          log.success("full-page-dark.png (dark)");
        }
      } else {
        log.error("full-page.png not found — screenshot capture failed");
      }
    } else {
      // Design system mode: color-data.json is required (no screenshots)
      valid = existsSync(colorDataPath);

      if (valid) {
        log.success("color-data.json (light mode colors)");
        const darkColorPath = join(colorsDir, "color-data-dark.json");
        if (existsSync(darkColorPath)) {
          log.success("color-data-dark.json (dark mode colors)");
        }
      } else {
        log.warn("color-data.json not found — will use defaults");
        // Not fatal in design-system mode — safety net below will create defaults
        valid = true;
      }
    }

    // Safety net: create default font-data.json if agent didn't write it
    const fontDataPath = join(fontsDir, "font-data.json");
    if (!existsSync(fontDataPath)) {
      writeFileSync(fontDataPath, DEFAULT_FONT_DATA, "utf-8");
      log.warn("font-data.json not created by agent — wrote default (system fonts)");
    }

    // Safety net: create default brand-data.json if agent didn't write it
    const brandDir = join(ctx.cwd, ".claude/branding");
    const brandDataPath = join(brandDir, "brand-data.json");
    if (!existsSync(brandDataPath)) {
      // Try to populate companyName from URL
      let defaultBrand = JSON.parse(DEFAULT_BRAND_DATA);
      try {
        const u = new URL(ctx.url);
        const domain = u.hostname.replace(/^www\./, "");
        const name = domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1);
        defaultBrand = { ...defaultBrand, companyName: name };
      } catch { /* ignore */ }
      writeFileSync(brandDataPath, JSON.stringify(defaultBrand, null, 2), "utf-8");
      log.warn("brand-data.json not created by agent — wrote default from URL");
    }

    // Safety net: create default icon-data.json if agent didn't write it
    const iconsDir = join(ctx.cwd, ".claude/icons");
    const iconDataPath = join(iconsDir, "icon-data.json");
    if (!existsSync(iconDataPath)) {
      writeFileSync(iconDataPath, DEFAULT_ICON_DATA, "utf-8");
      log.warn("icon-data.json not created by agent — wrote default (no icons)");
    }

    // Safety net: create default color-data.json if agent didn't write it
    if (!existsSync(colorDataPath)) {
      writeFileSync(colorDataPath, DEFAULT_COLOR_DATA, "utf-8");
      log.warn("color-data.json not created by agent — wrote default (null colors)");
    }

    // Validate icon extraction (non-blocking)
    try {
      const iconData = JSON.parse(readFileSync(iconDataPath, "utf-8"));
      const lib = iconData?.library ?? "none";
      const count = iconData?.count ?? 0;
      log.success(`icon-data.json: library="${lib}", ${count} icons detected`);
    } catch {
      log.warn("icon-data.json exists but is not valid JSON");
    }

    // Validate font extraction (non-blocking) — file always exists after safety net
    try {
      const fontData = JSON.parse(readFileSync(fontDataPath, "utf-8"));
      const faceCount = fontData?.fontFaces?.length ?? 0;
      const roles = fontData?.roles;
      log.success(`font-data.json: ${faceCount} font faces, roles: ${roles ? Object.keys(roles).join("/") : "none"}`);
    } catch {
      log.warn("font-data.json exists but is not valid JSON");
    }

    // Validate brand extraction (non-blocking) — file always exists after safety net
    try {
      const brandData = JSON.parse(readFileSync(brandDataPath, "utf-8"));
      const name = brandData?.companyName;
      log.success(`brand-data.json: ${name ? `"${name}"` : "no company name"}`);
    } catch {
      log.warn("brand-data.json exists but is not valid JSON");
    }

    return {
      phase: "phase-0-screenshot",
      success: valid,
      duration: Date.now() - start,
      costUsd: result.costUsd,
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
