import { join, dirname } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import { runPhase0 } from "./phase-0-screenshot.js";
import { runPhase1a } from "./phase-1a-tokens.js";
import { runPhase1b } from "./phase-1b-design-system.js";
import { runPhase1c } from "./phase-1c-animations.js";
import { runPhase2 } from "./phase-2-planning.js";
import { runPhase3 } from "./phase-3-implementation.js";
import { runPhase4 } from "./phase-4-verification.js";
import { log } from "../ui/logger.js";
import { setPhase, succeedPhase, failPhase, renderEvent, stopSpinner, getTotalCost } from "../ui/tui.js";
import type { PipelineContext, PipelineOptions, PipelineResult, PhaseResult } from "./types.js";

/** Write design system template files to disk, overwriting any model-generated versions */
function writeDesignSystemTemplates(ctx: PipelineContext): void {
  const templates = ctx.adapter.getDesignSystemTemplates();
  for (const { path, content } of templates) {
    const fullPath = join(ctx.cwd, path);
    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, content, "utf-8");
  }
  if (templates.length > 0) {
    log.success("Design system templates written");
  }
}

export async function runPipeline(options: PipelineOptions): Promise<PipelineResult> {
  const totalStart = Date.now();
  const phases: PhaseResult[] = [];

  const ctx: PipelineContext = {
    url: options.url,
    cwd: options.dir,
    screenshotDir: ".claude/screenshots",
    animationCatalogPath: ".claude/animations/catalog.json",
    skipAnimations: options.skipAnimations,
    maxRetries: options.maxRetries,
    stopAfter: options.stopAfter,
    adapter: options.adapter,
  };

  const onEvent = (event: Record<string, unknown>) => {
    renderEvent(event);
  };

  const mkResult = (
    success: boolean,
    approved: boolean,
    stoppedAt: string | null = null,
  ): PipelineResult => ({
    success,
    approved,
    stoppedAt,
    url: options.url,
    phases,
    totalDuration: Date.now() - totalStart,
    totalCostUsd: getTotalCost(),
    filesCreated: ctx.adapter.collectCreatedFiles(options.dir),
  });

  // ═══════════════════════════════════════════════
  // Phase 0: Screenshots + Font Extraction (own session)
  // ═══════════════════════════════════════════════
  setPhase("Capturing screenshots + fonts...");
  const phase0 = await runPhase0(ctx, onEvent);
  phases.push(phase0);
  if (!phase0.success) {
    failPhase("Screenshot capture failed");
    stopSpinner();
    return mkResult(false, false);
  }
  succeedPhase(`Screenshots + fonts captured (${log.elapsed(totalStart)})`);
  ctx.sessionId = undefined; // Break session chain — subsequent phases read artifacts from disk

  if (ctx.stopAfter === "screenshots") {
    stopSpinner();
    return mkResult(true, false, "screenshots");
  }

  // ═══════════════════════════════════════════════
  // Phase 1A + 1C: Token Extraction + Animation Detection (parallel, independent sessions)
  // ═══════════════════════════════════════════════
  setPhase("Extracting tokens & detecting animations...");

  const ctx1a: PipelineContext = { ...ctx, sessionId: undefined };
  const ctx1c: PipelineContext = { ...ctx, sessionId: undefined };

  const [phase1a, phase1c] = await Promise.all([
    runPhase1a(ctx1a, onEvent),
    runPhase1c(ctx1c, onEvent),
  ]);
  phases.push(phase1a);
  phases.push(phase1c);

  if (!phase1a.success) {
    failPhase("Token extraction failed");
    stopSpinner();
    return mkResult(false, false);
  }
  succeedPhase(`Tokens extracted (${log.elapsed(totalStart)})`);

  if (phase1c.success) {
    succeedPhase(`Animations detected (${log.elapsed(totalStart)})`);
  }

  // ═══════════════════════════════════════════════
  // Phase 1B: Design System Documentation (own session, depends on 1A globals.css)
  // ═══════════════════════════════════════════════
  ctx.sessionId = undefined;
  setPhase("Building design system docs...");
  const phase1b = await runPhase1b(ctx, onEvent);
  phases.push(phase1b);

  if (phase1b.success) {
    succeedPhase(`Design system built (${log.elapsed(totalStart)})`);
  } else {
    failPhase("Design system build failed");
  }

  if (ctx.stopAfter === "design-system") {
    writeDesignSystemTemplates(ctx);
    stopSpinner();
    log.divider();
    log.success("Design system complete. Stopped as requested.");
    log.info(`Run: npm run dev → ${ctx.adapter.getDevServerUrl()}/design-system`);
    return mkResult(true, false, "design-system");
  }

  // ═══════════════════════════════════════════════
  // Phase 2: Planning (new session — reads artifacts from disk)
  // ═══════════════════════════════════════════════
  ctx.sessionId = undefined;
  setPhase("Planning page structure...");
  const phase2 = await runPhase2(ctx, onEvent);
  phases.push(phase2);

  if (!phase2.success || !phase2.plan) {
    failPhase("Planning failed");
    stopSpinner();
    return mkResult(false, false);
  }
  succeedPhase(`Plan ready (${log.elapsed(totalStart)})`);

  if (ctx.stopAfter === "planning") {
    stopSpinner();
    return mkResult(true, false, "planning");
  }

  // ═══════════════════════════════════════════════
  // Phase 3 + 4: Implementation + Visual Verification
  // (retry loop — max N attempts)
  // ═══════════════════════════════════════════════
  let approved = false;
  let corrections: string | undefined;

  for (let attempt = 0; attempt < options.maxRetries && !approved; attempt++) {
    // --- Phase 3: Implementation ---
    setPhase(
      attempt === 0
        ? "Implementing page..."
        : `Applying corrections (attempt ${attempt + 1})...`,
    );
    const phase3 = await runPhase3(ctx, phase2.plan, corrections, onEvent);
    phases.push(phase3);

    if (!phase3.success) {
      failPhase("Implementation failed");
      break;
    }
    succeedPhase(`Implementation done (${log.elapsed(totalStart)})`);

    // --- Phase 4: Visual Verification ---
    setPhase("Verifying visual fidelity...");
    const phase4 = await runPhase4(ctx, onEvent);
    phases.push(phase4);

    if (phase4.verification.approved) {
      approved = true;
      succeedPhase(
        `APPROVED (attempt ${attempt + 1}) (${log.elapsed(totalStart)})`,
      );
    } else {
      corrections = phase4.verification.issues.join("\n");
      if (attempt < options.maxRetries - 1) {
        failPhase(
          `Corrections needed — retrying (${phase4.verification.issues.length} issues)`,
        );
      } else {
        failPhase("Corrections needed — max retries reached");
      }
    }
  }

  // Final step: write design system templates — prevents any phase from having overwritten them
  writeDesignSystemTemplates(ctx);

  stopSpinner();
  return mkResult(true, approved);
}
