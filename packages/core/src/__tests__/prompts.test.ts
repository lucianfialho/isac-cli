import { describe, it, expect } from "vitest";
import { getScreenshotPrompt } from "../prompts/screenshot-capturer.js";

describe("Core prompt generation", () => {
  const testUrl = "https://example.com";

  it("design-system mode prompt does NOT contain take_screenshot", () => {
    const prompt = getScreenshotPrompt(testUrl, "design-system");
    expect(prompt).toContain(testUrl);
    expect(prompt).toContain("navigate_page");
    expect(prompt).toContain("1440px");
    // Font extraction steps
    expect(prompt).toContain("font-data.json");
    expect(prompt).toContain("evaluate_script");
    expect(prompt).toContain("public/fonts");
    // Should NOT contain screenshot instructions
    expect(prompt).not.toContain("take_screenshot");
    expect(prompt).not.toContain("full-page.png");
  });

  it("default mode is design-system (no screenshots)", () => {
    const prompt = getScreenshotPrompt(testUrl);
    expect(prompt).not.toContain("take_screenshot");
  });

  it("replicate mode prompt CONTAINS take_screenshot", () => {
    const prompt = getScreenshotPrompt(testUrl, "replicate");
    expect(prompt).toContain(testUrl);
    expect(prompt).toContain("navigate_page");
    expect(prompt).toContain("take_screenshot");
    expect(prompt).toContain("full-page.png");
    expect(prompt).toContain("1440px");
    // Font extraction steps
    expect(prompt).toContain("font-data.json");
    expect(prompt).toContain("evaluate_script");
    expect(prompt).toContain("public/fonts");
  });

  it("color extraction is NOT in the prompt (handled by Playwright)", () => {
    const prompt = getScreenshotPrompt(testUrl, "design-system");
    // The prompt should NOT contain the old color extraction script patterns
    expect(prompt).not.toContain("COLOR EXTRACTION VIA JS");
    expect(prompt).not.toContain("rgbToHex");
    expect(prompt).not.toContain("isVisible");
    expect(prompt).not.toContain("qVisible");
    expect(prompt).not.toContain("_cssVars");
    expect(prompt).not.toContain("backgroundColor");
    // But should mention that color data already exists
    expect(prompt).toContain("already extracted");
  });

  it("color extraction note is present in replicate mode too", () => {
    const prompt = getScreenshotPrompt(testUrl, "replicate");
    expect(prompt).not.toContain("COLOR EXTRACTION VIA JS");
    expect(prompt).not.toContain("rgbToHex");
    expect(prompt).toContain("already extracted");
  });

  it("prompt tells agent NOT to overwrite color files", () => {
    const prompt = getScreenshotPrompt(testUrl, "design-system");
    expect(prompt).toContain("do NOT overwrite");
  });
});
