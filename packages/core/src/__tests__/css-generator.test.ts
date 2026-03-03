import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateGlobalsCss } from "../pipeline/css-generator.js";

// ── Helpers ──────────────────────────────────────────────────────────

function setupColorFiles(
  cwd: string,
  light: Record<string, unknown>,
  dark?: Record<string, unknown> | null,
) {
  const colorsDir = join(cwd, ".claude/colors");
  mkdirSync(colorsDir, { recursive: true });
  writeFileSync(join(colorsDir, "color-data.json"), JSON.stringify(light));
  if (dark !== undefined) {
    writeFileSync(
      join(colorsDir, "color-data-dark.json"),
      JSON.stringify(dark),
    );
  }
}

/** Warm-tinted light palette (beige/cream grays) */
const WARM_LIGHT = {
  backgrounds: { page: "#faf8f5", header: "#f5f0ea", card: "#ffffff", footer: "#f5f0ea" },
  text: { heading: "#2c1810", body: "#3d2b1f", muted: "#8b7355", link: "#b45309" },
  accents: { primary: "#b45309", primaryText: "#ffffff" },
  borders: { default: "#e8ddd0" },
  surfaces: { input: "#ffffff" },
};

/** Cool/neutral dark palette (blue-gray tones) */
const NEUTRAL_DARK = {
  backgrounds: { page: "#0a0a0f", header: "#111118", card: "#1a1a24", footer: "#0a0a0f" },
  text: { heading: "#e5e5ef", body: "#c8c8d8", muted: "#6b6b80", link: "#60a5fa" },
  accents: { primary: "#60a5fa", primaryText: "#ffffff" },
  borders: { default: "#2a2a3a" },
  surfaces: { input: "#1a1a24" },
};

/** Warm dark palette (similar tint as WARM_LIGHT) */
const WARM_DARK = {
  backgrounds: { page: "#1a1410", header: "#221c16", card: "#2a221a", footer: "#1a1410" },
  text: { heading: "#f0e8dc", body: "#d4c4b0", muted: "#8b7355", link: "#b45309" },
  accents: { primary: "#b45309", primaryText: "#ffffff" },
  borders: { default: "#3d3020" },
  surfaces: { input: "#2a221a" },
};

/** Helper: extract hex from a CSS line like `--sf-gray-500: #abcdef;` */
function extractGrayHex(css: string, step: number): string | null {
  const re = new RegExp(`--sf-gray-${step}:\\s*(#[0-9a-fA-F]{6})`);
  const m = css.match(re);
  return m ? m[1] : null;
}

/** Convert hex to HSL saturation (0..1) */
function hexSaturation(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const l = (max + min) / 2;
  return l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
}

// ── White-on-white heading / accent / gray tint tests ─────────────────

/** Simulates zzzello.com: white heading on white page, black card, real accent exists */
const ZZZELLO_LIKE = {
  backgrounds: { page: "#ffffff", header: "#f9fafb", card: "#000000", footer: "#f9fafb" },
  text: { heading: "#ffffff", body: "#1f2937", muted: "#6b7280", link: "#2563eb" },
  accents: { primary: "#aa15ef", primaryText: "#ffffff" },
  borders: { default: "#e5e7eb" },
  surfaces: { input: "#ffffff" },
};

