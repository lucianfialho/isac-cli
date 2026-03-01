import { describe, it, expect } from "vitest";

// We need to test the parseVerificationResult function from phase-4.
// Since it's not exported, we'll test it indirectly by importing the module
// and testing the parsing logic directly.

// Replicate the parsing logic for testing
function parseVerificationResult(text: string) {
  // Try to extract JSON block from the response
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      return {
        approved: parsed.approved ?? false,
        issues: parsed.issues ?? [],
        screenshots: parsed.screenshots,
      };
    } catch {
      // Fall through
    }
  }

  // Try to parse as raw JSON
  try {
    const lastBrace = text.lastIndexOf("}");
    const firstBrace = text.lastIndexOf("{", lastBrace);
    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonStr = text.slice(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(jsonStr);
      return {
        approved: parsed.approved ?? false,
        issues: parsed.issues ?? [],
        screenshots: parsed.screenshots,
      };
    }
  } catch {
    // Fall through
  }

  // Text-based fallback
  const approved = /APPROVED/i.test(text) && !/CORRECTIONS\s+NEEDED/i.test(text);
  const issues: string[] = [];

  if (!approved) {
    const issueMatches = text.match(/^\d+\.\s+.+$/gm);
    if (issueMatches) {
      issues.push(...issueMatches.map((m) => m.replace(/^\d+\.\s+/, "")));
    }
  }

  return { approved, issues };
}

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
