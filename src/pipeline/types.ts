export type PipelineStopAfter =
  | "screenshots"
  | "design-system"
  | "planning"
  | null;

export interface PipelineContext {
  url: string;
  cwd: string;
  screenshotDir: string;
  animationCatalogPath: string;
  skipAnimations: boolean;
  maxRetries: number;
  stopAfter: PipelineStopAfter;
  sessionId?: string;
}

export interface PhaseConfig {
  name: string;
  prompt: string;
  allowedTools: string[];
  model?: string;
  timeout?: number;
}

export interface PhaseOutput {
  result: string;
  sessionId: string;
  costUsd?: number;
  isError: boolean;
  durationMs: number;
}

export interface PhaseResult {
  phase: string;
  success: boolean;
  duration: number;
  costUsd?: number;
  error?: string;
}

export interface VerificationResult {
  approved: boolean;
  issues: string[];
  screenshots?: {
    light?: string;
    dark?: string;
  };
}
