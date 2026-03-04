import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { PipelineMode } from "./types.js";

// ── Types ───────────────────────────────────────────────────────────

interface FontFace {
  family: string;
  url?: string;
  weight?: string;
  style?: string;
}

interface FontData {
  fontFaces: FontFace[];
  roles: {
    body?: string;
    heading?: string;
    mono?: string;
  };
}

interface ColorData {
  backgrounds: {
    page: string | null;
    header: string | null;
    card: string | null;
    footer: string | null;
  };
  text: {
    heading: string | null;
    body: string | null;
    muted: string | null;
    link: string | null;
  };
  accents: {
    primary: string | null;
    primaryText: string | null;
  };
  borders: {
    default: string | null;
  };
  surfaces: {
    input: string | null;
  };
  _cssVars?: Record<string, string>;
}

// ── Gray scale steps ────────────────────────────────────────────────

const GRAY_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

/** Tailwind default gray scale — used as fallback when extracted data is unusable */
const DEFAULT_GRAY_SCALE: Map<number, string> = new Map([
  [50, "#f9fafb"], [100, "#f3f4f6"], [200, "#e5e7eb"],
  [300, "#d1d5db"], [400, "#9ca3af"], [500, "#6b7280"],
  [600, "#4b5563"], [700, "#374151"], [800, "#1f2937"],
  [900, "#111827"], [950, "#030712"],
]);

// ── Default fallbacks ───────────────────────────────────────────────

const DEFAULT_FONT: FontData = {
  fontFaces: [],
  roles: {
    body: "system-ui, -apple-system, sans-serif",
    heading: "system-ui, -apple-system, sans-serif",
    mono: '"SF Mono", ui-monospace, monospace',
  },
};

const DEFAULT_COLORS: ColorData = {
  backgrounds: { page: "#ffffff", header: "#f9fafb", card: "#ffffff", footer: "#f9fafb" },
  text: { heading: "#111827", body: "#1f2937", muted: "#6b7280", link: "#2563eb" },
  accents: { primary: "#2563eb", primaryText: "#ffffff" },
  borders: { default: "#e5e7eb" },
  surfaces: { input: "#ffffff" },
};

