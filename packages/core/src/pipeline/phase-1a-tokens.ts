import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateGlobalsCss } from "./css-generator.js";
import { log } from "../ui/logger.js";
import type { PipelineContext, PhaseResult } from "./types.js";

export async function runPhase1a(
  ctx: PipelineContext,
  _onEvent?: (event: Record<string, unknown>) => void,
): Promise<PhaseResult> {
  const start = Date.now();

  try {
    // Generate globals.css directly — no Claude CLI needed.
    // This replaces a ~3 min Claude call with a <1s deterministic TS function.
    const css = generateGlobalsCss(ctx.cwd, ctx.mode);
    const globalsPath = join(ctx.cwd, ctx.adapter.getGlobalCssPath());
    writeFileSync(globalsPath, css, "utf-8");

    // Validate via adapter (same as before)
    const validation = ctx.adapter.validateTokenExtraction(ctx.cwd);
    if (validation.valid) {
      log.success(validation.message ?? "Tokens extracted");
      // Post-process (font normalization, etc.)
      ctx.adapter.postProcessTokenExtraction(ctx.cwd);
    } else {
      log.error(validation.message ?? "Token extraction failed");
    }

    return {
      phase: "phase-1a-tokens",
      success: validation.valid,
      duration: Date.now() - start,
      error: validation.valid ? undefined : "Token extraction incomplete",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(msg);
    return {
      phase: "phase-1a-tokens",
      success: false,
      duration: Date.now() - start,
      error: msg,
    };
  }
}
