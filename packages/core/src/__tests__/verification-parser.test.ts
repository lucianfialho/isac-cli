import { describe, it, expect } from "vitest";
import { parseVerificationResult } from "../pipeline/phase-4-verification.js";

describe("Verification result parser", () => {
  it("parses JSON in code block — approved", () => {
    const text = `## Result
\`\`\`json
{
  "approved": true,
  "issues": [],
  "screenshots": { "light": "light.png", "dark": "dark.png" }
}
\`\`\``;
    const result = parseVerificationResult(text);
    expect(result.approved).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.screenshots?.light).toBe("light.png");
  });

  it("parses JSON in code block — corrections needed", () => {
    const text = `## Result
\`\`\`json
{
  "approved": false,
  "issues": ["Header color is wrong", "Footer missing"]
}
\`\`\``;
    const result = parseVerificationResult(text);
    expect(result.approved).toBe(false);
    expect(result.issues).toHaveLength(2);
    expect(result.issues[0]).toBe("Header color is wrong");
  });

  it("parses raw JSON at end of text", () => {
    const text = `Some discussion about the page...

{"approved": true, "issues": []}`;
    const result = parseVerificationResult(text);
    expect(result.approved).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("falls back to text-based APPROVED detection", () => {
    const text = `## Result: APPROVED

The page looks great! All sections match.`;
    const result = parseVerificationResult(text);
    expect(result.approved).toBe(true);
  });

  it("detects CORRECTIONS NEEDED in text", () => {
    const text = `## Result: CORRECTIONS NEEDED

1. Header background should be darker
2. Font size on hero is too small
3. Missing star icons`;
    const result = parseVerificationResult(text);
    expect(result.approved).toBe(false);
    expect(result.issues).toHaveLength(3);
    expect(result.issues[0]).toBe("Header background should be darker");
  });

  it("handles empty text", () => {
    const result = parseVerificationResult("");
    expect(result.approved).toBe(false);
    expect(result.issues).toEqual([]);
  });

  it("handles text with APPROVED but also CORRECTIONS NEEDED", () => {
    const text = "CORRECTIONS NEEDED — was not APPROVED";
    const result = parseVerificationResult(text);
    expect(result.approved).toBe(false);
  });
});
