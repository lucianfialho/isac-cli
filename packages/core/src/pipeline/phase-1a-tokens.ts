import { runClaudePhase } from "./claude-runner.js";
import { PHASE_1A_TOOLS } from "./tools.js";
import { log } from "../ui/logger.js";
import type { PipelineContext, PhaseResult } from "./types.js";

export async function runPhase1a(
  ctx: PipelineContext,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<PhaseResult> {
  log.phase("1a", "Extracting design tokens...");
  const start = Date.now();

  try {
    const result = await runClaudePhase(
      {
        name: "phase-1a-tokens",
        prompt: ctx.adapter.getTokenExtractionPrompt(ctx.screenshotDir, ctx.url),
        allowedTools: [...PHASE_1A_TOOLS],
        timeout: 300_000,
      },
      ctx.cwd,
      ctx.sessionId,
      onEvent,
    );

    ctx.sessionId = result.sessionId;

    // Validate via adapter
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
      costUsd: result.costUsd,
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
