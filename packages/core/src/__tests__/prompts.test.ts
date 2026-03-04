import { describe, it, expect } from "vitest";
import { getScreenshotPrompt } from "../prompts/screenshot-capturer.js";

describe("Core prompt generation", () => {
  const testUrl = "https://example.com";

  it("design-system mode prompt uses agent-browser (no screenshots)", () => {
    const prompt = getScreenshotPrompt(testUrl, "design-system");
    expect(prompt).toContain(testUrl);
    expect(prompt).toContain("agent-browser open");
    expect(prompt).toContain("1440");
    // Font extraction steps
    expect(prompt).toContain("font-data.json");
    expect(prompt).toContain("agent-browser eval");
    expect(prompt).toContain("public/fonts");
    // Should NOT contain actual screenshot capture instructions (full-page.png)
    expect(prompt).not.toContain("full-page.png");
    // Should NOT reference chrome-devtools MCP
    expect(prompt).not.toContain("mcp__chrome-devtools");
  });

  it("default mode is design-system (no screenshots)", () => {
    const prompt = getScreenshotPrompt(testUrl);
    expect(prompt).not.toContain("full-page.png");
  });

  it("replicate mode prompt CONTAINS screenshot commands", () => {
    const prompt = getScreenshotPrompt(testUrl, "replicate");
    expect(prompt).toContain(testUrl);
    expect(prompt).toContain("agent-browser open");
    expect(prompt).toContain("agent-browser screenshot --full");
    expect(prompt).toContain("full-page.png");
    expect(prompt).toContain("1440");
    // Font extraction steps
    expect(prompt).toContain("font-data.json");
    expect(prompt).toContain("agent-browser eval");
    expect(prompt).toContain("public/fonts");
    // Should NOT reference chrome-devtools MCP
    expect(prompt).not.toContain("mcp__chrome-devtools");
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
