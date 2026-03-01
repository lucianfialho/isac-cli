import { describe, it, expect } from "vitest";
import type {
  PipelineContext,
  PipelineStopAfter,
  PhaseConfig,
  PhaseOutput,
  PhaseResult,
  VerificationResult,
} from "../pipeline/types.js";

describe("Types", () => {
  it("PipelineContext can be constructed", () => {
    const ctx: PipelineContext = {
      url: "https://example.com",
      cwd: "/tmp/test",
      screenshotDir: ".claude/screenshots",
      animationCatalogPath: ".claude/animations/catalog.json",
      skipAnimations: false,
      maxRetries: 3,
      stopAfter: null,
    };
    expect(ctx.url).toBe("https://example.com");
    expect(ctx.sessionId).toBeUndefined();
    expect(ctx.stopAfter).toBeNull();
  });

  it("PipelineContext supports optional sessionId", () => {
    const ctx: PipelineContext = {
      url: "https://example.com",
      cwd: "/tmp/test",
      screenshotDir: ".claude/screenshots",
      animationCatalogPath: ".claude/animations/catalog.json",
      skipAnimations: false,
      maxRetries: 3,
      stopAfter: null,
      sessionId: "session-123",
    };
    expect(ctx.sessionId).toBe("session-123");
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
        animationCatalogPath: ".claude/animations/catalog.json",
        skipAnimations: false,
        maxRetries: 3,
        stopAfter,
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

  it("PhaseConfig supports optional model and timeout", () => {
    const config: PhaseConfig = {
      name: "phase-0",
      prompt: "Do something",
      allowedTools: ["Read"],
      model: "claude-haiku-4-5-20251001",
      timeout: 300_000,
    };
    expect(config.model).toBe("claude-haiku-4-5-20251001");
    expect(config.timeout).toBe(300_000);
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
