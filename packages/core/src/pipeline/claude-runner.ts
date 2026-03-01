import { spawn } from "node:child_process";
import { writeFileSync, unlinkSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { PhaseConfig, PhaseOutput } from "./types.js";

export async function runClaudePhase(
  config: PhaseConfig,
  cwd: string,
  resumeSessionId?: string,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<PhaseOutput> {
  const start = Date.now();

  const args = [
    "--print",
    "--output-format", "stream-json",
    "--verbose",
    "--max-turns", "50",
  ];

  // Set model if specified
  if (config.model) {
    args.push("--model", config.model);
  }

  // Set allowed tools
  if (config.allowedTools.length > 0) {
    args.push("--allowedTools", config.allowedTools.join(","));
  }

  // Resume session if provided
  if (resumeSessionId) {
    args.push("--resume", resumeSessionId);
  }

  // Write prompt to temp file if long, otherwise pass inline
  let tempPromptFile: string | null = null;

  if (config.prompt.length > 1000) {
    const tempDir = mkdtempSync(join(tmpdir(), "isac-"));
    tempPromptFile = join(tempDir, "prompt.md");
    writeFileSync(tempPromptFile, config.prompt, "utf-8");
    args.push("--prompt-file", tempPromptFile);
  } else {
    args.push(config.prompt);
  }

  return new Promise<PhaseOutput>((resolve, reject) => {
    const timeout = config.timeout ?? 600_000; // 10 min default
    let sessionId = resumeSessionId ?? "";
    let lastResult = "";
    let isError = false;
    let costUsd: number | undefined;

    const proc = spawn("claude", args, {
      cwd,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env },
    });

    // Set timeout
    const timer = setTimeout(() => {
      proc.kill("SIGTERM");
      reject(new Error(`Phase "${config.name}" timed out after ${timeout}ms`));
    }, timeout);

    let buffer = "";

    proc.stdout.on("data", (data: Buffer) => {
      buffer += data.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const event = JSON.parse(line) as Record<string, unknown>;

          // Extract session ID from init or system events
          if (event.type === "system" && event.session_id) {
            sessionId = event.session_id as string;
          }

          // Extract result from result events
          if (event.type === "result") {
            lastResult = (event.result as string) ?? "";
            isError = (event.is_error as boolean) ?? false;
            costUsd = event.cost_usd as number | undefined;
            if (event.session_id) {
              sessionId = event.session_id as string;
            }
          }

          // Forward event to callback
          if (onEvent) {
            onEvent(event);
          }
        } catch {
          // Not valid JSON — skip
        }
      }
    });

    let stderrOutput = "";
    proc.stderr.on("data", (data: Buffer) => {
      stderrOutput += data.toString();
    });

    proc.on("close", (code) => {
      clearTimeout(timer);

      // Clean up temp file
      if (tempPromptFile) {
        try {
          unlinkSync(tempPromptFile);
        } catch {
          // ignore
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        try {
          const event = JSON.parse(buffer) as Record<string, unknown>;
          if (event.type === "result") {
            lastResult = (event.result as string) ?? lastResult;
            isError = (event.is_error as boolean) ?? isError;
            costUsd = event.cost_usd as number | undefined;
            if (event.session_id) {
              sessionId = event.session_id as string;
            }
          }
        } catch {
          // ignore
        }
      }

      if (code !== 0 && !lastResult) {
        reject(
          new Error(
            `Phase "${config.name}" exited with code ${code}.\nstderr: ${stderrOutput}`,
          ),
        );
        return;
      }

      resolve({
        result: lastResult,
        sessionId,
        costUsd,
        isError,
        durationMs: Date.now() - start,
      });
    });

    proc.on("error", (err) => {
      clearTimeout(timer);
      if (tempPromptFile) {
        try {
          unlinkSync(tempPromptFile);
        } catch {
          // ignore
        }
      }
      reject(
        new Error(
          `Failed to spawn claude for phase "${config.name}": ${err.message}`,
        ),
      );
    });
  });
}
