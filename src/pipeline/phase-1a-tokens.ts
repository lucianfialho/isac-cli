import { dsExtractorPrompt } from "../prompts/ds-extractor.js";
import { createSession, sendPrompt } from "../opencode/session.js";
import { withSpinner } from "../ui/spinner.js";
import { log } from "../ui/logger.js";
import type { PhaseResult } from "./types.js";

export async function runPhase1a(): Promise<PhaseResult> {
  log.phase(1, "Token Extraction (1a)");
  const start = Date.now();

  try {
    await withSpinner("Extracting design tokens...", async () => {
      const sessionId = await createSession();
      const prompt = dsExtractorPrompt();
      await sendPrompt(sessionId, prompt, {
        model: "claude-opus-4-20250514",
      });
    });

    log.success(`Design tokens extracted in ${Date.now() - start}ms`);
    return {
      phase: "phase-1a-tokens",
      success: true,
      duration: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error(`Phase 1a failed: ${message}`);
    return {
      phase: "phase-1a-tokens",
      success: false,
      duration: Date.now() - start,
      error: message,
    };
  }
}
