import { animationDetectorPrompt } from "../prompts/animation-detector.js";
import { createSession, sendPrompt } from "../opencode/session.js";
import { withSpinner } from "../ui/spinner.js";
import { log } from "../ui/logger.js";
import type { PhaseResult } from "./types.js";

export async function runPhase1c(url: string): Promise<PhaseResult> {
  log.phase(1, "Animation Detection (1c)");
  const start = Date.now();

  try {
    await withSpinner("Detecting animations...", async () => {
      const sessionId = await createSession();
      const prompt = animationDetectorPrompt(url);
      await sendPrompt(sessionId, prompt, {
        model: "claude-sonnet-4-20250514",
      });
    });

    log.success(`Animations detected in ${Date.now() - start}ms`);
    return {
      phase: "phase-1c-animations",
      success: true,
      duration: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error(`Phase 1c failed: ${message}`);
    return {
      phase: "phase-1c-animations",
      success: false,
      duration: Date.now() - start,
      error: message,
    };
  }
}
