import { describe, it, expect } from "vitest";
import { findChromePath, COLOR_EXTRACTION_SCRIPT } from "../pipeline/color-extractor.js";

describe("color-extractor", () => {
  it("findChromePath() returns a string or null", () => {
    const result = findChromePath();
    expect(result === null || typeof result === "string").toBe(true);
  });

  it("COLOR_EXTRACTION_SCRIPT is a function", () => {
    expect(typeof COLOR_EXTRACTION_SCRIPT).toBe("function");
  });

  it("COLOR_EXTRACTION_SCRIPT source contains key extraction logic", () => {
    const src = COLOR_EXTRACTION_SCRIPT.toString();
    // Should contain the core extraction patterns
    expect(src).toContain("getComputedStyle");
    expect(src).toContain("backgroundColor");
    expect(src).toContain("backgrounds");
    expect(src).toContain("accents");
    expect(src).toContain("cssVarNames");
  });
});
