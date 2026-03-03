import { existsSync } from "node:fs";
import { join } from "node:path";
import { runClaudePhase } from "./claude-runner.js";
import { PHASE_0_TOOLS } from "./tools.js";
import { log } from "../ui/logger.js";
import type { PipelineContext, PhaseResult } from "./types.js";

function getAnimationDetectionPrompt(url: string): string {
  return `You are a frontend animation specialist. Visit ${url} via chrome-devtools and produce a complete animation catalog at \`.claude/animations/catalog.json\`.

## Process

1. **List open pages** via \`list_pages\` to find an already-open page
2. **Select the page** or **create one** with \`new_page\` and \`navigate_page\` to ${url}
3. **Run detection** via \`evaluate_script\`:
   - Read the detection script from \`skills/replicate/templates/animation-detection.js\`
   - Execute it in the page context — it returns JSON with the full catalog
4. **Parse and enhance** the catalog:
   - Add \`motionEquivalent\` suggestions for each animation using motion.dev API
   - Categorize animations by complexity (none / simple / moderate / complex)
5. **Write** the result to \`.claude/animations/catalog.json\`

## Motion.dev mapping rules

| Animation type | Trigger | Motion.dev equivalent |
|---|---|---|
| CSS animation (entrance) | page-load | \`animate(selector, keyframes, options)\` |
| CSS animation (infinite) | page-load | \`animate(selector, keyframes, { repeat: Infinity })\` |
| CSS transition (hover) | hover | Keep as CSS \`transition\` property |
| Scroll reveal | in-view | \`inView(selector, ({ target }) => animate(target, ...))\` |
| Scroll parallax | scroll | \`scroll(animate(selector, keyframes), { target })\` |
| Staggered entrance | page-load | \`animate(selector, keyframes, { delay: stagger(0.1) })\` |

## Output format

Write \`.claude/animations/catalog.json\`:

\`\`\`json
{
  "url": "${url}",
  "detectedLibraries": [],
  "keyframes": {},
  "animations": [],
  "summary": { "total": 0, "byType": {}, "byTrigger": {}, "complexity": "none" }
}
\`\`\`

Also check hover effects on interactive elements (buttons, links, cards) and scroll behavior.`;
}

export async function runPhase0Animation(
  ctx: PipelineContext,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<PhaseResult> {
  const start = Date.now();

  try {
    const result = await runClaudePhase(
      {
        name: "phase-0-animation",
        prompt: getAnimationDetectionPrompt(ctx.url),
        allowedTools: [...PHASE_0_TOOLS],
        model: "claude-sonnet-4-6",
        timeout: 180_000, // 3 min — animation detection is lighter than full screenshot capture
        maxTurns: 20,
        activityTimeout: 120_000,
      },
      ctx.cwd,
      undefined, // fresh session — don't reuse Phase 0 session
      onEvent,
    );

    const catalogPath = join(ctx.cwd, ".claude/animations/catalog.json");
    const valid = existsSync(catalogPath);

    if (valid) {
      log.success("animations/catalog.json created");
    } else {
      log.warn("Animation catalog not created — skipping");
    }

    return {
      phase: "phase-0-animation",
      success: true, // non-fatal even if catalog missing
      duration: Date.now() - start,
      costUsd: result.costUsd,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.warn(`Animation detection failed: ${msg}`);
    return {
      phase: "phase-0-animation",
      success: true, // non-fatal — pipeline continues without animations
      duration: Date.now() - start,
      error: msg,
    };
  }
}
