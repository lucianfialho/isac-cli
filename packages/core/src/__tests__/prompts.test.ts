import { describe, it, expect } from "vitest";
import { getScreenshotPrompt } from "../prompts/screenshot-capturer.js";

describe("Core prompt generation", () => {
  const testUrl = "https://example.com";

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
});
