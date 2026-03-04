import { runClaudePhase } from "./claude-runner.js";
import { PHASE_2_TOOLS } from "./tools.js";
import { log } from "../ui/logger.js";
import { PagePlanSchema, SECTION_TYPES } from "../catalog/index.js";
import type { PagePlan } from "../catalog/index.js";
import type { PipelineContext, PhaseResult } from "./types.js";

export interface Phase2Result extends PhaseResult {
  /** Raw plan text (Markdown or JSON string) — always populated */
  plan: string;
  /** Validated structured plan — only populated when JSON parsing + Zod validation succeed */
  pagePlan?: PagePlan;
}

/**
 * Try to extract and validate a PagePlan JSON from Claude's response.
 * Returns the parsed plan or undefined if extraction/validation fails.
 */
function tryParsePagePlan(text: string): PagePlan | undefined {
  // Try ```json block first
  const jsonBlock = text.match(/```json\s*([\s\S]*?)\s*```/);
  const raw = jsonBlock?.[1] ?? text;

  // Find outermost { ... }
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) return undefined;

  try {
    const obj = JSON.parse(raw.slice(firstBrace, lastBrace + 1));
    const result = PagePlanSchema.safeParse(obj);
    if (result.success) {
      return result.data;
    }
    log.warn(`PagePlan validation failed: ${result.error.issues.map(i => i.message).join(", ")}`);
    return undefined;
  } catch {
    return undefined;
  }
}

export async function runPhase2(
  ctx: PipelineContext,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<Phase2Result> {
  const start = Date.now();

  try {
    // Use V2 prompt (JSON output) if adapter supports it, else fall back to Markdown
    const prompt = ctx.adapter.getPagePlannerPromptV2
      ? ctx.adapter.getPagePlannerPromptV2(ctx.screenshotDir, [...SECTION_TYPES])
      : ctx.adapter.getPagePlannerPrompt(ctx.screenshotDir);

    const result = await runClaudePhase(
      {
        name: "phase-2-planning",
        prompt,
        allowedTools: [...PHASE_2_TOOLS],
        model: "claude-sonnet-4-6",
        timeout: 180_000,
        maxTurns: 15,
        activityTimeout: 180_000,
      },
      ctx.cwd,
      ctx.sessionId,
      onEvent,
    );

    ctx.sessionId = result.sessionId;

    // Validate output — plan must be non-empty
    const valid = result.result.length > 100;

    // Try structured JSON parsing
    let pagePlan: PagePlan | undefined;
    if (valid) {
      pagePlan = tryParsePagePlan(result.result);
      if (pagePlan) {
        log.success(`Structured plan: ${pagePlan.sections.length} sections (JSON validated)`);
      } else {
        // Fall back to Markdown section counting
        const sectionMatches = result.result.match(/###\s+\d+\./g);
        const sectionCount = sectionMatches?.length ?? 0;
        log.success(
          sectionCount > 0
            ? `${sectionCount} sections planned (Markdown)`
            : "Plan created (Markdown)",
        );
      }
    } else {
      log.error("Plan is empty or too short");
    }

    return {
      phase: "phase-2-planning",
      success: valid,
      duration: Date.now() - start,
      costUsd: result.costUsd,
      plan: result.result,
      pagePlan,
      error: valid ? undefined : "Plan generation failed",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(msg);
    return {
      phase: "phase-2-planning",
      success: false,
      duration: Date.now() - start,
      plan: "",
      error: msg,
    };
  }
}
