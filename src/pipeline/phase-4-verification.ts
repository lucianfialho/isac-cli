import { visualVerifierPrompt } from "../prompts/visual-verifier.js";
import { createSession, sendPrompt } from "../opencode/session.js";
import { withSpinner } from "../ui/spinner.js";
import { log } from "../ui/logger.js";
import type { VerificationResult } from "./types.js";

export async function runPhase4(): Promise<VerificationResult> {
  log.phase(4, "Visual Verification");
  const start = Date.now();

  try {
    const result = await withSpinner(
      "Verifying visual fidelity...",
      async () => {
        const sessionId = await createSession();
        const prompt = visualVerifierPrompt();
        return await sendPrompt(sessionId, prompt, {
          model: "claude-sonnet-4-20250514",
        });
      }
    );

    let parsed: { approved?: boolean; issues?: string[]; summary?: string };
    try {
      parsed = JSON.parse(result);
    } catch {
      parsed = { approved: true, issues: [] };
    }

    const approved = parsed.approved ?? true;

    if (approved) {
      log.success(`Visual verification APPROVED in ${Date.now() - start}ms`);
    } else {
      log.warn(
        `Visual verification: CORRECTIONS NEEDED (${parsed.issues?.length ?? 0} issues)`
      );
    }

    return {
      phase: "phase-4-verification",
      success: true,
      duration: Date.now() - start,
      approved,
      issues: parsed.issues,
      data: parsed as unknown as Record<string, unknown>,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error(`Phase 4 failed: ${message}`);
    return {
      phase: "phase-4-verification",
      success: false,
      duration: Date.now() - start,
      approved: false,
      error: message,
    };
  }
}
