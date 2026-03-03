import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import type { FrameworkAdapter, TemplateFile, PhaseValidation, PipelineMode } from "@guataiba/isac-core";
import { DESIGN_TOKENS_CSS_TEMPLATE } from "@guataiba/isac-core";
import { getDsPageBuilderPrompt } from "./prompts/ds-page-builder.js";
import { getPagePlannerPrompt } from "./prompts/page-planner.js";
import { getPageBuilderPrompt } from "./prompts/page-builder.js";
import { getVisualVerifierPrompt } from "./prompts/visual-verifier.js";
import { DESIGN_SYSTEM_PAGE_TEMPLATE } from "./templates/design-system-page.tsx.js";
import { DESIGN_SYSTEM_LAYOUT_TEMPLATE } from "./templates/design-system-layout.tsx.js";
import { DESIGN_SYSTEM_DATA_TEMPLATE } from "./templates/design-system-data.ts.js";
import { THEME_TOGGLE_TEMPLATE } from "./templates/theme-toggle.tsx.js";

// ── Font normalization ──────────────────────────────────────────────

function normalizeFontVars(css: string): string {
  let result = css;

  const aliases: [RegExp, string][] = [
    [/--font-family-sans/g, "--font-sans"],
    [/--font-body/g, "--font-sans"],
    [/--font-family-serif/g, "--font-display"],
    [/--font-serif/g, "--font-display"],
    [/--font-heading/g, "--font-display"],
    [/--font-family-display/g, "--font-display"],
    [/--font-family-mono/g, "--font-mono"],
    [/--font-code/g, "--font-mono"],
  ];

  for (const [pattern, canonical] of aliases) {
    if (!result.includes(`${canonical}:`) && !result.includes(`${canonical})`)) {
      result = result.replace(pattern, canonical);
    }
  }

  return result;
}

// ── Fallback data.ts generator ──────────────────────────────────────

function generateFallbackDataTs(css: string, url: string, cwd?: string): string {
  let domain = "example.com";
  let name = "Example Site";
  try {
    const u = new URL(url);
    domain = u.hostname.replace(/^www\./, "");
    name = domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1);
  } catch { /* fallback */ }

  const primitives: { name: string; var: string; hex: string }[] = [];
  const sfRegex = /--sf-([\w-]+):\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = sfRegex.exec(css)) !== null) {
    primitives.push({ name: m[1], var: `--sf-${m[1]}`, hex: m[2].trim() });
  }

  const fontSansMatch = css.match(/--font-sans:\s*([^;]+);/);
  const fontDisplayMatch = css.match(/--font-display:\s*([^;]+);/);
  const fontMonoMatch = css.match(/--font-mono:\s*([^;]+);/);
  const fontSans = fontSansMatch?.[1]?.trim() ?? "system-ui, -apple-system, sans-serif";
  const fontDisplay = fontDisplayMatch?.[1]?.trim() ?? fontSans;
  const fontMono = fontMonoMatch?.[1]?.trim() ?? '"SF Mono", ui-monospace, monospace';

  const rootBlock = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
  const darkBlock = css.match(/\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";

  const semanticCategories: Record<string, { name: string; var: string; lightRef: string; darkRef: string }[]> = {
    Background: [], Text: [], Border: [], Surface: [], Accent: [],
  };

  const colorRegex = /--color-([\w-]+):\s*var\(--sf-([\w-]+)\)/g;

  const lightRefs: Record<string, string> = {};
  let cm: RegExpExecArray | null;
  while ((cm = colorRegex.exec(rootBlock)) !== null) {
    lightRefs[cm[1]] = cm[2];
  }

  colorRegex.lastIndex = 0;
  const darkRefs: Record<string, string> = {};
  while ((cm = colorRegex.exec(darkBlock)) !== null) {
    darkRefs[cm[1]] = cm[2];
  }

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

  const spacingItems: { label: string; var: string; px: string }[] = [];
  const spaceRegex = /--space-([\w-]+):\s*([^;]+);/g;
  while ((m = spaceRegex.exec(css)) !== null) {
    spacingItems.push({ label: m[1], var: `--space-${m[1]}`, px: m[2].trim() });
  }

  const shadowItems: { label: string; var: string; value: string }[] = [];
  const shadowRegex = /--shadow-([\w-]+):\s*([^;]+);/g;
  while ((m = shadowRegex.exec(css)) !== null) {
    shadowItems.push({ label: m[1], var: `--shadow-${m[1]}`, value: m[2].trim() });
  }

  const semanticTokensArr = Object.entries(semanticCategories)
    .filter(([, tokens]) => tokens.length > 0)
    .map(([category, tokens]) => ({ category, tokens }));

  // Try reading brand data for real site info
  let tagline = "";
  let description = "";
  let logoUrl = "";
  let faviconUrl = "";
  let ogImageUrl = "";
  let aboutText = "";
  try {
    const brandDir = cwd ? join(cwd, ".claude/branding") : "";
    const brandPath = brandDir ? join(brandDir, "brand-data.json") : "";
    if (brandPath && existsSync(brandPath)) {
      const brand = JSON.parse(readFileSync(brandPath, "utf-8"));
      if (brand.companyName) name = brand.companyName;
      tagline = brand.tagline ?? "";
      description = brand.description ?? "";
      logoUrl = brand.logoUrl ?? "";
      faviconUrl = brand.faviconUrl ?? "";
      ogImageUrl = brand.ogImageUrl ?? "";
      aboutText = brand.aboutText ?? "";
    }
  } catch { /* ignore */ }

  // Try reading icon data
  let iconLibrary = "none";
  let iconNames: string[] = [];
  let iconCount = 0;
  try {
    const iconPath = cwd ? join(cwd, ".claude/icons/icon-data.json") : "";
    if (iconPath && existsSync(iconPath)) {
      const iconData = JSON.parse(readFileSync(iconPath, "utf-8"));
      iconLibrary = iconData.library ?? "none";
      iconNames = iconData.icons ?? [];
      iconCount = iconData.count ?? 0;
    }
  } catch { /* ignore */ }

  return `// Auto-generated from globals.css — design system token data
// ─── Site Info ──────────────────────────────────────────────────
export const siteInfo = {
  name: ${JSON.stringify(name)},
  domain: ${JSON.stringify(domain)},
  tagline: ${JSON.stringify(tagline)},
  description: ${JSON.stringify(description)},
};

// ─── Branding ───────────────────────────────────────────────────
export const branding = {
  logoUrl: ${JSON.stringify(logoUrl)},
  faviconUrl: ${JSON.stringify(faviconUrl)},
  ogImageUrl: ${JSON.stringify(ogImageUrl)},
  aboutText: ${JSON.stringify(aboutText)},
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

// ─── Icons ─────────────────────────────────────────────────────
export const icons: { library: string; names: string[]; count: number } = {
  library: ${JSON.stringify(iconLibrary)},
  names: ${JSON.stringify(iconNames)},
  count: ${iconCount},
};

// ─── Primitive Palette ──────────────────────────────────────────
export const primitives: { name: string; var: string; hex: string }[] = ${JSON.stringify(primitives, null, 2)};

// ─── Semantic Tokens ────────────────────────────────────────────
export const semanticTokens: {
  category: string;
  tokens: { name: string; var: string; lightRef: string; darkRef: string }[];
}[] = ${JSON.stringify(semanticTokensArr, null, 2)};
`;
}

