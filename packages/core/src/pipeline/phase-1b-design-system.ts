import { runClaudePhase } from "./claude-runner.js";
import { PHASE_1B_TOOLS } from "./tools.js";
import { log } from "../ui/logger.js";
import type { PipelineContext, PhaseResult } from "./types.js";

export async function runPhase1b(
  ctx: PipelineContext,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<PhaseResult> {
  log.phase("1b", "Building design system docs...");
  const start = Date.now();

  try {
    const result = await runClaudePhase(
      {
        name: "phase-1b-design-system",
        prompt: ctx.adapter.getDesignSystemPrompt(ctx.screenshotDir),
        allowedTools: [...PHASE_1B_TOOLS],
        timeout: 300_000,
      },
      ctx.cwd,
      ctx.sessionId,
      onEvent,
    );

    ctx.sessionId = result.sessionId;

    // Validate via adapter
    const validation = ctx.adapter.validateDesignSystem(ctx.cwd);
    if (validation.valid) {
      log.success(validation.message ?? "Design system data created");
    } else {
      log.warn(validation.message ?? "Design system data missing — generating fallback");
      ctx.adapter.generateDesignSystemFallback(ctx.cwd, ctx.url);
    }

    const finalValidation = ctx.adapter.validateDesignSystem(ctx.cwd);
    return {
      phase: "phase-1b-design-system",
      success: finalValidation.valid,
      duration: Date.now() - start,
      costUsd: result.costUsd,
      error: finalValidation.valid ? undefined : "Design system data file missing",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(msg);
    return {
      phase: "phase-1b-design-system",
      success: false,
      duration: Date.now() - start,
      error: msg,
    };
  }
}
