import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runClaudePhase } from "./claude-runner.js";
import { PHASE_1A_TOOLS } from "./tools.js";
import { getDsExtractorPrompt } from "../prompts/ds-extractor.js";
import { log } from "../ui/logger.js";
import type { PipelineContext, PhaseResult } from "./types.js";

/**
 * Normalize font CSS variable names to the canonical --font-sans / --font-display / --font-mono.
 * Models sometimes use --font-family-sans, --font-serif, etc.
 */
function normalizeFontVars(css: string): string {
  let result = css;

  // Map of alternative names → canonical names
  const aliases: [RegExp, string][] = [
    // Sans alternatives
    [/--font-family-sans/g, "--font-sans"],
    [/--font-body/g, "--font-sans"],
    // Display/heading alternatives
    [/--font-family-serif/g, "--font-display"],
    [/--font-serif/g, "--font-display"],
    [/--font-heading/g, "--font-display"],
    [/--font-family-display/g, "--font-display"],
    // Mono alternatives
    [/--font-family-mono/g, "--font-mono"],
    [/--font-code/g, "--font-mono"],
  ];

  for (const [pattern, canonical] of aliases) {
    // Only replace if the canonical name doesn't already exist
    if (!result.includes(`${canonical}:`) && !result.includes(`${canonical})`)) {
      result = result.replace(pattern, canonical);
    }
  }

  return result;
}

export async function runPhase1a(
  ctx: PipelineContext,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<PhaseResult> {
  log.phase("1a", "Extracting design tokens...");
  const start = Date.now();

  try {
    const result = await runClaudePhase(
      {
        name: "phase-1a-tokens",
        prompt: getDsExtractorPrompt(ctx.screenshotDir, ctx.url),
        allowedTools: [...PHASE_1A_TOOLS],
        timeout: 300_000,
      },
      ctx.cwd,
      ctx.sessionId,
      onEvent,
    );

    ctx.sessionId = result.sessionId;

    // Validate output
    const globalsPath = join(ctx.cwd, "app/globals.css");
    let valid = false;

    if (existsSync(globalsPath)) {
      let content = readFileSync(globalsPath, "utf-8");
      const hasSfTokens = content.includes("--sf-");
      const hasColorTokens = content.includes("--color-");
      valid = hasSfTokens && hasColorTokens;

      if (valid) {
        const primitiveCount = (content.match(/--sf-/g) ?? []).length;
        const semanticCount = (content.match(/--color-/g) ?? []).length;
        log.success(`${primitiveCount} primitives, ${semanticCount} semantics, dark mode ready`);
      } else {
        log.error("globals.css missing --sf- or --color- tokens");
      }

      // ── Font normalization ──
      // Models may use --font-family-sans instead of --font-sans, etc.
      const preNormalize = content;
      content = normalizeFontVars(content);
      if (content !== preNormalize) {
        writeFileSync(globalsPath, content, "utf-8");
        log.warn("Normalized font variable names (e.g. --font-family-sans → --font-sans)");
      }

      // Ensure --font-sans, --font-display, --font-mono exist
      const hasFontSans = content.includes("--font-sans:");
      const hasFontDisplay = content.includes("--font-display:");
      const hasFontMono = content.includes("--font-mono:");

      if (!hasFontSans || !hasFontDisplay || !hasFontMono) {
        log.warn("Font vars missing — injecting fallback --font-* declarations");
        const fontVars = [
          !hasFontSans ? "  --font-sans: system-ui, -apple-system, sans-serif;" : "",
          !hasFontDisplay ? "  --font-display: system-ui, sans-serif;" : "",
          !hasFontMono ? '  --font-mono: "SF Mono", "Fira Code", ui-monospace, monospace;' : "",
        ]
          .filter(Boolean)
          .join("\n");
        // Insert before the Tailwind bridge section
        content = content.replace(
          /(\/\*.*Tailwind bridge.*\*\/\s*\n\s*--background:)/,
          `${fontVars}\n\n  $1`,
        );
        writeFileSync(globalsPath, content, "utf-8");
      }

      // Ensure body uses var(--font-sans)
      if (!content.includes("font-family: var(--font-sans)")) {
        content = content.replace(
          /body\s*\{[^}]*font-family:\s*[^;]+;/,
          (match) => match.replace(/font-family:\s*[^;]+;/, "font-family: var(--font-sans);"),
        );
        writeFileSync(globalsPath, content, "utf-8");
        log.warn("Normalized body font-family to var(--font-sans)");
      }
    } else {
      log.error("app/globals.css not created");
    }

    return {
      phase: "phase-1a-tokens",
      success: valid,
      duration: Date.now() - start,
      costUsd: result.costUsd,
      error: valid ? undefined : "Token extraction incomplete",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(msg);
    return {
      phase: "phase-1a-tokens",
      success: false,
      duration: Date.now() - start,
      error: msg,
    };
  }
}
