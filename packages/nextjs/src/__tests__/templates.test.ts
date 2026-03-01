import { describe, it, expect } from "vitest";
import { DESIGN_SYSTEM_PAGE_TEMPLATE } from "../templates/design-system-page.tsx.js";
import { DESIGN_SYSTEM_DATA_TEMPLATE } from "../templates/design-system-data.ts.js";
import { DESIGN_SYSTEM_LAYOUT_TEMPLATE } from "../templates/design-system-layout.tsx.js";
import { THEME_TOGGLE_TEMPLATE } from "../templates/theme-toggle.tsx.js";

describe("Design System Page Template", () => {
  it("contains metadata export", () => {
    expect(DESIGN_SYSTEM_PAGE_TEMPLATE).toContain("export const metadata");
  });

  it("contains ThemeToggle import", () => {
    expect(DESIGN_SYSTEM_PAGE_TEMPLATE).toContain("ThemeToggle");
  });

  it("imports data from ./data", () => {
    expect(DESIGN_SYSTEM_PAGE_TEMPLATE).toContain('from "./data"');
    expect(DESIGN_SYSTEM_PAGE_TEMPLATE).toContain("siteInfo");
    expect(DESIGN_SYSTEM_PAGE_TEMPLATE).toContain("primitives");
    expect(DESIGN_SYSTEM_PAGE_TEMPLATE).toContain("semanticTokens");
  });

  it("does NOT contain FILL IN placeholders", () => {
    expect(DESIGN_SYSTEM_PAGE_TEMPLATE).not.toContain("FILL IN");
  });

  it("exports default component", () => {
    expect(DESIGN_SYSTEM_PAGE_TEMPLATE).toContain("export default function DesignSystemPage");
  });

  it("contains all major sections", () => {
    expect(DESIGN_SYSTEM_PAGE_TEMPLATE).toContain("Primitive Palette");
    expect(DESIGN_SYSTEM_PAGE_TEMPLATE).toContain("Semantic Tokens");
    expect(DESIGN_SYSTEM_PAGE_TEMPLATE).toContain("Typography");
    expect(DESIGN_SYSTEM_PAGE_TEMPLATE).toContain("Border Radius");
    expect(DESIGN_SYSTEM_PAGE_TEMPLATE).toContain("Components");
  });
});

describe("Design System Data Template", () => {
  it("exports siteInfo", () => {
    expect(DESIGN_SYSTEM_DATA_TEMPLATE).toContain("export const siteInfo");
  });

  it("exports fonts", () => {
    expect(DESIGN_SYSTEM_DATA_TEMPLATE).toContain("export const fonts");
  });

  it("exports fontSizes", () => {
    expect(DESIGN_SYSTEM_DATA_TEMPLATE).toContain("export const fontSizes");
  });

  it("exports fontWeights", () => {
    expect(DESIGN_SYSTEM_DATA_TEMPLATE).toContain("export const fontWeights");
  });

  it("exports radii", () => {
    expect(DESIGN_SYSTEM_DATA_TEMPLATE).toContain("export const radii");
  });

  it("exports primitives with correct shape", () => {
    expect(DESIGN_SYSTEM_DATA_TEMPLATE).toContain("export const primitives");
    expect(DESIGN_SYSTEM_DATA_TEMPLATE).toContain("name:");
    expect(DESIGN_SYSTEM_DATA_TEMPLATE).toContain("var:");
    expect(DESIGN_SYSTEM_DATA_TEMPLATE).toContain("hex:");
  });

  it("exports semanticTokens with correct shape", () => {
    expect(DESIGN_SYSTEM_DATA_TEMPLATE).toContain("export const semanticTokens");
    expect(DESIGN_SYSTEM_DATA_TEMPLATE).toContain("category:");
    expect(DESIGN_SYSTEM_DATA_TEMPLATE).toContain("lightRef:");
    expect(DESIGN_SYSTEM_DATA_TEMPLATE).toContain("darkRef:");
  });
});

describe("Design System Layout Template", () => {
  it("exports default layout function", () => {
    expect(DESIGN_SYSTEM_LAYOUT_TEMPLATE).toContain("export default function DesignSystemLayout");
  });

  it("uses semantic tokens for styling", () => {
    expect(DESIGN_SYSTEM_LAYOUT_TEMPLATE).toContain("var(--color-bg-primary)");
    expect(DESIGN_SYSTEM_LAYOUT_TEMPLATE).toContain("var(--color-text-primary)");
  });
});

describe("Theme Toggle Template", () => {
  it("is a client component", () => {
    expect(THEME_TOGGLE_TEMPLATE).toContain('"use client"');
  });

  it("uses useSyncExternalStore", () => {
    expect(THEME_TOGGLE_TEMPLATE).toContain("useSyncExternalStore");
  });

  it("exports ThemeToggle function", () => {
    expect(THEME_TOGGLE_TEMPLATE).toContain("export function ThemeToggle");
  });

  it("supports system, light, dark themes", () => {
    expect(THEME_TOGGLE_TEMPLATE).toContain('"system"');
    expect(THEME_TOGGLE_TEMPLATE).toContain('"light"');
    expect(THEME_TOGGLE_TEMPLATE).toContain('"dark"');
  });

  it("uses data-theme attribute", () => {
    expect(THEME_TOGGLE_TEMPLATE).toContain("data-theme");
  });
});
