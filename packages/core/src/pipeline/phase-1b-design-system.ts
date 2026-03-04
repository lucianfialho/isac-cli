import { log } from "../ui/logger.js";
import type { PipelineContext, PhaseResult } from "./types.js";

export async function runPhase1b(
  ctx: PipelineContext,
  _onEvent?: (event: Record<string, unknown>) => void,
): Promise<PhaseResult> {
  const start = Date.now();

  try {
    // Deterministic path: generate data.ts directly from globals.css
    // No Claude call needed — the adapter parses CSS tokens and produces data.ts
    log.info("Generating design system data (deterministic)...");
    ctx.adapter.generateDesignSystemData(ctx.cwd, ctx.url);

    const validation = ctx.adapter.validateDesignSystem(ctx.cwd);
    if (validation.valid) {
      log.success(validation.message ?? "Design system data created");
    } else {
      log.error(validation.message ?? "Design system data generation failed");
    }

    return {
      phase: "phase-1b-design-system",
      success: validation.valid,
      duration: Date.now() - start,
      costUsd: 0,
      error: validation.valid ? undefined : "Design system data file missing",
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
