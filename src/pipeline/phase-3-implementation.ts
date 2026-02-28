import { pageBuilderPrompt } from "../prompts/page-builder.js";
import { createSession, sendPrompt } from "../opencode/session.js";
import { withSpinner } from "../ui/spinner.js";
import { log } from "../ui/logger.js";
import type { PhaseResult } from "./types.js";

export async function runPhase3(plan: string): Promise<PhaseResult> {
  log.phase(3, "Page Implementation");
  const start = Date.now();

  try {
    await withSpinner("Implementing page...", async () => {
      const sessionId = await createSession();
      const prompt = pageBuilderPrompt(plan);
      await sendPrompt(sessionId, prompt, {
        model: "claude-opus-4-20250514",
      });
    });

    log.success(`Page implemented in ${Date.now() - start}ms`);
    return {
      phase: "phase-3-implementation",
      success: true,
      duration: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error(`Phase 3 failed: ${message}`);
    return {
      phase: "phase-3-implementation",
      success: false,
      duration: Date.now() - start,
      error: message,
    };
  }
}
