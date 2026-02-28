import { resolve } from "node:path";
import { bootOpencode } from "../opencode/client.js";
import { validateLicense } from "../license/client.js";
import { log } from "../ui/logger.js";
import { runPhase0 } from "./phase-0-screenshot.js";
import { runPhase1a } from "./phase-1a-tokens.js";
import { runPhase1b } from "./phase-1b-design-system.js";
import { runPhase1c } from "./phase-1c-animations.js";
import { runPhase2 } from "./phase-2-planning.js";
import { runPhase3 } from "./phase-3-implementation.js";
import { runPhase4 } from "./phase-4-verification.js";
import type { PipelineOptions, PhaseResult } from "./types.js";

export async function runPipeline(
  url: string,
  opts: PipelineOptions
): Promise<void> {
  // License guard
  const license = await validateLicense();
  if (!license.valid) {
    log.error(license.message || "No valid license. Run: isac auth login");
    process.exit(1);
  }

  const cwd = resolve(opts.cwd);
  const results: PhaseResult[] = [];
  const totalStart = Date.now();

  log.info("Initializing OpenCode engine...");
  await bootOpencode(cwd);
  log.success("OpenCode engine ready\n");

  // ── Phase 0: Screenshot Capture ──
  const p0 = await runPhase0(url);
  results.push(p0);
  if (!p0.success) {
    log.error("Pipeline aborted: screenshot capture failed.");
    printSummary(results, totalStart);
    process.exit(1);
  }

  // ── Phase 1a + 1c: Token Extraction + Animation Detection (parallel) ──
  const phase1Promises: Promise<PhaseResult>[] = [runPhase1a()];
  if (!opts.skipAnimations) {
    phase1Promises.push(runPhase1c(url));
  }
  const phase1Results = await Promise.all(phase1Promises);
  results.push(...phase1Results);

  const p1a = phase1Results[0];
  if (!p1a.success) {
    log.error("Pipeline aborted: token extraction failed.");
    printSummary(results, totalStart);
    process.exit(1);
  }

  // ── Phase 1b: Design System Documentation (depends on 1a) ──
  const p1b = await runPhase1b();
  results.push(p1b);
  if (!p1b.success) {
    log.warn("Design system documentation failed — continuing anyway.");
  }

  // ── Phase 2: Page Planning ──
  const p2 = await runPhase2();
  results.push(p2);
  if (!p2.success) {
    log.error("Pipeline aborted: page planning failed.");
    printSummary(results, totalStart);
    process.exit(1);
  }

  const plan = (p2.data as { plan: string }).plan;

  // ── Phase 3 + 4: Implementation + Verification (with retry loop) ──
  let approved = false;
  let retries = 0;

  while (!approved && retries <= opts.maxRetries) {
    if (retries > 0) {
      log.warn(`Retry ${retries}/${opts.maxRetries}...`);
    }

    const p3 = await runPhase3(plan);
    results.push(p3);
    if (!p3.success) {
      log.error("Implementation failed.");
      retries++;
      continue;
    }

    const p4 = await runPhase4();
    results.push(p4);

    if (p4.approved) {
      approved = true;
    } else {
      retries++;
      if (retries <= opts.maxRetries && p4.issues) {
        log.warn("Issues found:");
        p4.issues.forEach((issue) => log.dim(`  - ${issue}`));
      }
    }
  }

  if (!approved) {
    log.warn(
      `Visual verification not approved after ${opts.maxRetries} retries.`
    );
    log.warn("The implementation may need manual adjustments.");
  }

  printSummary(results, totalStart);
}

function printSummary(results: PhaseResult[], totalStart: number): void {
  const total = Date.now() - totalStart;
  console.log("\n" + "═".repeat(50));
  log.info("Pipeline Summary");
  console.log("═".repeat(50));

  for (const r of results) {
    const status = r.success ? "✓" : "✗";
    const time = `${(r.duration / 1000).toFixed(1)}s`;
    console.log(`  ${status}  ${r.phase.padEnd(30)} ${time}`);
  }

  console.log("─".repeat(50));
  log.info(`Total time: ${(total / 1000).toFixed(1)}s`);
}
