import { describe, it, expect } from "vitest";
import {
  PHASE_0_TOOLS,
  PHASE_1B_TOOLS,
  PHASE_2_TOOLS,
  PHASE_3_TOOLS,
  PHASE_4_TOOLS,
} from "../pipeline/tools.js";

describe("Tool sets", () => {
  it("Phase 0 uses Bash for agent-browser (no MCP tools)", () => {
    expect(PHASE_0_TOOLS).toEqual(["Read", "Write", "Bash"]);
    for (const tool of PHASE_0_TOOLS) {
      expect(tool).not.toMatch(/^mcp__/);
    }
  });

  it("Phase 1b has only file tools", () => {
    expect(PHASE_1B_TOOLS).toEqual(["Read", "Write", "Edit", "Glob", "Bash"]);
  });

  it("Phase 2 is read-only", () => {
    expect(PHASE_2_TOOLS).toEqual(["Read", "Glob", "Grep"]);
    expect(PHASE_2_TOOLS).not.toContain("Write");
    expect(PHASE_2_TOOLS).not.toContain("Edit");
    expect(PHASE_2_TOOLS).not.toContain("Bash");
  });

  it("Phase 3 has full file tools but no MCP", () => {
    expect(PHASE_3_TOOLS).toEqual(["Read", "Write", "Edit", "Glob", "Grep", "Bash"]);
    for (const tool of PHASE_3_TOOLS) {
      expect(tool).not.toMatch(/^mcp__/);
    }
  });

  it("Phase 4 uses Bash for agent-browser (no MCP tools)", () => {
    expect(PHASE_4_TOOLS).toEqual(["Read", "Bash"]);
    for (const tool of PHASE_4_TOOLS) {
      expect(tool).not.toMatch(/^mcp__/);
    }
  });
});
