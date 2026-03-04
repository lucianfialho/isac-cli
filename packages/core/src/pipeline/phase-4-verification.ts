import { join } from "node:path";
import { runClaudePhase } from "./claude-runner.js";
import { PHASE_4_TOOLS } from "./tools.js";
import { log } from "../ui/logger.js";
import { runPixelDiff } from "./pixel-diff.js";
import type { PipelineContext, PhaseResult, VerificationResult } from "./types.js";

export interface Phase4Result extends PhaseResult {
  verification: VerificationResult;
}

export async function runPhase4(
  ctx: PipelineContext,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<Phase4Result> {
  const start = Date.now();

  // ── Try pixel-diff first (deterministic, no Claude needed) ──
  try {
    log.info("Attempting pixel-diff verification...");
    const pixelResult = await runPixelDiff({
      referenceDir: join(ctx.cwd, ctx.screenshotDir),
      implementationUrl: ctx.adapter.getDevServerUrl(),
      outputDir: join(ctx.cwd, ctx.screenshotDir, "verification"),
    });

    // If pixel-diff produced a definitive result (approved or clear failure with diff data), use it
    if (pixelResult.approved) {
      log.success("APPROVED (pixel-diff)");
      return {
        phase: "phase-4-verification",
        success: true,
        duration: Date.now() - start,
        costUsd: 0,
        verification: pixelResult,
      };
    }

    // If pixel-diff failed due to missing chrome/reference, fall through to Claude
    const isInfraFailure = pixelResult.issues.some(i =>
      i.includes("No reference screenshot") ||
      i.includes("Chrome not found") ||
      i.includes("Pixel-diff error"),
    );

    if (!isInfraFailure) {
      // Pixel-diff ran but found differences — report them
      log.warn(`CORRECTIONS NEEDED (pixel-diff) — ${pixelResult.issues.length} issue(s)`);
      for (const issue of pixelResult.issues) {
        log.info(`  - ${issue}`);
      }
      return {
        phase: "phase-4-verification",
        success: true,
        duration: Date.now() - start,
        costUsd: 0,
        verification: pixelResult,
      };
    }

    log.info("Pixel-diff unavailable — falling back to Claude verification");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.warn(`Pixel-diff failed: ${msg} — falling back to Claude verification`);
  }

  // ── Fallback: Claude-based visual verification ──
  try {
    const result = await runClaudePhase(
      {
        name: "phase-4-verification",
        prompt: ctx.adapter.getVisualVerifierPrompt(ctx.screenshotDir),
        allowedTools: [...PHASE_4_TOOLS],
        model: "claude-sonnet-4-6",
        timeout: 120_000,
        maxTurns: 20,
      },
      ctx.cwd,
      ctx.sessionId,
      onEvent,
    );

    ctx.sessionId = result.sessionId;

    const verification = parseVerificationResult(result.result);

    if (verification.approved) {
      log.success("APPROVED");
    } else {
      log.warn(`CORRECTIONS NEEDED — ${verification.issues.length} issue(s)`);
      for (const issue of verification.issues) {
        log.info(`  - ${issue}`);
      }
    }

    return {
      phase: "phase-4-verification",
      success: true,
      duration: Date.now() - start,
      costUsd: result.costUsd,
      verification,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(msg);
    return {
      phase: "phase-4-verification",
      success: false,
      duration: Date.now() - start,
      verification: { approved: false, issues: [msg] },
      error: msg,
    };
  }
}

export function parseVerificationResult(text: string): VerificationResult {
  // Try to extract JSON block from the response
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]) as VerificationResult;
      return {
        approved: parsed.approved ?? false,
        issues: parsed.issues ?? [],
        screenshots: parsed.screenshots,
      };
    } catch {
      // Fall through to text parsing
    }
  }

  // Try to parse as raw JSON
  try {
    const lastBrace = text.lastIndexOf("}");
    const firstBrace = text.lastIndexOf("{", lastBrace);
    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonStr = text.slice(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(jsonStr) as VerificationResult;
      return {
        approved: parsed.approved ?? false,
        issues: parsed.issues ?? [],
        screenshots: parsed.screenshots,
      };
    }
  } catch {
    // Fall through to text-based parsing
  }

  // Text-based fallback
  const approved = /APPROVED/i.test(text) && !/CORRECTIONS\s+NEEDED/i.test(text);
  const issues: string[] = [];

  if (!approved) {
    const issueMatches = text.match(/^\d+\.\s+.+$/gm);
    if (issueMatches) {
      issues.push(...issueMatches.map((m) => m.replace(/^\d+\.\s+/, "")));
    }
  }

  return { approved, issues };
}
