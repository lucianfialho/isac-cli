import { pagePlannerPrompt } from "../prompts/page-planner.js";
import { createSession, sendPrompt } from "../opencode/session.js";
import { withSpinner } from "../ui/spinner.js";
import { log } from "../ui/logger.js";
import type { PhaseResult } from "./types.js";

export async function runPhase2(): Promise<PhaseResult> {
  log.phase(2, "Page Planning");
  const start = Date.now();

  try {
    const plan = await withSpinner("Planning page structure...", async () => {
      const sessionId = await createSession();
      const prompt = pagePlannerPrompt();
      return await sendPrompt(sessionId, prompt, {
        model: "claude-opus-4-20250514",
      });
    });

    log.success(`Page plan created in ${Date.now() - start}ms`);
    return {
      phase: "phase-2-planning",
      success: true,
      duration: Date.now() - start,
      data: { plan },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error(`Phase 2 failed: ${message}`);
    return {
      phase: "phase-2-planning",
      success: false,
      duration: Date.now() - start,
      error: message,
    };
  }
}