// ── File collection helper ──────────────────────────────────────────

function collectFilesRecursive(currentDir: string, baseDir: string, files: string[]) {
  try {
    const entries = readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== ".next") {
          collectFilesRecursive(fullPath, baseDir, files);
        }
      } else if (
        entry.name.endsWith(".tsx") ||
        entry.name.endsWith(".ts") ||
        entry.name.endsWith(".css")
      ) {
        files.push(fullPath.replace(baseDir + "/", ""));
      }
    }
  } catch {
    // ignore
  }
}

// ── Adapter implementation ──────────────────────────────────────────

export const nextjsAdapter: FrameworkAdapter = {
  name: "nextjs",
  displayName: "Next.js (App Router)",

  // ─── Prompts ─────────────────────────────────────────────

  getDesignSystemPrompt(screenshotDir: string, mode?: PipelineMode): string {
    return getDsPageBuilderPrompt(screenshotDir, mode);
  },

  getPagePlannerPrompt(screenshotDir: string): string {
    return getPagePlannerPrompt(screenshotDir);
  },

  getPageBuilderPrompt(plan: string, screenshotDir: string, corrections?: string): string {
    return getPageBuilderPrompt(plan, screenshotDir, corrections);
  },

  getVisualVerifierPrompt(screenshotDir: string): string {
    return getVisualVerifierPrompt(screenshotDir);
  },

  // ─── Paths & Conventions ────────────────────────────────

  getGlobalCssPath(): string {
    return "app/globals.css";
  },

  getMainPagePath(): string {
    return "app/page.tsx";
  },

  getDesignSystemDataPath(): string {
    return "app/design-system/data.ts";
  },

  getRequiredDirs(): string[] {
    return ["public/fonts"];
  },

  getBuildCommand(): string {
    return "npm run build";
  },

  getQuickCheckCommand(): string {
    return "npx tsc --noEmit";
  },

  getDevServerUrl(): string {
    return "http://localhost:3000";
  },

  // ─── Templates ──────────────────────────────────────────

  getDesignSystemTemplates(): TemplateFile[] {
    return [
      { path: "app/design-system/page.tsx", content: DESIGN_SYSTEM_PAGE_TEMPLATE },
      { path: "app/design-system/layout.tsx", content: DESIGN_SYSTEM_LAYOUT_TEMPLATE },
      { path: "app/design-system/components/theme-toggle.tsx", content: THEME_TOGGLE_TEMPLATE },
      { path: "app/components/theme-toggle.tsx", content: THEME_TOGGLE_TEMPLATE },
      // NOTE: data.ts is NOT included here — it's written as a stub in pre-flight
      // and then overwritten by Phase 1B with real data. Including it here would
      // cause the post-phase writeDesignSystemTemplates() to overwrite Phase 1B's output.
    ];
  },

  getStubDataTemplate(): TemplateFile {
    return { path: "app/design-system/data.ts", content: DESIGN_SYSTEM_DATA_TEMPLATE };
  },

  getDesignTokensCssTemplate(): string {
    return DESIGN_TOKENS_CSS_TEMPLATE;
  },

  getDesignSystemDataTemplate(): string {
    return DESIGN_SYSTEM_DATA_TEMPLATE;
  },

  // ─── Validation ─────────────────────────────────────────

  validateTokenExtraction(cwd: string): PhaseValidation {
    const globalsPath = join(cwd, "app/globals.css");
    if (!existsSync(globalsPath)) {
      return { valid: false, message: "app/globals.css not created" };
    }

    const content = readFileSync(globalsPath, "utf-8");
    const hasSfTokens = content.includes("--sf-");
    const hasColorTokens = content.includes("--color-");

    if (!hasSfTokens || !hasColorTokens) {
      return { valid: false, message: "globals.css missing --sf- or --color- tokens" };
    }

    const primitiveCount = (content.match(/--sf-/g) ?? []).length;
    const semanticCount = (content.match(/--color-/g) ?? []).length;
    return {
      valid: true,
      message: `${primitiveCount} primitives, ${semanticCount} semantics, dark mode ready`,
    };
  },

  postProcessTokenExtraction(cwd: string): void {
    const globalsPath = join(cwd, "app/globals.css");
    if (!existsSync(globalsPath)) return;

    let content = readFileSync(globalsPath, "utf-8");

    // Font normalization
    const preNormalize = content;
    content = normalizeFontVars(content);
    if (content !== preNormalize) {
      writeFileSync(globalsPath, content, "utf-8");
    }

    // Ensure --font-sans, --font-display, --font-mono exist
    const hasFontSans = content.includes("--font-sans:");
    const hasFontDisplay = content.includes("--font-display:");
    const hasFontMono = content.includes("--font-mono:");

    if (!hasFontSans || !hasFontDisplay || !hasFontMono) {
      const fontVars = [
        !hasFontSans ? "  --font-sans: system-ui, -apple-system, sans-serif;" : "",
        !hasFontDisplay ? "  --font-display: system-ui, sans-serif;" : "",
        !hasFontMono ? '  --font-mono: "SF Mono", "Fira Code", ui-monospace, monospace;' : "",
      ]
        .filter(Boolean)
        .join("\n");
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
    }
  },

  validateDesignSystem(cwd: string): PhaseValidation {
    const dsDataPath = join(cwd, "app/design-system/data.ts");
    if (existsSync(dsDataPath)) {
      return { valid: true, message: "app/design-system/data.ts created" };
    }
    return { valid: false, message: "app/design-system/data.ts not found" };
  },

  generateDesignSystemFallback(cwd: string, url: string): void {
    const globalsPath = join(cwd, "app/globals.css");
    const dsDataPath = join(cwd, "app/design-system/data.ts");

    if (!existsSync(globalsPath)) return;

    const css = readFileSync(globalsPath, "utf-8");
    const fallback = generateFallbackDataTs(css, url, cwd);
    mkdirSync(dirname(dsDataPath), { recursive: true });
    writeFileSync(dsDataPath, fallback, "utf-8");
  },

  validateImplementation(cwd: string): PhaseValidation {
    const pagePath = join(cwd, "app/page.tsx");
    if (!existsSync(pagePath)) {
      return { valid: false, message: "app/page.tsx not created" };
    }
    return { valid: true };
  },

  collectCreatedFiles(cwd: string): string[] {
    const files: string[] = [];
    const appDir = join(cwd, "app");
    try {
      collectFilesRecursive(appDir, cwd, files);
    } catch {
      // app dir may not exist
    }
    return files;
  },
};
