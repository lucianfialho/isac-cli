import { describe, it, expect } from "vitest";
import { DESIGN_TOKENS_CSS_TEMPLATE } from "../templates/design-tokens.css.js";

describe("Design Tokens CSS Template", () => {
  it("contains primitive tokens", () => {
    expect(DESIGN_TOKENS_CSS_TEMPLATE).toContain("--sf-white");
    expect(DESIGN_TOKENS_CSS_TEMPLATE).toContain("--sf-black");
  });

  it("contains semantic tokens", () => {
    expect(DESIGN_TOKENS_CSS_TEMPLATE).toContain("--color-bg-primary");
    expect(DESIGN_TOKENS_CSS_TEMPLATE).toContain("--color-text-primary");
    expect(DESIGN_TOKENS_CSS_TEMPLATE).toContain("--color-border-primary");
  });

  it("contains dark mode selector", () => {
    expect(DESIGN_TOKENS_CSS_TEMPLATE).toContain('[data-theme="dark"]');
  });

  it("contains tailwind import", () => {
    expect(DESIGN_TOKENS_CSS_TEMPLATE).toContain("@import");
  });
});
