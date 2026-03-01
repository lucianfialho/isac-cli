import { execSync } from "node:child_process";
import { runClaudePhase } from "./claude-runner.js";
import { PHASE_3_TOOLS } from "./tools.js";
import { log } from "../ui/logger.js";
import type { PipelineContext, PhaseResult } from "./types.js";

export async function runPhase3(
  ctx: PipelineContext,
  plan: string,
  corrections?: string,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<PhaseResult> {
  const label = corrections
    ? "Applying corrections..."
    : "Implementing page...";
  log.phase("3", label);
  const start = Date.now();

  try {
    const result = await runClaudePhase(
      {
        name: "phase-3-implementation",
        prompt: ctx.adapter.getPageBuilderPrompt(plan, ctx.screenshotDir, corrections),
        allowedTools: [...PHASE_3_TOOLS],
        timeout: 600_000,
        maxTurns: 50,
      },
      ctx.cwd,
      ctx.sessionId,
      onEvent,
    );

    ctx.sessionId = result.sessionId;

    // Validate via adapter
    const validation = ctx.adapter.validateImplementation(ctx.cwd);
    if (!validation.valid) {
      log.error(validation.message ?? "Implementation validation failed");
      return {
        phase: "phase-3-implementation",
        success: false,
        duration: Date.now() - start,
        costUsd: result.costUsd,
        error: validation.message ?? "Implementation validation failed",
      };
    }

    // Fast type-check validation (uses tsc --noEmit when available, falls back to full build)
    let buildPasses = false;
    try {
      const checkCommand = ctx.adapter.getQuickCheckCommand?.() ?? ctx.adapter.getBuildCommand();
      execSync(checkCommand, {
        cwd: ctx.cwd,
        stdio: "pipe",
        timeout: 60_000,
      });
      buildPasses = true;
      log.success(`${ctx.adapter.getMainPagePath()} + type check passes`);
    } catch {
      log.warn("Type check failed — implementation may have issues");
    }

    return {
      phase: "phase-3-implementation",
      success: true,
      duration: Date.now() - start,
      costUsd: result.costUsd,
      error: buildPasses ? undefined : "Build failed",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(msg);
    return {
      phase: "phase-3-implementation",
      success: false,
      duration: Date.now() - start,
      error: msg,
    };
  }
}
