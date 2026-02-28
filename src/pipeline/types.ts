export interface PipelineOptions {
  cwd: string;
  skipAnimations: boolean;
  maxRetries: number;
}

export interface PipelineContext {
  url: string;
  cwd: string;
  screenshotDir: string;
  animationCatalogPath: string;
  skipAnimations: boolean;
  maxRetries: number;
}

export interface PhaseResult {
  phase: string;
  success: boolean;
  duration: number;
  data?: Record<string, unknown>;
  error?: string;
}

export interface VerificationResult extends PhaseResult {
  approved: boolean;
  issues?: string[];
}

export interface ScreenshotResult {
  lightPath: string;
  darkPath?: string;
  sectionPaths: string[];
}

export interface AnimationCatalog {
  url: string;
  detectedLibraries: { name: string; version: string }[];
  keyframes: Record<string, { keyText: string; style: string }[]>;
  animations: AnimationEntry[];
  summary: {
    total: number;
    byType: Record<string, number>;
    byTrigger: Record<string, number>;
    complexity: "none" | "simple" | "intermediate" | "complex";
  };
}

export interface AnimationEntry {
  id: string;
  selector: string;
  type: string;
  trigger: string;
  properties?: Record<string, unknown>;
  duration?: number;
  delay?: number;
  easing?: string;
  motionEquivalent?: string;
}
