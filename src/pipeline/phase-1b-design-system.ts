import { dsPageBuilderPrompt } from "../prompts/ds-page-builder.js";
import { createSession, sendPrompt } from "../opencode/session.js";
import { withSpinner } from "../ui/spinner.js";
import { log } from "../ui/logger.js";
import type { PhaseResult } from "./types.js";

export async function runPhase1b(): Promise<PhaseResult> {
  log.phase(1, "Design System Documentation (1b)");
  const start = Date.now();

  try {
    await withSpinner("Building design system page...", async () => {
      const sessionId = await createSession();
      const prompt = dsPageBuilderPrompt();
      await sendPrompt(sessionId, prompt, {
        model: "claude-opus-4-20250514",
      });
    });

    log.success(`Design system page built in ${Date.now() - start}ms`);
    return {
      phase: "phase-1b-design-system",
      success: true,
      duration: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error(`Phase 1b failed: ${message}`);
    return {
      phase: "phase-1b-design-system",
      success: false,
      duration: Date.now() - start,
      error: message,
    };
  }
}
