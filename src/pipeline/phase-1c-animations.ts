import { existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { runClaudePhase } from "./claude-runner.js";
import { PHASE_1C_TOOLS } from "./tools.js";
import { getAnimationDetectorPrompt } from "../prompts/animation-detector.js";
import { log } from "../ui/logger.js";
import type { PipelineContext, PhaseResult } from "./types.js";

export async function runPhase1c(
  ctx: PipelineContext,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<PhaseResult> {
  log.phase("1c", "Detecting animations...");
  const start = Date.now();

  if (ctx.skipAnimations) {
    log.info("Skipped (--skip-animations)");
    return {
      phase: "phase-1c-animations",
      success: true,
      duration: Date.now() - start,
    };
  }

  // Ensure animations directory exists
  const catalogPath = join(ctx.cwd, ctx.animationCatalogPath);
  const catalogDir = dirname(catalogPath);
  if (!existsSync(catalogDir)) {
    mkdirSync(catalogDir, { recursive: true });
  }

  try {
    const result = await runClaudePhase(
      {
        name: "phase-1c-animations",
        prompt: getAnimationDetectorPrompt(ctx.url),
        allowedTools: [...PHASE_1C_TOOLS],
        model: "claude-sonnet-4-6",
        timeout: 300_000,
      },
      ctx.cwd,
      ctx.sessionId,
      onEvent,
    );

    ctx.sessionId = result.sessionId;

    // Validate output
    const valid = existsSync(catalogPath);

    if (valid) {
      try {
        const catalog = JSON.parse(
          (await import("node:fs")).readFileSync(catalogPath, "utf-8"),
        );
        const total = catalog?.summary?.total ?? 0;
        const byType = catalog?.summary?.byType ?? {};
        const parts = Object.entries(byType)
          .map(([type, count]) => `${count} ${type}`)
          .join(", ");
        log.success(parts || `${total} animations detected`);
      } catch {
        log.success("catalog.json created");
      }
    } else {
      log.warn("Animation catalog not created — continuing without animations");
    }

    return {
      phase: "phase-1c-animations",
      success: true, // Non-blocking — animations are optional
      duration: Date.now() - start,
      costUsd: result.costUsd,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.warn(`Animation detection failed: ${msg}`);
    // Non-blocking failure
    return {
      phase: "phase-1c-animations",
      success: true,
      duration: Date.now() - start,
    };
  }
}
