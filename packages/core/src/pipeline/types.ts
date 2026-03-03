import type { FrameworkAdapter } from "../adapter.js";

export type PipelineMode = "design-system" | "replicate";

export type PipelineStopAfter =
  | "screenshots"
  | "design-system"
  | "planning"
  | "implementation"
  | null;

export interface PipelineContext {
  url: string;
  cwd: string;
  screenshotDir: string;
  maxRetries: number;
  mode: PipelineMode;
  stopAfter: PipelineStopAfter;
  animations: boolean;
  sessionId?: string;
  adapter: FrameworkAdapter;
}

export interface PhaseConfig {
  name: string;
  prompt: string;
  allowedTools: string[];
  model?: string;
  timeout?: number;
  maxTurns?: number;
  /** Rolling silence timeout (ms). Resets on each stdout chunk. Default: 120s */
  activityTimeout?: number;
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

export interface PipelineOptions {
  url: string;
  dir: string;
  maxRetries: number;
  mode: PipelineMode;
  stopAfter: PipelineStopAfter;
  adapter: FrameworkAdapter;
  animations: boolean;
}

export interface PipelineResult {
  success: boolean;
  approved: boolean;
  stoppedAt: string | null;
  url: string;
  phases: PhaseResult[];
  totalDuration: number;
  totalCostUsd: number;
  filesCreated: string[];
}
