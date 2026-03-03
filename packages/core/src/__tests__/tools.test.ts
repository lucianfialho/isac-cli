import { describe, it, expect } from "vitest";
import {
  CHROME_DEVTOOLS_TOOLS,
  PHASE_0_TOOLS,
  PHASE_1B_TOOLS,
  PHASE_2_TOOLS,
  PHASE_3_TOOLS,
  PHASE_4_TOOLS,
} from "../pipeline/tools.js";

describe("Tool sets", () => {
  it("CHROME_DEVTOOLS_TOOLS has 18 tools", () => {
    expect(CHROME_DEVTOOLS_TOOLS).toHaveLength(18);
  });

  it("all chrome-devtools tools have correct prefix", () => {
    for (const tool of CHROME_DEVTOOLS_TOOLS) {
      expect(tool).toMatch(/^mcp__chrome-devtools__/);
    }
  });

  it("Phase 0 includes chrome-devtools tools, Read, Write, and Bash (for font extraction)", () => {
    expect(PHASE_0_TOOLS).toContain("mcp__chrome-devtools__navigate_page");
    expect(PHASE_0_TOOLS).toContain("mcp__chrome-devtools__take_screenshot");
    expect(PHASE_0_TOOLS).toContain("mcp__chrome-devtools__evaluate_script");
    expect(PHASE_0_TOOLS).toContain("Read");
    expect(PHASE_0_TOOLS).toContain("Write");
    expect(PHASE_0_TOOLS).toContain("Bash");
  });

  it("Phase 1b has only file tools (no chrome-devtools)", () => {
    expect(PHASE_1B_TOOLS).toEqual(["Read", "Write", "Edit", "Glob", "Bash"]);
  });

  it("Phase 2 is read-only", () => {
    expect(PHASE_2_TOOLS).toEqual(["Read", "Glob", "Grep"]);
    expect(PHASE_2_TOOLS).not.toContain("Write");
    expect(PHASE_2_TOOLS).not.toContain("Edit");
    expect(PHASE_2_TOOLS).not.toContain("Bash");
  });

  it("Phase 3 has full file tools but no chrome-devtools", () => {
    expect(PHASE_3_TOOLS).toEqual(["Read", "Write", "Edit", "Glob", "Grep", "Bash"]);
    for (const tool of PHASE_3_TOOLS) {
      expect(tool).not.toMatch(/^mcp__/);
    }
  });

  it("Phase 4 includes chrome-devtools tools", () => {
    expect(PHASE_4_TOOLS).toContain("mcp__chrome-devtools__take_screenshot");
    expect(PHASE_4_TOOLS).toContain("mcp__chrome-devtools__navigate_page");
    expect(PHASE_4_TOOLS).toContain("Read");
    expect(PHASE_4_TOOLS).toContain("Bash");
  });
});
