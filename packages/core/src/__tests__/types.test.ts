import { describe, it, expect } from "vitest";
import type {
  PipelineContext,
  PipelineMode,
  PipelineStopAfter,
  PhaseConfig,
  PhaseOutput,
  PhaseResult,
  VerificationResult,
} from "../pipeline/types.js";
import type { FrameworkAdapter } from "../adapter.js";

/** Minimal mock adapter for type-level tests */
const mockAdapter: FrameworkAdapter = {
  name: "mock",
  displayName: "Mock Framework",
  getDesignSystemPrompt: () => "",
  getPagePlannerPrompt: () => "",
  getPageBuilderPrompt: () => "",
  getVisualVerifierPrompt: () => "",
  getGlobalCssPath: () => "src/index.css",
  getMainPagePath: () => "src/App.tsx",
  getDesignSystemDataPath: () => "src/design-system/data.ts",
  getRequiredDirs: () => ["public/fonts"],
  getBuildCommand: () => "npm run build",
  getDevServerUrl: () => "http://localhost:5173",
  getDesignSystemTemplates: () => [],
  getDesignTokensCssTemplate: () => "",
  getDesignSystemDataTemplate: () => "",
  getStubDataTemplate: () => ({ path: "src/design-system/data.ts", content: "" }),
  validateTokenExtraction: () => ({ valid: true }),
  postProcessTokenExtraction: () => {},
  validateDesignSystem: () => ({ valid: true }),
  generateDesignSystemFallback: () => {},
  validateImplementation: () => ({ valid: true }),
  collectCreatedFiles: () => [],
};

describe("Types", () => {
  it("PipelineContext can be constructed", () => {
    const ctx: PipelineContext = {
      url: "https://example.com",
      cwd: "/tmp/test",
      screenshotDir: ".claude/screenshots",
      maxRetries: 3,
      mode: "design-system",
      stopAfter: null,
      adapter: mockAdapter,
    };
    expect(ctx.url).toBe("https://example.com");
    expect(ctx.sessionId).toBeUndefined();
    expect(ctx.stopAfter).toBeNull();
    expect(ctx.mode).toBe("design-system");
    expect(ctx.adapter.name).toBe("mock");
  });

  it("PipelineContext supports optional sessionId", () => {
    const ctx: PipelineContext = {
      url: "https://example.com",
      cwd: "/tmp/test",
      screenshotDir: ".claude/screenshots",
      maxRetries: 3,
      mode: "design-system",
      stopAfter: null,
      sessionId: "session-123",
      adapter: mockAdapter,
    };
    expect(ctx.sessionId).toBe("session-123");
  });

  it("PipelineContext supports mode values", () => {
    const modes: PipelineMode[] = ["design-system", "replicate"];
    for (const mode of modes) {
      const ctx: PipelineContext = {
        url: "https://example.com",
        cwd: "/tmp/test",
        screenshotDir: ".claude/screenshots",
        maxRetries: 3,
        mode,
        stopAfter: null,
        adapter: mockAdapter,
      };
      expect(ctx.mode).toBe(mode);
    }
  });

  it("PipelineContext supports stopAfter values", () => {
    const values: PipelineStopAfter[] = [
      "screenshots",
      "design-system",
      "planning",
      null,
    ];
    for (const stopAfter of values) {
      const ctx: PipelineContext = {
        url: "https://example.com",
        cwd: "/tmp/test",
        screenshotDir: ".claude/screenshots",
        maxRetries: 3,
        mode: "design-system",
        stopAfter,
        adapter: mockAdapter,
      };
      expect(ctx.stopAfter).toBe(stopAfter);
    }
  });

  it("PhaseConfig can be constructed", () => {
    const config: PhaseConfig = {
      name: "phase-0",
      prompt: "Do something",
      allowedTools: ["Read", "Write"],
    };
    expect(config.name).toBe("phase-0");
    expect(config.model).toBeUndefined();
    expect(config.timeout).toBeUndefined();
  });

  it("PhaseConfig supports optional model, timeout, and maxTurns", () => {
    const config: PhaseConfig = {
      name: "phase-0",
      prompt: "Do something",
      allowedTools: ["Read"],
      model: "claude-haiku-4-5-20251001",
      timeout: 300_000,
      maxTurns: 15,
    };
    expect(config.model).toBe("claude-haiku-4-5-20251001");
    expect(config.timeout).toBe(300_000);
    expect(config.maxTurns).toBe(15);
  });

  it("PhaseOutput can be constructed", () => {
    const output: PhaseOutput = {
      result: "done",
      sessionId: "sess-1",
      isError: false,
      durationMs: 1234,
    };
    expect(output.result).toBe("done");
    expect(output.costUsd).toBeUndefined();
  });

  it("PhaseResult can be constructed", () => {
    const result: PhaseResult = {
      phase: "phase-0",
      success: true,
      duration: 5000,
    };
    expect(result.error).toBeUndefined();
    expect(result.costUsd).toBeUndefined();
  });

  it("PhaseResult supports optional costUsd", () => {
    const result: PhaseResult = {
      phase: "phase-0",
      success: true,
      duration: 5000,
      costUsd: 0.0123,
    };
    expect(result.costUsd).toBe(0.0123);
  });

  it("VerificationResult can be constructed", () => {
    const result: VerificationResult = {
      approved: false,
      issues: ["Color mismatch"],
    };
    expect(result.approved).toBe(false);
    expect(result.issues).toHaveLength(1);
  });
});
