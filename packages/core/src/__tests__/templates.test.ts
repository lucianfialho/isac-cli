import { describe, it, expect } from "vitest";
import { DESIGN_TOKENS_CSS_TEMPLATE } from "../templates/design-tokens.css.js";
import { ANIMATION_DETECTION_SCRIPT } from "../templates/animation-detection.js.js";

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

describe("Animation Detection Script", () => {
  it("is a self-executing function", () => {
    expect(ANIMATION_DETECTION_SCRIPT).toMatch(/^\(function detectAnimations/);
    expect(ANIMATION_DETECTION_SCRIPT).toMatch(/\)\(\);$/);
  });

  it("detects CSS animations", () => {
    expect(ANIMATION_DETECTION_SCRIPT).toContain("detectCSSAnimations");
  });

  it("detects CSS transitions", () => {
    expect(ANIMATION_DETECTION_SCRIPT).toContain("detectCSSTransitions");
  });

  it("detects Web Animations API", () => {
    expect(ANIMATION_DETECTION_SCRIPT).toContain("detectWebAnimations");
  });

  it("detects scroll animations", () => {
    expect(ANIMATION_DETECTION_SCRIPT).toContain("detectScrollAnimations");
  });

  it("detects libraries", () => {
    expect(ANIMATION_DETECTION_SCRIPT).toContain("detectLibraries");
    expect(ANIMATION_DETECTION_SCRIPT).toContain("gsap");
    expect(ANIMATION_DETECTION_SCRIPT).toContain("lottie");
  });

  it("returns JSON", () => {
    expect(ANIMATION_DETECTION_SCRIPT).toContain("JSON.stringify");
  });
});
