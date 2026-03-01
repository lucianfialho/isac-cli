import { runClaudePhase } from "./claude-runner.js";
import { PHASE_4_TOOLS } from "./tools.js";
import { getVisualVerifierPrompt } from "../prompts/visual-verifier.js";
import { log } from "../ui/logger.js";
import type { PipelineContext, PhaseResult, VerificationResult } from "./types.js";

export interface Phase4Result extends PhaseResult {
  verification: VerificationResult;
}

export async function runPhase4(
  ctx: PipelineContext,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<Phase4Result> {
  log.phase("4", "Visual verification...");
  const start = Date.now();

  try {
    const result = await runClaudePhase(
      {
        name: "phase-4-verification",
        prompt: getVisualVerifierPrompt(ctx.screenshotDir),
        allowedTools: [...PHASE_4_TOOLS],
        model: "claude-sonnet-4-6",
        timeout: 300_000,
      },
      ctx.cwd,
      ctx.sessionId,
      onEvent,
    );

    ctx.sessionId = result.sessionId;

    // Parse verification result from the response
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

function parseVerificationResult(text: string): VerificationResult {
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
    // Extract numbered issues
    const issueMatches = text.match(/^\d+\.\s+.+$/gm);
    if (issueMatches) {
      issues.push(...issueMatches.map((m) => m.replace(/^\d+\.\s+/, "")));
    }
  }

  return { approved, issues };
}
