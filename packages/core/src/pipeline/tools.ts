// Chrome DevTools MCP tools (18 total)
export const CHROME_DEVTOOLS_TOOLS = [
  "mcp__chrome-devtools__navigate_page",
  "mcp__chrome-devtools__take_screenshot",
  "mcp__chrome-devtools__wait_for",
  "mcp__chrome-devtools__resize_page",
  "mcp__chrome-devtools__emulate",
  "mcp__chrome-devtools__take_snapshot",
  "mcp__chrome-devtools__click",
  "mcp__chrome-devtools__hover",
  "mcp__chrome-devtools__evaluate_script",
  "mcp__chrome-devtools__new_page",
  "mcp__chrome-devtools__list_pages",
  "mcp__chrome-devtools__select_page",
  "mcp__chrome-devtools__fill",
  "mcp__chrome-devtools__type_text",
  "mcp__chrome-devtools__press_key",
  "mcp__chrome-devtools__close_page",
  "mcp__chrome-devtools__drag",
  "mcp__chrome-devtools__get_console_message",
] as const;

// Per-phase tool sets
export const PHASE_0_TOOLS = ["Read", "Write", "Bash", ...CHROME_DEVTOOLS_TOOLS];
export const PHASE_1A_TOOLS = ["Read", "Write", "Edit", "Glob", "Bash"];
export const PHASE_1B_TOOLS = ["Read", "Write", "Edit", "Glob", "Bash"];
export const PHASE_2_TOOLS = ["Read", "Glob", "Grep"];
export const PHASE_3_TOOLS = ["Read", "Write", "Edit", "Glob", "Grep", "Bash"];
export const PHASE_4_TOOLS = ["Read", "Bash", ...CHROME_DEVTOOLS_TOOLS];
