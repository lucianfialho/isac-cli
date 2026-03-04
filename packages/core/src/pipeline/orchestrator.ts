import { join, dirname } from "node:path";
import { mkdirSync, writeFileSync, existsSync, readFileSync, unlinkSync } from "node:fs";
import { runPhase0, createPhase0EventHandler } from "./phase-0-screenshot.js";
import { runPhase0Animation } from "./phase-0-animation.js";
import { runPhase1a } from "./phase-1a-tokens.js";
import { runPhase1b } from "./phase-1b-design-system.js";
import { runPhase2 } from "./phase-2-planning.js";
import { runPhase3 } from "./phase-3-implementation.js";
import { runPhase4 } from "./phase-4-verification.js";
import { findChromePath } from "./color-extractor.js";
import { log } from "../ui/logger.js";
import { setPhase, succeedPhase, failPhase, renderEvent, stopSpinner, getTotalCost } from "../ui/tui.js";
import type { PipelineContext, PipelineOptions, PipelineResult, PhaseResult } from "./types.js";

/**
 * Write/remove `.mcp.json` in the target directory so that the Claude CLI
 * only tries to connect to chrome-devtools MCP for phases that need it.
 * Without this, the CLI hangs waiting for the MCP server on every phase.
 */
function enableMcp(cwd: string): void {
  const mcpConfigPath = join(cwd, ".mcp.json");
  let mcpConfig: Record<string, unknown> = {};
  if (existsSync(mcpConfigPath)) {
    try {
      mcpConfig = JSON.parse(readFileSync(mcpConfigPath, "utf-8"));
    } catch { /* ignore malformed */ }
  }
  const servers = (mcpConfig.mcpServers as Record<string, unknown>) ?? {};
  if (!servers["chrome-devtools"]) {
    servers["chrome-devtools"] = {
      command: "npx",
      args: [
        "-y", "chrome-devtools-mcp@latest",
        "--headless",   // No UI needed — faster startup in automation
        "--isolated",   // Temp profile per run — avoids Chrome profile lock conflicts
      ],
    };
    mcpConfig.mcpServers = servers;
    writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2) + "\n", "utf-8");
  }
}

function disableMcp(cwd: string): void {
  const mcpConfigPath = join(cwd, ".mcp.json");
  if (!existsSync(mcpConfigPath)) return;
  try {
    const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, "utf-8")) as Record<string, unknown>;
    const servers = mcpConfig.mcpServers as Record<string, unknown> | undefined;
    if (servers?.["chrome-devtools"]) {
      delete servers["chrome-devtools"];
      if (Object.keys(servers).length === 0) {
        unlinkSync(mcpConfigPath);
      } else {
        mcpConfig.mcpServers = servers;
        writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2) + "\n", "utf-8");
      }
    }
  } catch { /* ignore */ }
}

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

export { disableMcp };

