// ── Adapter contract ────────────────────────────────────────
export type { FrameworkAdapter, TemplateFile, PhaseValidation } from "./adapter.js";

// ── Pipeline ────────────────────────────────────────────────
export { runPipeline } from "./pipeline/orchestrator.js";
export type {
  PipelineContext,
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
  PHASE_1A_TOOLS,
  PHASE_1B_TOOLS,
  PHASE_1C_TOOLS,
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
} from "./ui/tui.js";

// ── Utils ───────────────────────────────────────────────────
export { ensureClaude, getClaudeVersion } from "./utils/claude.js";

// ── Templates (framework-agnostic) ─────────────────────────
export { DESIGN_TOKENS_CSS_TEMPLATE } from "./templates/design-tokens.css.js";
export { ANIMATION_DETECTION_SCRIPT } from "./templates/animation-detection.js.js";
