import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runClaudePhase } from "./claude-runner.js";
import { PHASE_0_TOOLS } from "./tools.js";
import { getScreenshotPrompt } from "../prompts/screenshot-capturer.js";
import { log } from "../ui/logger.js";
import type { PipelineContext, PhaseResult } from "./types.js";

export async function runPhase0(
  ctx: PipelineContext,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<PhaseResult> {
  log.phase("0", "Capturing screenshots + fonts...");
  const start = Date.now();

  // Ensure output directories exist
  const screenshotDir = join(ctx.cwd, ctx.screenshotDir);
  if (!existsSync(screenshotDir)) {
    mkdirSync(screenshotDir, { recursive: true });
  }
  const fontsDir = join(ctx.cwd, ".claude/fonts");
  if (!existsSync(fontsDir)) {
    mkdirSync(fontsDir, { recursive: true });
  }
  const publicFontsDir = join(ctx.cwd, "public/fonts");
  if (!existsSync(publicFontsDir)) {
    mkdirSync(publicFontsDir, { recursive: true });
  }

  try {
    const result = await runClaudePhase(
      {
        name: "phase-0-screenshot",
        prompt: getScreenshotPrompt(ctx.url),
        allowedTools: [...PHASE_0_TOOLS],
        model: "claude-sonnet-4-6",
        timeout: 300_000, // 5 min
      },
      ctx.cwd,
      ctx.sessionId,
      onEvent,
    );

    // Update session ID for chaining
    ctx.sessionId = result.sessionId;

    // Validate screenshots
    const fullPagePath = join(screenshotDir, "full-page.png");
    const valid = existsSync(fullPagePath);

    if (valid) {
      log.success("full-page.png (light)");
      const darkPath = join(screenshotDir, "full-page-dark.png");
      if (existsSync(darkPath)) {
        log.success("full-page-dark.png (dark)");
      }
    } else {
      log.error("full-page.png not found — screenshot capture failed");
    }

    // Validate font extraction (non-blocking)
    const fontDataPath = join(fontsDir, "font-data.json");
    if (existsSync(fontDataPath)) {
      try {
        const fontData = JSON.parse(readFileSync(fontDataPath, "utf-8"));
        const faceCount = fontData?.fontFaces?.length ?? 0;
        const roles = fontData?.roles;
        log.success(`font-data.json: ${faceCount} font faces, roles: ${roles ? Object.keys(roles).join("/") : "none"}`);
      } catch {
        log.warn("font-data.json exists but is not valid JSON");
      }
    } else {
      log.warn("font-data.json not created — fonts will use fallbacks");
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
