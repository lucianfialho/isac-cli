import { screenshotCapturerPrompt } from "../prompts/screenshot-capturer.js";
import { createSession, sendPrompt } from "../opencode/session.js";
import { withSpinner } from "../ui/spinner.js";
import { log } from "../ui/logger.js";
import type { PhaseResult, ScreenshotResult } from "./types.js";

export async function runPhase0(url: string): Promise<PhaseResult> {
  log.phase(0, "Screenshot Capture");
  const start = Date.now();

  try {
    const result = await withSpinner(
      "Capturing screenshots...",
      async () => {
        const sessionId = await createSession();
        const prompt = screenshotCapturerPrompt(url);
        const response = await sendPrompt(sessionId, prompt, {
          model: "claude-haiku-4-5-20251001",
        });
        return response;
      }
    );

    let data: ScreenshotResult;
    try {
      data = JSON.parse(result);
    } catch {
      data = {
        lightPath: ".claude/screenshots/full-page.png",
        sectionPaths: [],
      };
    }

    log.success(`Screenshots captured in ${Date.now() - start}ms`);
    return {
      phase: "phase-0-screenshot",
      success: true,
      duration: Date.now() - start,
      data: data as unknown as Record<string, unknown>,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error(`Phase 0 failed: ${message}`);
    return {
      phase: "phase-0-screenshot",
      success: false,
      duration: Date.now() - start,
      error: message,
    };
  }
}