export async function runPipeline(options: PipelineOptions): Promise<PipelineResult> {
  const totalStart = Date.now();
  const phases: PhaseResult[] = [];

  const ctx: PipelineContext = {
    url: options.url,
    cwd: options.dir,
    screenshotDir: ".claude/screenshots",
    maxRetries: options.maxRetries,
    mode: options.mode,
    stopAfter: options.stopAfter,
    animations: options.animations,
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
  // Pre-flight: Create required dirs + write scaffolding
  // ═══════════════════════════════════════════════
  setPhase("Setting up project scaffolding...");

  // Ensure output directories exist (moved from phase-0-screenshot)
  const screenshotDir = join(ctx.cwd, ctx.screenshotDir);
  mkdirSync(screenshotDir, { recursive: true });
  mkdirSync(join(ctx.cwd, ".claude/fonts"), { recursive: true });
  mkdirSync(join(ctx.cwd, ".claude/branding"), { recursive: true });
  mkdirSync(join(ctx.cwd, ".claude/icons"), { recursive: true });
  mkdirSync(join(ctx.cwd, ".claude/colors"), { recursive: true });
  mkdirSync(join(ctx.cwd, "public/fonts"), { recursive: true });
  for (const dir of ctx.adapter.getRequiredDirs()) {
    mkdirSync(join(ctx.cwd, dir), { recursive: true });
  }

  // Write design system templates (page, layout, theme-toggle) for instant visual feedback
  writeDesignSystemTemplates(ctx);

  // Write stub data.ts so page.tsx compiles before Phase 1B generates real data.
  // This is separate from writeDesignSystemTemplates() because data.ts must NOT
  // be re-written after Phase 1B — doing so would overwrite Phase 1B's real output.
  const stub = ctx.adapter.getStubDataTemplate();
  const stubPath = join(ctx.cwd, stub.path);
  mkdirSync(dirname(stubPath), { recursive: true });
  writeFileSync(stubPath, stub.content, "utf-8");

  succeedPhase("Project scaffolding ready");

  // ═══════════════════════════════════════════════
  // Pre-flight: Set up agent-browser env (uses system Chrome, no download)
  // ═══════════════════════════════════════════════
  const chromePath = findChromePath();
  if (chromePath) {
    process.env.AGENT_BROWSER_EXECUTABLE_PATH = chromePath;
  }

  // Add agent-browser binary to PATH so Claude subprocess can find it.
  // tsup bundles core into CLI, so import.meta.url → packages/cli/dist/*.js
  // pnpm creates the symlink at packages/cli/node_modules/.bin/agent-browser
  {
    const distDir = dirname(new URL(import.meta.url).pathname);
    const pkgRoot = dirname(distDir); // dist/ → package root
    const localBin = join(pkgRoot, "node_modules", ".bin");

    if (existsSync(join(localBin, "agent-browser"))) {
      process.env.PATH = `${localBin}:${process.env.PATH}`;
      log.info(`agent-browser: ${localBin}`);
    } else {
      log.warn("agent-browser not found in node_modules — install with: npm i -g agent-browser");
    }
  }

  // ═══════════════════════════════════════════════
  // Phase 0: Screenshots + Font Extraction (agent-browser via Bash)
  // ═══════════════════════════════════════════════
  setPhase(ctx.mode === "replicate"
    ? "Capturing screenshots + fonts..."
    : "Extracting design data...");
  const phase0OnEvent = createPhase0EventHandler(ctx, onEvent);
  const phase0 = await runPhase0(ctx, phase0OnEvent);
  phases.push(phase0);
  if (!phase0.success) {
    failPhase(ctx.mode === "replicate"
      ? "Screenshot capture failed"
      : "Design data extraction failed");
    stopSpinner();
    return mkResult(false, false);
  }
  succeedPhase(ctx.mode === "replicate"
    ? `Screenshots + fonts captured (${log.elapsed(totalStart)})`
    : `Design data extracted (${log.elapsed(totalStart)})`);
  ctx.sessionId = undefined; // Break session chain — subsequent phases read artifacts from disk

  if (ctx.stopAfter === "screenshots") {
    stopSpinner();
    return mkResult(true, false, "screenshots");
  }

  // ═══════════════════════════════════════════════
  // Phase 0.5: Animation Detection (optional, replicate mode only)
  // ═══════════════════════════════════════════════
  if (ctx.animations && ctx.mode === "replicate") {
    enableMcp(ctx.cwd);
    setPhase("Detecting animations...");
    mkdirSync(join(ctx.cwd, ".claude/animations"), { recursive: true });
    const phaseAnim = await runPhase0Animation(ctx, onEvent);
    disableMcp(ctx.cwd);
    phases.push(phaseAnim);
    succeedPhase(`Animation detection done (${log.elapsed(totalStart)})`);
  }

  // ═══════════════════════════════════════════════
  // Phase 1A: Token Extraction (no browser needed)
  // ═══════════════════════════════════════════════
  setPhase("Extracting tokens...");
  const ctx1a: PipelineContext = { ...ctx, sessionId: undefined };
  const phase1a = await runPhase1a(ctx1a, onEvent);
  phases.push(phase1a);

  if (!phase1a.success) {
    failPhase("Token extraction failed");
    stopSpinner();
    return mkResult(false, false);
  }
  succeedPhase(`Tokens extracted (${log.elapsed(totalStart)})`);

  // ═══════════════════════════════════════════════
  // Phase 1B + Phase 2: Design System Docs + Planning (parallel, independent sessions)
  // P1B depends on P1A (globals.css). P2 depends on P1A (globals.css) + P0 (screenshots).
  // Neither depends on the other, so they run concurrently.
  // Exception: --stop-after design-system skips P2 entirely.
  // ═══════════════════════════════════════════════

  // Design system mode stops after Phase 1B by default (unless overridden by stopAfter)
  const stopAtDesignSystem = ctx.stopAfter === "design-system"
    || (ctx.mode === "design-system" && !ctx.stopAfter);

  if (stopAtDesignSystem) {
    // Only P1B needed — skip P2 to save cost
    ctx.sessionId = undefined;
    setPhase("Building design system docs...");
    const phase1b = await runPhase1b(ctx, onEvent);
    phases.push(phase1b);

    if (phase1b.success) {
      succeedPhase(`Design system built (${log.elapsed(totalStart)})`);
    } else {
      failPhase("Design system build failed");
    }

    writeDesignSystemTemplates(ctx);
    ctx.adapter.finalizeProject?.(ctx.cwd);
    stopSpinner();
    log.divider();
    log.success("Design system complete.");
    log.info(`Run: npm run dev → ${ctx.adapter.getDevServerUrl()}/design-system`);
    return mkResult(true, false, "design-system");
  }

  setPhase("Building design system & planning page...");

  const ctx1b: PipelineContext = { ...ctx, sessionId: undefined };
  const ctx2: PipelineContext = { ...ctx, sessionId: undefined };

  const [phase1b, phase2] = await Promise.all([
    runPhase1b(ctx1b, onEvent),
    runPhase2(ctx2, onEvent),
  ]);
  phases.push(phase1b);

  if (phase1b.success) {
    succeedPhase(`Design system built (${log.elapsed(totalStart)})`);
  } else {
    failPhase("Design system build failed");
  }

  phases.push(phase2);

  if (!phase2.success || !phase2.plan) {
    failPhase("Planning failed");
    stopSpinner();
    return mkResult(false, false);
  }

  if (phase2.pagePlan) {
    succeedPhase(`Structured plan ready — ${phase2.pagePlan.sections.length} sections (${log.elapsed(totalStart)})`);
  } else {
    succeedPhase(`Plan ready (${log.elapsed(totalStart)})`);
  }

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
    const phase3 = await runPhase3(ctx, phase2.plan, corrections, onEvent, phase2.pagePlan);
    phases.push(phase3);

    if (!phase3.success) {
      failPhase("Implementation failed");
      break;
    }
    succeedPhase(`Implementation done (${log.elapsed(totalStart)})`);

    if (ctx.stopAfter === "implementation") {
      writeDesignSystemTemplates(ctx);
      ctx.adapter.finalizeProject?.(ctx.cwd);
      stopSpinner();
      return mkResult(true, false, "implementation");
    }

    // --- Phase 4: Visual Verification (agent-browser via Bash) ---
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
  ctx.adapter.finalizeProject?.(ctx.cwd);

  stopSpinner();
  return mkResult(true, approved);
}
