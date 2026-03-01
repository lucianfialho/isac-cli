import { runClaudePhase } from "./claude-runner.js";
import { PHASE_2_TOOLS } from "./tools.js";
import { log } from "../ui/logger.js";
import type { PipelineContext, PhaseResult } from "./types.js";

export interface Phase2Result extends PhaseResult {
  plan: string;
}

export async function runPhase2(
  ctx: PipelineContext,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<Phase2Result> {
  log.phase("2", "Planning page structure...");
  const start = Date.now();

  try {
    const result = await runClaudePhase(
      {
        name: "phase-2-planning",
        prompt: ctx.adapter.getPagePlannerPrompt(ctx.screenshotDir),
        allowedTools: [...PHASE_2_TOOLS],
        timeout: 300_000,
      },
      ctx.cwd,
      ctx.sessionId,
      onEvent,
    );

    ctx.sessionId = result.sessionId;

    // Validate output — plan must be non-empty
    const valid = result.result.length > 100;

    if (valid) {
      // Count sections in plan
      const sectionMatches = result.result.match(/###\s+\d+\./g);
      const sectionCount = sectionMatches?.length ?? 0;
      log.success(
        sectionCount > 0
          ? `${sectionCount} sections planned`
          : "Plan created",
      );
    } else {
      log.error("Plan is empty or too short");
    }

    return {
      phase: "phase-2-planning",
      success: valid,
      duration: Date.now() - start,
      costUsd: result.costUsd,
      plan: result.result,
      error: valid ? undefined : "Plan generation failed",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(msg);
    return {
      phase: "phase-2-planning",
      success: false,
      duration: Date.now() - start,
      plan: "",
      error: msg,
    };
  }
}
