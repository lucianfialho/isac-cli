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
