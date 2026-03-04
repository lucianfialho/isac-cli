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

// ── Catalog ────────────────────────────────────────────────
export {
  SectionSchema,
  SECTION_TYPES,
  PagePlanSchema,
  HeaderSection,
  HeroSection,
  FeatureGridSection,
  StatsBarSection,
  DataTableSection,
  TestimonialsSection,
  PricingTableSection,
  CTASection,
  FAQSection,
  ContentBlockSection,
  LogoCloudSection,
  FooterSection,
  CustomHTMLSection,
} from "./catalog/index.js";
export type {
  Section,
  SectionType,
  PagePlan,
  HeaderSectionData,
  HeroSectionData,
  FeatureGridSectionData,
  StatsBarSectionData,
  DataTableSectionData,
  TestimonialsSectionData,
  PricingTableSectionData,
  CTASectionData,
  FAQSectionData,
  ContentBlockSectionData,
  LogoCloudSectionData,
  FooterSectionData,
  CustomHTMLSectionData,
} from "./catalog/index.js";

// ── Templates (framework-agnostic) ─────────────────────────
export { DESIGN_TOKENS_CSS_TEMPLATE } from "./templates/design-tokens.css.js";