// ── Color utilities ─────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3
    ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[clamp(r), clamp(g), clamp(b)].map(v => v.toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

/** Relative luminance (0..1) from hex */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const srgb = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/** WCAG contrast ratio between two hex colors (1..21) */
function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function isValidHex(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

// ── Sanity checks ───────────────────────────────────────────────────

/**
 * Check if extracted color data is minimally usable for a light theme.
 * Returns false when Phase 0 produced garbage (e.g. consent screen, dark-only site).
 *
 * Note: individual field issues (white-on-white heading, bad card color) are handled
 * by mergeColorDefaults(). This function detects *structural* problems where the
 * entire extraction is unusable.
 */
function isColorDataSane(colorData: ColorData): boolean {
  const bg = colorData.backgrounds.page;

  // 1. Page background must exist and be "light" (luminance > 0.3).
  //    A dark page bg in the "light" extraction means the site loaded in dark mode
  //    or hit a consent/login wall (e.g. YouTube → #000000).
  if (isValidHex(bg) && luminance(bg) < 0.3) return false;

  // 2. Must have at least 2 non-null text colors.
  //    If most text values are null, the extractor hit a wall or empty page.
  const textValues = Object.values(colorData.text);
  const nonNullText = textValues.filter(v => isValidHex(v)).length;
  if (nonNullText < 2) return false;

  // 3. At least 3 distinct colors total — a real site has visual variety.
  const allColors = new Set<string>();
  for (const val of Object.values(colorData.backgrounds)) {
    if (isValidHex(val)) allColors.add(val.toLowerCase());
  }
  for (const val of Object.values(colorData.text)) {
    if (isValidHex(val)) allColors.add(val.toLowerCase());
  }
  for (const val of Object.values(colorData.accents)) {
    if (isValidHex(val)) allColors.add(val.toLowerCase());
  }
  if (allColors.size < 3) return false;

  return true;
}

// ── Interpolation ───────────────────────────────────────────────────

/** Interpolate between two hex colors in HSL space at ratio t (0..1) */
function interpolateHsl(hex1: string, hex2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  let [h1, s1, l1] = rgbToHsl(r1, g1, b1);
  let [h2, s2, l2] = rgbToHsl(r2, g2, b2);

  // When an endpoint is achromatic (gray/white/black), its hue is arbitrary (0°).
  // Adopt the other color's hue to prevent tinted grays (e.g. purple-tinted neutrals).
  if (s1 < 0.04 && s2 >= 0.04) h1 = h2;
  else if (s2 < 0.04 && s1 >= 0.04) h2 = h1;
  else if (s1 < 0.04 && s2 < 0.04) { h1 = 0; h2 = 0; }

  // Use the shorter arc for hue interpolation
  let hDiff = h2 - h1;
  if (hDiff > 180) hDiff -= 360;
  if (hDiff < -180) hDiff += 360;

  const h = h1 + hDiff * t;
  const s = s1 + (s2 - s1) * t;
  const l = l1 + (l2 - l1) * t;
  const [r, g, b] = hslToRgb(h < 0 ? h + 360 : h, s, l);
  return rgbToHex(r, g, b);
}

// ── Helpers ─────────────────────────────────────────────────────────

function readJsonSafe<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  try {
    let parsed = JSON.parse(readFileSync(path, "utf-8"));
    // Handle double-stringified JSON (agent-browser eval wraps return values)
    if (typeof parsed === "string") {
      try { parsed = JSON.parse(parsed); } catch { return fallback; }
    }
    // If it's still not an object, use fallback
    if (typeof parsed !== "object" || parsed === null) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

/** Sanitize a font family into a valid filename stem */
function fontFileName(family: string): string {
  return family.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "");
}

// ── Builders ────────────────────────────────────────────────────────

function buildFontFaces(fontData: FontData, cwd: string): string {
  const rules: string[] = [];
  const fontsDir = join(cwd, "public/fonts");

  // Find all .woff2 files in public/fonts
  let woff2Files: string[] = [];
  try {
    woff2Files = readdirSync(fontsDir).filter(f => f.endsWith(".woff2"));
  } catch {
    // Directory doesn't exist
  }

  for (const face of fontData.fontFaces) {
    if (!face.family) continue;

    // Try to find a matching woff2 file
    const stem = fontFileName(face.family);
    const weight = face.weight ?? "400";
    const style = face.style ?? "normal";

    // Look for exact match or partial match
    const matchingFile = woff2Files.find(f => {
      const lower = f.toLowerCase();
      const stemLower = stem.toLowerCase();
      return lower === `${stemLower}.woff2`
        || lower === `${stemLower}-${weight}.woff2`
        || lower.startsWith(stemLower);
    });

    if (!matchingFile) continue;

    // Verify the file actually exists and has content
    const fullPath = join(fontsDir, matchingFile);
    try {
      const stat = readFileSync(fullPath);
      if (stat.length < 100) continue; // Likely corrupt
    } catch {
      continue;
    }

    rules.push(`@font-face {
  font-family: "${face.family}";
  src: url("/fonts/${matchingFile}") format("woff2");
  font-weight: ${weight};
  font-style: ${style};
  font-display: swap;
}`);
  }

  return rules.join("\n\n");
}

function buildFontVars(roles: FontData["roles"]): {
  fontSans: string;
  fontDisplay: string;
  fontMono: string;
} {
  return {
    fontSans: roles?.body ?? "system-ui, -apple-system, sans-serif",
    fontDisplay: roles?.heading ?? roles?.body ?? "system-ui, sans-serif",
    fontMono: roles?.mono ?? '"SF Mono", "Fira Code", ui-monospace, monospace',
  };
}

interface PrimitiveScale {
  grays: Map<number, string>; // step → hex
  accent: string;
  accentText: string;
  white: string;
  black: string;
  link: string | null;
}

/** CSS var names that commonly hold a site's primary/accent color */
const CSS_VAR_ACCENT_NAMES = [
  "--primary-color", "--accent-color", "--brand-color",
  "--primary", "--accent", "--color-primary",
  "--theme-primary", "--color-accent", "--brand-primary",
];

/** Extract a valid accent color from CSS custom properties, if any */
function resolveCssVarAccent(cssVars?: Record<string, string>): string | null {
  if (!cssVars) return null;
  for (const name of CSS_VAR_ACCENT_NAMES) {
    const val = cssVars[name];
    if (isValidHex(val) && val.toLowerCase() !== "#ffffff" && val.toLowerCase() !== "#000000") {
      return val;
    }
  }
  return null;
}

function buildPrimitiveScale(colorData: ColorData): PrimitiveScale {
  // Determine lightest and darkest colors from the palette
  const lightest = isValidHex(colorData.backgrounds.page)
    ? colorData.backgrounds.page
    : "#ffffff";
  const darkest = isValidHex(colorData.text.heading)
    ? colorData.text.heading
    : "#111827";

  // Sanity check: if lightest ≈ darkest, use Tailwind default gray scale
  const lumDiff = Math.abs(luminance(lightest) - luminance(darkest));
  if (lumDiff < 0.1) {
    return {
      grays: new Map(DEFAULT_GRAY_SCALE),
      accent: isValidHex(colorData.accents.primary) ? colorData.accents.primary : "#2563eb",
      accentText: isValidHex(colorData.accents.primaryText) ? colorData.accents.primaryText : "#ffffff",
      white: "#ffffff",
      black: "#000000",
      link: isValidHex(colorData.text.link) ? colorData.text.link : null,
    };
  }

  // Collect all neutral-ish colors to detect the hue/saturation of grays
  const neutralSamples: string[] = [];
  for (const val of Object.values(colorData.backgrounds)) {
    if (isValidHex(val)) neutralSamples.push(val);
  }
  for (const val of [colorData.text.heading, colorData.text.body, colorData.text.muted]) {
    if (isValidHex(val)) neutralSamples.push(val);
  }
  if (isValidHex(colorData.borders.default)) neutralSamples.push(colorData.borders.default);

  // Interpolate 11 gray steps from lightest to darkest
  const grays = new Map<number, string>();
  for (let i = 0; i < GRAY_STEPS.length; i++) {
    const t = i / (GRAY_STEPS.length - 1);
    grays.set(GRAY_STEPS[i], interpolateHsl(lightest, darkest, t));
  }

  // If we have real intermediate colors, snap the closest gray step to them
  // for better fidelity to the original design
  const intermediates: Array<{ hex: string; lum: number }> = [];
  for (const hex of neutralSamples) {
    const lum = luminance(hex);
    intermediates.push({ hex, lum });
  }
  intermediates.sort((a, b) => b.lum - a.lum); // lightest first

  for (const { hex } of intermediates) {
    const step = closestGrayStep(hex, grays);
    if (step !== null) {
      // Clamp: light steps (50-200) must stay light, dark steps (800-950) must stay dark
      const snapLum = luminance(hex);
      if (step <= 200 && snapLum <= 0.5) continue;  // too dark for a light step
      if (step >= 800 && snapLum >= 0.3) continue;   // too light for a dark step
      grays.set(step, hex);
    }
  }

  // Use the accent already resolved by mergeColorDefaults (CSS vars are fallback there)
  const accent = isValidHex(colorData.accents.primary)
    ? colorData.accents.primary
    : "#2563eb";
  const accentText = isValidHex(colorData.accents.primaryText)
    ? colorData.accents.primaryText
    : "#ffffff";
  const link = isValidHex(colorData.text.link)
    ? colorData.text.link
    : null;

  return {
    grays,
    accent,
    accentText,
    white: "#ffffff",
    black: "#000000",
    link,
  };
}

function closestGrayStep(hex: string, scale: Map<number, string>): number | null {
  const lum = luminance(hex);
  let closest: number | null = null;
  let minDiff = Infinity;

  for (const [step, stepHex] of scale) {
    const stepLum = luminance(stepHex);
    const diff = Math.abs(lum - stepLum);
    if (diff < minDiff) {
      minDiff = diff;
      closest = step;
    }
  }

  return closest;
}

/**
 * Check if the dark palette's neutral tint diverges from the light gray scale.
 * Returns true when average hue differs by >30deg or saturation differs by >0.15.
 */
function isDarkPaletteDivergent(
  lightGrays: Map<number, string>,
  darkGrays: Map<number, string>,
): boolean {
  function avgHueSat(grays: Map<number, string>): { hue: number; sat: number } {
    let hueSum = 0;
    let satSum = 0;
    let count = 0;
    for (const hex of grays.values()) {
      const [r, g, b] = hexToRgb(hex);
      const [h, s] = rgbToHsl(r, g, b);
      // Skip achromatic grays (s ≈ 0) — they have no meaningful hue
      if (s < 0.01) continue;
      hueSum += h;
      satSum += s;
      count++;
    }
    if (count === 0) return { hue: 0, sat: 0 };
    return { hue: hueSum / count, sat: satSum / count };
  }

  const light = avgHueSat(lightGrays);
  const dark = avgHueSat(darkGrays);

  // Hue difference on the circular 0-360 scale
  let hueDiff = Math.abs(light.hue - dark.hue);
  if (hueDiff > 180) hueDiff = 360 - hueDiff;

  const satDiff = Math.abs(light.sat - dark.sat);

  return hueDiff > 30 || satDiff > 0.15;
}

/** Find the gray step whose luminance is closest to the given hex */
function matchToGrayVar(hex: string | null, scale: Map<number, string>, fallbackStep: number): string {
  if (!isValidHex(hex)) return `var(--sf-gray-${fallbackStep})`;
  const step = closestGrayStep(hex, scale);
  return `var(--sf-gray-${step ?? fallbackStep})`;
}

function buildSemanticTokens(colorData: ColorData, primitives: PrimitiveScale): string {
  const { grays } = primitives;
  const lines: string[] = [];

  lines.push("  /* Backgrounds */");
  lines.push(`  --color-bg-primary: ${matchToGrayVar(colorData.backgrounds.page, grays, 50)};`);
  lines.push(`  --color-bg-secondary: ${matchToGrayVar(colorData.backgrounds.header, grays, 50)};`);
  lines.push(`  --color-bg-tertiary: ${matchToGrayVar(colorData.backgrounds.card, grays, 100)};`);

  // Glass: use the page background with opacity
  const pageBg = isValidHex(colorData.backgrounds.page) ? colorData.backgrounds.page : "#ffffff";
  const [pr, pg, pb] = hexToRgb(pageBg);
  lines.push(`  --color-bg-glass: rgba(${pr}, ${pg}, ${pb}, 0.8);`);

  lines.push("");
  lines.push("  /* Text */");
  lines.push(`  --color-text-primary: ${matchToGrayVar(colorData.text.heading, grays, 900)};`);
  lines.push(`  --color-text-secondary: ${matchToGrayVar(colorData.text.muted, grays, 500)};`);
  lines.push(`  --color-text-tertiary: ${matchToGrayVar(colorData.text.body, grays, 400)};`);
  lines.push("  --color-text-inverse: var(--sf-white);");

  lines.push("");
  lines.push("  /* Borders */");
  lines.push(`  --color-border-primary: ${matchToGrayVar(colorData.borders.default, grays, 200)};`);
  // secondary = one step darker than primary
  const borderStep = closestGrayStep(
    isValidHex(colorData.borders.default) ? colorData.borders.default : "#e5e7eb",
    grays,
  ) ?? 200;
  const borderSecondaryStep = Math.min(borderStep + 100, 950);
  lines.push(`  --color-border-secondary: var(--sf-gray-${borderSecondaryStep});`);
  // subtle = one step lighter than primary
  const borderSubtleStep = Math.max(borderStep - 100, 50);
  lines.push(`  --color-border-subtle: var(--sf-gray-${borderSubtleStep});`);

  lines.push("");
  lines.push("  /* Surfaces */");
  lines.push("  --color-surface-elevated: var(--sf-white);");
  lines.push(`  --color-surface-sunken: ${matchToGrayVar(colorData.backgrounds.footer ?? colorData.backgrounds.header, grays, 50)};`);

  lines.push("");
  lines.push("  /* Accent */");
  lines.push("  --color-accent: var(--sf-accent);");
  if (primitives.link) {
    lines.push("  --color-text-link: var(--sf-link);");
  }

  return lines.join("\n");
}

function buildDarkOverrides(
  darkData: ColorData | null,
  primitives: PrimitiveScale,
  darkGrays?: Map<number, string>,
): string {
  const grays = darkGrays ?? primitives.grays;
  const lines: string[] = [];

  // When dark palette diverges, override --sf-gray-* in the dark block
  if (darkGrays) {
    lines.push("  /* ─── Dark gray overrides ─── */");
    for (const step of GRAY_STEPS) {
      const hex = darkGrays.get(step) ?? "#888888";
      lines.push(`  --sf-gray-${step}: ${hex};`);
    }
    lines.push("");
  }

  if (darkData && hasAnyColor(darkData)) {
    // Use real dark mode data
    lines.push("  /* Backgrounds */");
    lines.push(`  --color-bg-primary: ${matchToGrayVar(darkData.backgrounds.page, grays, 950)};`);
    lines.push(`  --color-bg-secondary: ${matchToGrayVar(darkData.backgrounds.header, grays, 900)};`);
    lines.push(`  --color-bg-tertiary: ${matchToGrayVar(darkData.backgrounds.card, grays, 800)};`);

    const darkBg = isValidHex(darkData.backgrounds.page) ? darkData.backgrounds.page : "#0a0a0a";
    const [dr, dg, db] = hexToRgb(darkBg);
    lines.push(`  --color-bg-glass: rgba(${dr}, ${dg}, ${db}, 0.8);`);

    lines.push("");
    lines.push("  /* Text */");
    lines.push(`  --color-text-primary: ${matchToGrayVar(darkData.text.heading, grays, 100)};`);
    lines.push(`  --color-text-secondary: ${matchToGrayVar(darkData.text.muted, grays, 400)};`);
    lines.push(`  --color-text-tertiary: ${matchToGrayVar(darkData.text.body, grays, 600)};`);
    lines.push("  --color-text-inverse: var(--sf-gray-950);");

    lines.push("");
    lines.push("  /* Borders */");
    lines.push(`  --color-border-primary: ${matchToGrayVar(darkData.borders.default, grays, 800)};`);
    lines.push("  --color-border-secondary: var(--sf-gray-700);");
    lines.push("  --color-border-subtle: var(--sf-gray-800);");

    lines.push("");
    lines.push("  /* Surfaces */");
    lines.push("  --color-surface-elevated: var(--sf-gray-900);");
    lines.push("  --color-surface-sunken: var(--sf-gray-950);");

    lines.push("");
    lines.push("  /* Accent */");
    lines.push("  --color-accent: var(--sf-accent);");
    if (primitives.link) {
      lines.push("  --color-text-link: var(--sf-link);");
    }
  } else {
    // Invert: swap light → dark by reversing the gray scale
    lines.push("  /* Backgrounds */");
    lines.push("  --color-bg-primary: var(--sf-gray-950);");
    lines.push("  --color-bg-secondary: var(--sf-gray-900);");
    lines.push("  --color-bg-tertiary: var(--sf-gray-800);");
    lines.push("  --color-bg-glass: rgba(10, 10, 10, 0.8);");

    lines.push("");
    lines.push("  /* Text */");
    lines.push("  --color-text-primary: var(--sf-gray-100);");
    lines.push("  --color-text-secondary: var(--sf-gray-400);");
    lines.push("  --color-text-tertiary: var(--sf-gray-600);");
    lines.push("  --color-text-inverse: var(--sf-gray-950);");

    lines.push("");
    lines.push("  /* Borders */");
    lines.push("  --color-border-primary: var(--sf-gray-800);");
    lines.push("  --color-border-secondary: var(--sf-gray-700);");
    lines.push("  --color-border-subtle: var(--sf-gray-800);");

    lines.push("");
    lines.push("  /* Surfaces */");
    lines.push("  --color-surface-elevated: var(--sf-gray-900);");
    lines.push("  --color-surface-sunken: var(--sf-gray-950);");

    lines.push("");
    lines.push("  /* Accent */");
    lines.push("  --color-accent: var(--sf-accent);");
    if (primitives.link) {
      lines.push("  --color-text-link: var(--sf-link);");
    }
  }

  // Always include Tailwind bridge in dark mode
  lines.push("");
  lines.push("  /* Tailwind bridge */");
  lines.push("  --background: var(--color-bg-primary);");
  lines.push("  --foreground: var(--color-text-primary);");

  return lines.join("\n");
}

function hasAnyColor(data: ColorData): boolean {
  for (const val of Object.values(data.backgrounds)) {
    if (isValidHex(val)) return true;
  }
  for (const val of Object.values(data.text)) {
    if (isValidHex(val)) return true;
  }
  return false;
}

function buildThemeBridge(fontVars: { fontSans: string; fontMono: string }): string {
  // Tailwind v4 @theme inline block
  // Use explicit font values to avoid self-referential var(--font-sans) → --font-sans
  return `@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: ${fontVars.fontSans};
  --font-mono: ${fontVars.fontMono};
}`;
}

// ── Main assembler ──────────────────────────────────────────────────

function assembleCss(
  fontFaceRules: string,
  fontVars: { fontSans: string; fontDisplay: string; fontMono: string },
  primitives: PrimitiveScale,
  semantics: string,
  darkOverrides: string,
  themeBridge: string,
): string {
  const lines: string[] = [];

  // 1. Tailwind import
  lines.push('@import "tailwindcss";');
  lines.push("");

  // 2. @font-face declarations
  if (fontFaceRules) {
    lines.push(fontFaceRules);
    lines.push("");
  }

  // 3. :root block
  lines.push(":root {");
  lines.push("  /* ─── Primitive palette ─── */");
  lines.push(`  --sf-white: ${primitives.white};`);
  lines.push(`  --sf-black: ${primitives.black};`);
  for (const step of GRAY_STEPS) {
    const hex = primitives.grays.get(step) ?? "#888888";
    lines.push(`  --sf-gray-${step}: ${hex};`);
  }
  lines.push(`  --sf-accent: ${primitives.accent};`);
  if (primitives.link) {
    lines.push(`  --sf-link: ${primitives.link};`);
  }

  lines.push("");
  lines.push("  /* ─── Font families ─── */");
  lines.push(`  --font-sans: ${fontVars.fontSans};`);
  lines.push(`  --font-display: ${fontVars.fontDisplay};`);
  lines.push(`  --font-mono: ${fontVars.fontMono};`);

  lines.push("");
  lines.push("  /* ─── Semantic tokens (light = default) ─── */");
  lines.push(semantics);

  lines.push("");
  lines.push("  /* ─── Tailwind bridge ─── */");
  lines.push("  --background: var(--color-bg-primary);");
  lines.push("  --foreground: var(--color-text-primary);");
  lines.push("}");
  lines.push("");

  // 4. @theme inline
  lines.push(themeBridge);
  lines.push("");

  // 5. Dark mode
  lines.push('/* ─── Dark theme (via data-theme attribute) ─── */');
  lines.push('[data-theme="dark"] {');
  lines.push(darkOverrides);
  lines.push("}");
  lines.push("");

  // 6. Body
  lines.push("/* ─── Base styles ─── */");
  lines.push("body {");
  lines.push("  background: var(--color-bg-primary);");
  lines.push("  color: var(--color-text-primary);");
  lines.push("  font-family: var(--font-sans);");
  lines.push("}");
  lines.push("");

  return lines.join("\n");
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Generate globals.css directly from Phase 0 JSON artifacts.
 * Replaces the Claude CLI call that was used in Phase 1A.
 * Works for both "design-system" and "replicate" modes.
 */
export function generateGlobalsCss(cwd: string, _mode: PipelineMode): string {
  // 1. Read inputs
  const fontData = readJsonSafe<FontData>(
    join(cwd, ".claude/fonts/font-data.json"),
    DEFAULT_FONT,
  );
  let colorData = readJsonSafe<ColorData>(
    join(cwd, ".claude/colors/color-data.json"),
    DEFAULT_COLORS,
  );
  const colorDataDark = readJsonSafe<ColorData | null>(
    join(cwd, ".claude/colors/color-data-dark.json"),
    null,
  );

  // 2. Sanity check: if the light extraction looks like garbage (dark bg, few colors,
  //    consent wall), fall back to safe defaults but preserve salvageable data
  //    (CSS custom properties, accent colors from buttons).
  if (!isColorDataSane(colorData)) {
    const savedCssVars = colorData._cssVars;
    const savedAccent = colorData.accents;
    colorData = { ...DEFAULT_COLORS, _cssVars: savedCssVars };
    // Restore accent if it was a real color (not white/black)
    const rawAccent = savedAccent?.primary;
    if (isValidHex(rawAccent) && rawAccent.toLowerCase() !== "#ffffff" && rawAccent.toLowerCase() !== "#000000") {
      colorData.accents = { ...colorData.accents, primary: rawAccent };
    }
  }

  // 3. Fill nulls with defaults for the light color data (with per-field validation)
  const mergedColors = mergeColorDefaults(colorData);

  // 4. Font faces
  const fontFaceRules = buildFontFaces(fontData, cwd);

  // 5. Font variables
  const fontVars = buildFontVars(fontData.roles);

  // 6. Primitive scale
  const primitives = buildPrimitiveScale(mergedColors);

  // 7. Semantic tokens (light)
  const semantics = buildSemanticTokens(mergedColors, primitives);

  // 8. Dark mode overrides — build separate dark gray scale if palettes diverge
  let darkGrays: Map<number, string> | undefined;
  if (colorDataDark && hasAnyColor(colorDataDark)) {
    const darkPrimitives = buildPrimitiveScale(colorDataDark);
    if (isDarkPaletteDivergent(primitives.grays, darkPrimitives.grays)) {
      darkGrays = darkPrimitives.grays;
    }
  }
  const darkOverrides = buildDarkOverrides(colorDataDark, primitives, darkGrays);

  // 9. Tailwind theme bridge
  const themeBridge = buildThemeBridge(fontVars);

  // 10. Assemble
  return assembleCss(fontFaceRules, fontVars, primitives, semantics, darkOverrides, themeBridge);
}

/** Resolve accent primary: use extracted value, fall back to CSS vars, then default */
function resolveAccentPrimary(data: ColorData): string {
  const raw = data.accents.primary;
  // Accept extracted accent if it's a real color (not null, white, or black)
  if (isValidHex(raw) && raw.toLowerCase() !== "#ffffff" && raw.toLowerCase() !== "#000000") {
    return raw;
  }
  // Try CSS custom properties as fallback
  const fromVars = resolveCssVarAccent(data._cssVars);
  if (fromVars) return fromVars;
  return DEFAULT_COLORS.accents.primary!;
}

/** Merge null fields in color data with sensible defaults, with per-field contrast checks */
function mergeColorDefaults(data: ColorData): ColorData {
  const pageBg = data.backgrounds.page ?? DEFAULT_COLORS.backgrounds.page!;

  // --- Text fields with contrast awareness ---
  let heading = data.text.heading ?? DEFAULT_COLORS.text.heading;
  // If heading is the same color as page bg (no contrast), use default
  if (isValidHex(heading) && isValidHex(pageBg) && contrastRatio(heading, pageBg) < 2.0) {
    heading = DEFAULT_COLORS.text.heading;
  }

  let body = data.text.body ?? DEFAULT_COLORS.text.body;
  if (isValidHex(body) && isValidHex(pageBg) && contrastRatio(body, pageBg) < 2.0) {
    body = DEFAULT_COLORS.text.body;
  }

  let link = data.text.link ?? DEFAULT_COLORS.text.link;
  // White link on white bg → use default blue
  if (isValidHex(link) && isValidHex(pageBg) && contrastRatio(link, pageBg) < 2.0) {
    link = DEFAULT_COLORS.text.link;
  }

  // Muted: if null, derive from midpoint of gray scale (will be resolved by buildPrimitiveScale)
  const muted = data.text.muted ?? DEFAULT_COLORS.text.muted;

  // --- Background fields with luminance divergence checks ---
  // If card or footer bg luminance diverges >0.7 from page bg, reset to default
  // (catches e.g. #000000 card on #ffffff page)
  const pageLum = luminance(pageBg);

  let card = data.backgrounds.card ?? DEFAULT_COLORS.backgrounds.card;
  if (isValidHex(card) && Math.abs(luminance(card) - pageLum) > 0.7) {
    card = DEFAULT_COLORS.backgrounds.card;
  }

  let footer = data.backgrounds.footer ?? DEFAULT_COLORS.backgrounds.footer;
  if (isValidHex(footer) && Math.abs(luminance(footer) - pageLum) > 0.7) {
    footer = DEFAULT_COLORS.backgrounds.footer;
  }

  return {
    backgrounds: {
      page: pageBg,
      header: data.backgrounds.header ?? DEFAULT_COLORS.backgrounds.header,
      card,
      footer,
    },
    text: {
      heading,
      body,
      muted,
      link,
    },
    accents: {
      primary: resolveAccentPrimary(data),
      primaryText: data.accents.primaryText ?? DEFAULT_COLORS.accents.primaryText,
    },
    borders: {
      default: data.borders.default ?? DEFAULT_COLORS.borders.default,
    },
    surfaces: {
      input: data.surfaces.input ?? DEFAULT_COLORS.surfaces.input,
    },
    _cssVars: data._cssVars,
  };
}