describe("css-generator color extraction fixes", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "isac-css-gen-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("white-on-white heading preserves accent (not replaced by #2563eb default)", () => {
    setupColorFiles(tempDir, ZZZELLO_LIKE);
    const css = generateGlobalsCss(tempDir, "design-system");

    // Accent should be the real extracted value, not the Tailwind default
    expect(css).toContain("--sf-accent: #aa15ef");
    expect(css).not.toContain("--sf-accent: #2563eb");
  });

  it("interpolated grays have saturation < 0.05 (no purple tint)", () => {
    // Pure white page + pure dark heading with no tinted intermediates
    // This tests that interpolateHsl produces neutral grays from achromatic endpoints
    const neutral = {
      backgrounds: { page: "#ffffff", header: "#ffffff", card: "#ffffff", footer: "#ffffff" },
      text: { heading: "#111111", body: "#333333", muted: "#888888", link: "#2563eb" },
      accents: { primary: "#2563eb", primaryText: "#ffffff" },
      borders: { default: "#cccccc" },
      surfaces: { input: "#ffffff" },
    };
    setupColorFiles(tempDir, neutral);
    const css = generateGlobalsCss(tempDir, "design-system");

    // All interpolated grays should be perfectly neutral (saturation ≈ 0)
    for (const step of [200, 400, 500, 600, 800]) {
      const hex = extractGrayHex(css, step);
      expect(hex).not.toBeNull();
      const sat = hexSaturation(hex!);
      expect(sat).toBeLessThan(0.05);
    }
  });

  it("_cssVars['--primary-color'] is used as fallback when accents.primary is null", () => {
    const withCssVars = {
      backgrounds: { page: "#ffffff", header: "#f9fafb", card: "#ffffff", footer: "#f9fafb" },
      text: { heading: "#111827", body: "#1f2937", muted: "#6b7280", link: "#2563eb" },
      accents: { primary: null, primaryText: "#ffffff" },
      borders: { default: "#e5e7eb" },
      surfaces: { input: "#ffffff" },
      _cssVars: { "--primary-color": "#e11d48" },
    };
    setupColorFiles(tempDir, withCssVars);
    const css = generateGlobalsCss(tempDir, "design-system");

    // CSS vars serve as fallback when accent is null — should use CSS var value
    expect(css).toContain("--sf-accent: #e11d48");
  });

  it("_cssVars do NOT override a valid button-extracted accent", () => {
    const withBothAccents = {
      backgrounds: { page: "#ffffff", header: "#f9fafb", card: "#ffffff", footer: "#f9fafb" },
      text: { heading: "#111827", body: "#1f2937", muted: "#6b7280", link: "#2563eb" },
      accents: { primary: "#aa15ef", primaryText: "#ffffff" },
      borders: { default: "#e5e7eb" },
      surfaces: { input: "#ffffff" },
      _cssVars: { "--primary-color": "#5E81AC" },
    };
    setupColorFiles(tempDir, withBothAccents);
    const css = generateGlobalsCss(tempDir, "design-system");

    // Button accent should win over CSS var — CSS vars are fallback only
    expect(css).toContain("--sf-accent: #aa15ef");
    expect(css).not.toContain("--sf-accent: #5E81AC");
    expect(css).not.toContain("--sf-accent: #5e81ac");
  });

  it("black card bg on white page gets corrected (not mapped to gray-950)", () => {
    setupColorFiles(tempDir, ZZZELLO_LIKE);
    const css = generateGlobalsCss(tempDir, "design-system");

    // The semantic card bg should NOT map to gray-950 (which would be nearly black)
    // It should map to a light gray step since the page is white
    expect(css).not.toContain("--color-bg-tertiary: var(--sf-gray-950)");
    expect(css).not.toContain("--color-bg-tertiary: var(--sf-gray-900)");
  });
});

// ── Tests ────────────────────────────────────────────────────────────

describe("css-generator dark mode gray scale", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "isac-css-gen-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("emits --sf-gray-* overrides in dark block when dark palette diverges from light", () => {
    setupColorFiles(tempDir, WARM_LIGHT, NEUTRAL_DARK);
    const css = generateGlobalsCss(tempDir, "design-system");

    // The dark block should contain gray overrides
    const darkBlock = css.split('[data-theme="dark"]')[1];
    expect(darkBlock).toBeDefined();
    expect(darkBlock).toContain("--sf-gray-50:");
    expect(darkBlock).toContain("--sf-gray-500:");
    expect(darkBlock).toContain("--sf-gray-950:");
    expect(darkBlock).toContain("Dark gray overrides");
  });

  it("does NOT emit --sf-gray-* overrides when dark palette has similar tint to light", () => {
    setupColorFiles(tempDir, WARM_LIGHT, WARM_DARK);
    const css = generateGlobalsCss(tempDir, "design-system");

    const darkBlock = css.split('[data-theme="dark"]')[1];
    expect(darkBlock).toBeDefined();
    // Should NOT contain gray override block
    expect(darkBlock).not.toContain("Dark gray overrides");
  });

  it("works correctly when no dark data is provided", () => {
    setupColorFiles(tempDir, WARM_LIGHT, null);
    const css = generateGlobalsCss(tempDir, "design-system");

    // Should still have a dark block with inverted defaults
    const darkBlock = css.split('[data-theme="dark"]')[1];
    expect(darkBlock).toBeDefined();
    expect(darkBlock).toContain("--color-bg-primary: var(--sf-gray-950)");
    // No gray overrides since there's no dark data
    expect(darkBlock).not.toContain("Dark gray overrides");
  });

  it("dark block uses dark grays for semantic mapping when palettes diverge", () => {
    setupColorFiles(tempDir, WARM_LIGHT, NEUTRAL_DARK);
    const css = generateGlobalsCss(tempDir, "design-system");

    // The :root block should have warm-tinted grays from light palette
    const rootBlock = css.split(":root {")[1]?.split("}")[0] ?? "";
    expect(rootBlock).toContain("--sf-gray-50:");

    // The dark block gray overrides should differ from :root grays
    const darkBlock = css.split('[data-theme="dark"]')[1] ?? "";
    // Extract a gray value from dark block overrides
    const darkGray950Match = darkBlock.match(/--sf-gray-950:\s*(#[0-9a-f]+)/);
    const rootGray950Match = rootBlock.match(/--sf-gray-950:\s*(#[0-9a-f]+)/);
    expect(darkGray950Match).not.toBeNull();
    expect(rootGray950Match).not.toBeNull();
    // They should be different values (neutral vs warm tint)
    expect(darkGray950Match![1]).not.toBe(rootGray950Match![1]);
  });
});
