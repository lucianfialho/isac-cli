// ── Adapter contract ────────────────────────────────────────
export type { FrameworkAdapter, TemplateFile, PhaseValidation } from "./adapter.js";

// ── Pipeline ────────────────────────────────────────────────
export { runPipeline, disableMcp } from "./pipeline/orchestrator.js";
export type {
  PipelineContext,
  PipelineMode,
  PipelineStopAfter,
  PhaseConfig,
  PhaseOutput,
  PhaseResult,
  VerificationResult,
  PipelineOptions,
  PipelineResult,
} from "./pipeline/types.js";

// ── Tools ───────────────────────────────────────────────────
export {
  CHROME_DEVTOOLS_TOOLS,
  PHASE_0_TOOLS,
  PHASE_1B_TOOLS,
  PHASE_2_TOOLS,
  PHASE_3_TOOLS,
  PHASE_4_TOOLS,
} from "./pipeline/tools.js";

// ── UI ──────────────────────────────────────────────────────
export { log } from "./ui/logger.js";
export { printBanner } from "./ui/banner.js";
export {
  setPhase,
  succeedPhase,
  failPhase,
  renderEvent,
  stopSpinner,
  getTotalCost,
  logLine,
  updateStatus,
} from "./ui/tui.js";

// ── Utils ───────────────────────────────────────────────────
export { ensureClaude, getClaudeVersion } from "./utils/claude.js";

// ── Config ─────────────────────────────────────────────────
export { readConfig, writeConfig, type IsacConfig } from "./config.js";

// ── Templates (framework-agnostic) ─────────────────────────
export { DESIGN_TOKENS_CSS_TEMPLATE } from "./templates/design-tokens.css.js";
