import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { runClaudePhase } from "./claude-runner.js";
import { PHASE_1B_TOOLS } from "./tools.js";
import { getDsPageBuilderPrompt } from "../prompts/ds-page-builder.js";
import { log } from "../ui/logger.js";
import type { PipelineContext, PhaseResult } from "./types.js";

export async function runPhase1b(
  ctx: PipelineContext,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<PhaseResult> {
  log.phase("1b", "Building design system docs...");
  const start = Date.now();

  try {
    // Step 1: Call model to generate ONLY data.ts
    const result = await runClaudePhase(
      {
        name: "phase-1b-design-system",
        prompt: getDsPageBuilderPrompt(ctx.screenshotDir),
        allowedTools: [...PHASE_1B_TOOLS],
        timeout: 300_000,
      },
      ctx.cwd,
      ctx.sessionId,
      onEvent,
    );

    ctx.sessionId = result.sessionId;

    // Step 2: Validate data.ts exists — generate fallback if model failed
    const dsDataPath = join(ctx.cwd, "app/design-system/data.ts");
    const dataExists = existsSync(dsDataPath);

    if (dataExists) {
      log.success("app/design-system/data.ts created by model");
    } else {
      log.warn("app/design-system/data.ts not created — generating fallback from globals.css");
      const globalsPath = join(ctx.cwd, "app/globals.css");
      if (existsSync(globalsPath)) {
        const css = readFileSync(globalsPath, "utf-8");
        const fallback = generateFallbackDataTs(css, ctx.url);
        mkdirSync(dirname(dsDataPath), { recursive: true });
        writeFileSync(dsDataPath, fallback, "utf-8");
        log.success("app/design-system/data.ts generated from globals.css");
      } else {
        log.error("Cannot generate fallback — app/globals.css not found");
      }
    }

    // NOTE: Template files (page.tsx, layout.tsx, theme-toggle.tsx) are written
    // by the orchestrator as the LAST step, to prevent later phases from overwriting them.

    const valid = existsSync(dsDataPath);
    return {
      phase: "phase-1b-design-system",
      success: valid,
      duration: Date.now() - start,
      costUsd: result.costUsd,
      error: valid ? undefined : "Design system data file missing",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(msg);
    return {
      phase: "phase-1b-design-system",
      success: false,
      duration: Date.now() - start,
      error: msg,
    };
  }
}

/**
 * Parse globals.css and generate a fallback data.ts with all token values.
 */
function generateFallbackDataTs(css: string, url: string): string {
  // Extract domain from URL
  let domain = "example.com";
  let name = "Example Site";
  try {
    const u = new URL(url);
    domain = u.hostname.replace(/^www\./, "");
    name = domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1);
  } catch { /* fallback */ }

  // Parse primitives (--sf-*)
  const primitives: { name: string; var: string; hex: string }[] = [];
  const sfRegex = /--sf-([\w-]+):\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = sfRegex.exec(css)) !== null) {
    primitives.push({
      name: m[1],
      var: `--sf-${m[1]}`,
      hex: m[2].trim(),
    });
  }

  // Parse font vars
  const fontSansMatch = css.match(/--font-sans:\s*([^;]+);/);
  const fontDisplayMatch = css.match(/--font-display:\s*([^;]+);/);
  const fontMonoMatch = css.match(/--font-mono:\s*([^;]+);/);
  const fontSans = fontSansMatch?.[1]?.trim() ?? "system-ui, -apple-system, sans-serif";
  const fontDisplay = fontDisplayMatch?.[1]?.trim() ?? fontSans;
  const fontMono = fontMonoMatch?.[1]?.trim() ?? '"SF Mono", ui-monospace, monospace';

  // Parse semantic tokens — split :root and dark blocks
  const rootBlock = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
  const darkBlock = css.match(/\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";

  const semanticCategories: Record<string, { name: string; var: string; lightRef: string; darkRef: string }[]> = {
    Background: [],
    Text: [],
    Border: [],
    Surface: [],
    Accent: [],
  };

  const colorRegex = /--color-([\w-]+):\s*var\(--sf-([\w-]+)\)/g;

  // Light refs from :root
  const lightRefs: Record<string, string> = {};
  let cm: RegExpExecArray | null;
  while ((cm = colorRegex.exec(rootBlock)) !== null) {
    lightRefs[cm[1]] = cm[2];
  }

  // Dark refs
  colorRegex.lastIndex = 0;
  const darkRefs: Record<string, string> = {};
  while ((cm = colorRegex.exec(darkBlock)) !== null) {
    darkRefs[cm[1]] = cm[2];
  }

  // Group into categories
  for (const tokenName of Object.keys(lightRefs)) {
    let category = "Accent";
    if (tokenName.startsWith("bg-")) category = "Background";
    else if (tokenName.startsWith("text-")) category = "Text";
    else if (tokenName.startsWith("border-")) category = "Border";
    else if (tokenName.startsWith("surface-")) category = "Surface";

    if (!semanticCategories[category]) semanticCategories[category] = [];
    semanticCategories[category].push({
      name: tokenName,
      var: `--color-${tokenName}`,
      lightRef: lightRefs[tokenName],
      darkRef: darkRefs[tokenName] ?? lightRefs[tokenName],
    });
  }

  // Parse spacing (--space-*)
  const spacingItems: { label: string; var: string; px: string }[] = [];
  const spaceRegex = /--space-([\w-]+):\s*([^;]+);/g;
  while ((m = spaceRegex.exec(css)) !== null) {
    spacingItems.push({ label: m[1], var: `--space-${m[1]}`, px: m[2].trim() });
  }

  // Parse shadows (--shadow-*)
  const shadowItems: { label: string; var: string; value: string }[] = [];
  const shadowRegex = /--shadow-([\w-]+):\s*([^;]+);/g;
  while ((m = shadowRegex.exec(css)) !== null) {
    shadowItems.push({ label: m[1], var: `--shadow-${m[1]}`, value: m[2].trim() });
  }

  // Build semantic tokens array
  const semanticTokensArr = Object.entries(semanticCategories)
    .filter(([, tokens]) => tokens.length > 0)
    .map(([category, tokens]) => ({
      category,
      tokens,
    }));

  return `// Auto-generated from globals.css — design system token data
// ─── Site Info ──────────────────────────────────────────────────
export const siteInfo = {
  name: ${JSON.stringify(name)},
  domain: ${JSON.stringify(domain)},
};

// ─── Typography ─────────────────────────────────────────────────
export const fonts = {
  display: ${JSON.stringify(fontDisplay)},
  sans: ${JSON.stringify(fontSans)},
  mono: ${JSON.stringify(fontMono)},
};

export const fontSizes: { label: string; size: string; sample: string }[] = [
  { label: "xs", size: "12px", sample: "Extra Small" },
  { label: "sm", size: "14px", sample: "Small" },
  { label: "base", size: "16px", sample: "Base" },
  { label: "lg", size: "18px", sample: "Large" },
  { label: "xl", size: "20px", sample: "Extra Large" },
  { label: "2xl", size: "24px", sample: "Heading 2XL" },
  { label: "3xl", size: "30px", sample: "Heading 3XL" },
  { label: "4xl", size: "36px", sample: "Heading 4XL" },
  { label: "display", size: "48px", sample: "Display" },
];

export const fontWeights: { label: string; weight: number }[] = [
  { label: "regular", weight: 400 },
  { label: "medium", weight: 500 },
  { label: "semibold", weight: 600 },
  { label: "bold", weight: 700 },
];

// ─── Spacing ────────────────────────────────────────────────────
export const spacing: { label: string; var: string; px: string }[] = ${JSON.stringify(spacingItems, null, 2)};

// ─── Border Radius ──────────────────────────────────────────────
export const radii: { label: string; value: string }[] = [
  { label: "sm", value: "4px" },
  { label: "md", value: "8px" },
  { label: "lg", value: "12px" },
  { label: "xl", value: "16px" },
  { label: "pill", value: "9999px" },
];

// ─── Shadows ────────────────────────────────────────────────────
export const shadows: { label: string; var: string; value: string }[] = ${JSON.stringify(shadowItems, null, 2)};

// ─── Primitive Palette ──────────────────────────────────────────
export const primitives: { name: string; var: string; hex: string }[] = ${JSON.stringify(primitives, null, 2)};

// ─── Semantic Tokens ────────────────────────────────────────────
export const semanticTokens: {
  category: string;
  tokens: { name: string; var: string; lightRef: string; darkRef: string }[];
}[] = ${JSON.stringify(semanticTokensArr, null, 2)};
`;
}
