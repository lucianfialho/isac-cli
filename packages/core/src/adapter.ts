/**
 * Describes a template file that the adapter wants written to disk.
 */
export interface TemplateFile {
  /** Relative path from the project root (e.g., "app/design-system/page.tsx") */
  path: string;
  /** File content as a string */
  content: string;
}

/**
 * Framework-specific phase validation result.
 */
export interface PhaseValidation {
  valid: boolean;
  message?: string;
}

/**
 * The contract that every framework adapter must implement.
 *
 * The core orchestrator calls these methods at the appropriate phase boundaries
 * to get framework-specific prompts, templates, validation, and paths.
 */
export interface FrameworkAdapter {
  /** Adapter identifier, e.g., "nextjs", "remix", "vue" */
  readonly name: string;

  /** Display name for CLI output, e.g., "Next.js (App Router)" */
  readonly displayName: string;

  // ─── Prompts ─────────────────────────────────────────────

  /**
   * Phase 1A: Returns the prompt for design token extraction.
   * Framework-specific because it references CSS file paths and styling patterns.
   */
  getTokenExtractionPrompt(screenshotDir: string, targetUrl?: string): string;

  /**
   * Phase 1B: Returns the prompt for design system page/data generation.
   * Framework-specific because it references component paths.
   */
  getDesignSystemPrompt(screenshotDir: string): string;

  /**
   * Phase 2: Returns the prompt for page planning.
   * Framework-specific because it references routing conventions.
   */
  getPagePlannerPrompt(screenshotDir: string): string;

  /**
   * Phase 3: Returns the prompt for page implementation.
   * Framework-specific because it references component patterns.
   */
  getPageBuilderPrompt(
    plan: string,
    screenshotDir: string,
    corrections?: string,
  ): string;

  /**
   * Phase 4: Returns the prompt for visual verification.
   * Framework-specific because it references dev server URL and port.
   */
  getVisualVerifierPrompt(screenshotDir: string): string;

  // ─── Paths & Conventions ────────────────────────────────

  /**
   * Returns the path to the global CSS file, relative to project root.
   * e.g., "app/globals.css" for Next.js, "src/index.css" for Vite+React.
   */
  getGlobalCssPath(): string;

  /**
   * Returns the path to the main page file, relative to project root.
   * e.g., "app/page.tsx" for Next.js, "src/App.tsx" for Vite+React.
   */
  getMainPagePath(): string;

  /**
   * Returns the path to the design system data file, relative to project root.
   */
  getDesignSystemDataPath(): string;

  /**
   * Returns directories that the adapter needs created before phase 0.
   * e.g., ["public/fonts"] for Next.js.
   */
  getRequiredDirs(): string[];

  /**
   * Returns the build command to validate the project compiles.
   */
  getBuildCommand(): string;

  /**
   * Returns the dev server URL for visual verification.
   */
  getDevServerUrl(): string;

  // ─── Templates ──────────────────────────────────────────

  /**
   * Returns the template files that should be written after the design system phase.
   * These are written as the LAST step to prevent later phases from overwriting them.
   */
  getDesignSystemTemplates(): TemplateFile[];

  /**
   * Returns the CSS design tokens template (as reference for Claude prompts).
   */
  getDesignTokensCssTemplate(): string;

  /**
   * Returns the design system data template (schema reference for Claude prompts).
   */
  getDesignSystemDataTemplate(): string;

  // ─── Validation ─────────────────────────────────────────

  /**
   * Phase 1A validation: Check that token extraction produced valid output.
   */
  validateTokenExtraction(cwd: string): PhaseValidation;

  /**
   * Phase 1A post-processing: Normalize font variables, inject fallbacks, etc.
   */
  postProcessTokenExtraction(cwd: string): void;

  /**
   * Phase 1B validation: Check that design system data was created.
   */
  validateDesignSystem(cwd: string): PhaseValidation;

  /**
   * Phase 1B fallback: Generate design system data from globals.css if Claude failed.
   */
  generateDesignSystemFallback(cwd: string, url: string): void;

  /**
   * Phase 3 validation: Check that implementation files exist.
   */
  validateImplementation(cwd: string): PhaseValidation;

  /**
   * Collect created files for the pipeline result summary.
   * Returns paths relative to project root.
   */
  collectCreatedFiles(cwd: string): string[];
}
