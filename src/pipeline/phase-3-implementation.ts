import { existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { runClaudePhase } from "./claude-runner.js";
import { PHASE_3_TOOLS } from "./tools.js";
import { getPageBuilderPrompt } from "../prompts/page-builder.js";
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
        prompt: getPageBuilderPrompt(plan, ctx.screenshotDir, corrections),
        allowedTools: [...PHASE_3_TOOLS],
        timeout: 600_000, // 10 min for implementation
      },
      ctx.cwd,
      ctx.sessionId,
      onEvent,
    );

    ctx.sessionId = result.sessionId;

    // Validate output
    const pagePath = join(ctx.cwd, "app/page.tsx");
    const pageExists = existsSync(pagePath);

    if (!pageExists) {
      log.error("app/page.tsx not created");
      return {
        phase: "phase-3-implementation",
        success: false,
        duration: Date.now() - start,
        costUsd: result.costUsd,
        error: "app/page.tsx not created",
      };
    }

    // Try build validation
    let buildPasses = false;
    try {
      execSync("npm run build", {
        cwd: ctx.cwd,
        stdio: "pipe",
        timeout: 120_000,
      });
      buildPasses = true;
      log.success("app/page.tsx + npm run build passes");
    } catch {
      log.warn("npm run build failed — implementation may have issues");
    }

    return {
      phase: "phase-3-implementation",
      success: pageExists,
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
