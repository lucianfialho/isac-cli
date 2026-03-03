import { describe, it, expect } from "vitest";
import { getDsPageBuilderPrompt } from "../prompts/ds-page-builder.js";
import { getPagePlannerPrompt } from "../prompts/page-planner.js";
import { getPageBuilderPrompt } from "../prompts/page-builder.js";
import { getVisualVerifierPrompt } from "../prompts/visual-verifier.js";

describe("Next.js prompt generation", () => {
  const testDir = ".claude/screenshots";

  it("ds-page-builder prompt (design-system mode) omits screenshot reference", () => {
    const prompt = getDsPageBuilderPrompt(testDir, "design-system");
    expect(prompt).toContain("design-system/data.ts");
    expect(prompt).toContain("siteInfo");
    expect(prompt).toContain("primitives");
    expect(prompt).toContain("semanticTokens");
    expect(prompt).not.toContain("Read screenshots");
  });

  it("ds-page-builder prompt (replicate mode) includes screenshot reference", () => {
    const prompt = getDsPageBuilderPrompt(testDir, "replicate");
    expect(prompt).toContain(testDir);
    expect(prompt).toContain("design-system/data.ts");
    expect(prompt).toContain("siteInfo");
    expect(prompt).toContain("primitives");
    expect(prompt).toContain("Read screenshots");
  });

  it("page-planner prompt includes screenshot dir and reads only globals.css", () => {
    const prompt = getPagePlannerPrompt(testDir);
    expect(prompt).toContain(testDir);
    expect(prompt).toContain("globals.css");
    expect(prompt).toContain("catalog.json");
    expect(prompt).toContain("Sections");
    // P2 must NOT depend on P1B output (design-system/page.tsx) to enable parallel execution
    expect(prompt).not.toContain("design-system/page.tsx");
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
