import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { runClaudePhase } from "./claude-runner.js";
import { PHASE_3_TOOLS } from "./tools.js";
import { log } from "../ui/logger.js";
import type { PagePlan } from "../catalog/index.js";
import type { PipelineContext, PhaseResult } from "./types.js";

export async function runPhase3(
  ctx: PipelineContext,
  plan: string,
  corrections?: string,
  onEvent?: (event: Record<string, unknown>) => void,
  pagePlan?: PagePlan,
): Promise<PhaseResult> {
  const start = Date.now();

  try {
    // ── Deterministic path: render from PagePlan without Claude ──
    if (pagePlan && !corrections && ctx.adapter.renderPageFromPlan) {
      log.info("Rendering page deterministically from structured plan...");
      const pageContent = ctx.adapter.renderPageFromPlan(ctx.cwd, pagePlan);

      const pagePath = join(ctx.cwd, ctx.adapter.getMainPagePath());
      mkdirSync(dirname(pagePath), { recursive: true });
      writeFileSync(pagePath, pageContent, "utf-8");
      log.success(`${ctx.adapter.getMainPagePath()} written (deterministic)`);

      // Validate + type check
      const validation = ctx.adapter.validateImplementation(ctx.cwd);
      if (!validation.valid) {
        log.warn("Deterministic render failed validation — falling back to Claude");
        // Fall through to Claude path below
      } else {
        let buildPasses = false;
        try {
          const checkCommand = ctx.adapter.getQuickCheckCommand?.() ?? ctx.adapter.getBuildCommand();
          execSync(checkCommand, { cwd: ctx.cwd, stdio: "pipe", timeout: 60_000 });
          buildPasses = true;
          log.success(`${ctx.adapter.getMainPagePath()} + type check passes`);
        } catch {
          log.warn("Deterministic render failed type check — falling back to Claude");
        }

        if (buildPasses) {
          return {
            phase: "phase-3-implementation",
            success: true,
            duration: Date.now() - start,
            costUsd: 0,
          };
        }
      }
    }

    // ── Claude path: AI-based implementation ──
    const result = await runClaudePhase(
      {
        name: "phase-3-implementation",
        prompt: ctx.adapter.getPageBuilderPrompt(plan, ctx.screenshotDir, corrections),
        allowedTools: [...PHASE_3_TOOLS],
        model: "claude-sonnet-4-6",
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

    // Fast type-check validation
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
      log.error("Type check failed — build does not compile");
    }

    return {
      phase: "phase-3-implementation",
      success: buildPasses,
      duration: Date.now() - start,
      costUsd: result.costUsd,
      error: buildPasses ? undefined : "Type check failed",
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
