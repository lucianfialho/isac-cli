import { describe, it, expect } from "vitest";
import { getScreenshotPrompt } from "../prompts/screenshot-capturer.js";
import { getDsExtractorPrompt } from "../prompts/ds-extractor.js";
import { getDsPageBuilderPrompt } from "../prompts/ds-page-builder.js";
import { getAnimationDetectorPrompt } from "../prompts/animation-detector.js";
import { getPagePlannerPrompt } from "../prompts/page-planner.js";
import { getPageBuilderPrompt } from "../prompts/page-builder.js";
import { getVisualVerifierPrompt } from "../prompts/visual-verifier.js";

describe("Prompt generation", () => {
  const testUrl = "https://example.com";
  const testDir = ".claude/screenshots";

  it("screenshot prompt includes URL and font extraction steps", () => {
    const prompt = getScreenshotPrompt(testUrl);
    expect(prompt).toContain(testUrl);
    expect(prompt).toContain("navigate_page");
    expect(prompt).toContain("take_screenshot");
    expect(prompt).toContain("1440px");
    expect(prompt).toContain("full-page.png");
    // Font extraction steps
    expect(prompt).toContain("font-data.json");
    expect(prompt).toContain("@font-face");
    expect(prompt).toContain("evaluate_script");
    expect(prompt).toContain("public/fonts");
  });

  it("ds-extractor prompt reads font-data.json from disk (no chrome-devtools)", () => {
    const prompt = getDsExtractorPrompt(testDir);
    expect(prompt).toContain(testDir);
    expect(prompt).toContain("--sf-");
    expect(prompt).toContain("--color-");
    expect(prompt).toContain("globals.css");
    // Reads fonts from disk
    expect(prompt).toContain("font-data.json");
    expect(prompt).toContain(".claude/fonts/font-data.json");
    // No Chrome DevTools references
    expect(prompt).not.toContain("mcp__chrome-devtools__");
  });

  it("ds-page-builder prompt includes screenshot dir and data schema", () => {
    const prompt = getDsPageBuilderPrompt(testDir);
    expect(prompt).toContain(testDir);
    expect(prompt).toContain("design-system/data.ts");
    expect(prompt).toContain("siteInfo");
    expect(prompt).toContain("primitives");
    expect(prompt).toContain("semanticTokens");
  });

  it("animation-detector prompt includes URL and detection script", () => {
    const prompt = getAnimationDetectorPrompt(testUrl);
    expect(prompt).toContain(testUrl);
    expect(prompt).toContain("detectAnimations");
    expect(prompt).toContain("catalog.json");
    expect(prompt).toContain("motionEquivalent");
  });

  it("page-planner prompt includes screenshot dir", () => {
    const prompt = getPagePlannerPrompt(testDir);
    expect(prompt).toContain(testDir);
    expect(prompt).toContain("globals.css");
    expect(prompt).toContain("catalog.json");
    expect(prompt).toContain("Sections");
  });

  it("page-builder prompt includes plan and screenshot dir", () => {
    const plan = "## Sections\n### 1. Hero\n- Type: hero";
    const prompt = getPageBuilderPrompt(plan, testDir);
    expect(prompt).toContain(plan);
    expect(prompt).toContain(testDir);
    expect(prompt).toContain("var(--color-token)");
    expect(prompt).toContain("npm run build");
  });

  it("page-builder prompt includes corrections when provided", () => {
    const plan = "## Sections";
    const corrections = "Header color is wrong";
    const prompt = getPageBuilderPrompt(plan, testDir, corrections);
    expect(prompt).toContain(corrections);
    expect(prompt).toContain("Corrections from visual verification");
  });

  it("page-builder prompt omits corrections block when not provided", () => {
    const plan = "## Sections";
    const prompt = getPageBuilderPrompt(plan, testDir);
    expect(prompt).not.toContain("Corrections from visual verification");
  });

  it("visual-verifier prompt includes screenshot dir", () => {
    const prompt = getVisualVerifierPrompt(testDir);
    expect(prompt).toContain(testDir);
    expect(prompt).toContain("APPROVED");
    expect(prompt).toContain("localhost:3000");
    expect(prompt).toContain('"approved"');
  });
});
