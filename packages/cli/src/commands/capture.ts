import { resolve } from "node:path";
import chalk from "chalk";
import {
  ensureClaude,
  printBanner,
  log,
  readConfig,
  runPipeline,
  disableMcp,
  type PipelineStopAfter,
  type PipelineMode,
} from "@guataiba/isac-core";
import { resolveAdapter } from "../adapters.js";

// ── Command ─────────────────────────────────────────────────────────

export interface CaptureOptions {
  dir?: string;
  maxRetries?: number;
  framework?: string;
  replicate?: boolean;
  stopAfter?: string;
  animations?: boolean;
}

export async function captureCommand(
  url: string,
  options: CaptureOptions,
): Promise<void> {
  printBanner();

  // Validate URL
  if (!url || !url.startsWith("http")) {
    console.error(
      chalk.red("  Error: Invalid URL. Usage: isac capture <url>"),
    );
    process.exit(1);
  }

  // Ensure Claude CLI is available
  if (!ensureClaude()) {
    console.error(
      chalk.red(
        "  Error: Claude CLI not found. Install it from https://claude.ai/download",
      ),
    );
    process.exit(1);
  }

  const dir = resolve(options.dir ?? process.cwd());

  // Load project config (if exists)
  const config = readConfig(dir);

  // Resolve adapter (CLI flag > config > default)
  const adapter = resolveAdapter(options.framework ?? config?.framework ?? "nextjs");
  const maxRetries = options.maxRetries ?? 3;
  // Resolve mode
  const mode: PipelineMode = options.replicate ? "replicate" : "design-system";
  const animations = options.animations ?? false;

  // Resolve stopAfter
  let stopAfter: PipelineStopAfter = null;
  if (options.stopAfter) {
    const valid = ["screenshots", "design-system", "planning", "implementation"];
    if (!valid.includes(options.stopAfter)) {
      console.error(
        chalk.red(
          `  Error: Invalid --stop-after value. Must be one of: ${valid.join(", ")}`,
        ),
      );
      process.exit(1);
    }
    stopAfter = options.stopAfter as PipelineStopAfter;
  }

  // Print config
  log.summary("Target", url);
  log.summary("Directory", dir);
  log.summary("Framework", adapter.displayName);
  log.summary("Mode", mode === "replicate" ? "Page replication" : "Design system");
  if (stopAfter) {
    log.summary("Stop after", stopAfter);
  } else if (mode === "replicate") {
    log.summary("Max retries", String(maxRetries));
  }
  console.log();

  // Handle Ctrl+C gracefully — ensure .mcp.json is cleaned up
  const cleanup = () => {
    console.log(chalk.dim("\n\n  Interrupted. Exiting..."));
    disableMcp(dir);
    process.exit(130);
  };
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  try {
    const result = await runPipeline({
      url,
      dir,
      maxRetries,
      mode,
      stopAfter,
      adapter,
      animations,
    });

    log.divider();

    const elapsed = log.elapsed(totalStartFromDuration(result.totalDuration));
    const costStr = `$${result.totalCostUsd.toFixed(2)}`;

    if (result.stoppedAt) {
      console.log(
        chalk.cyan(`  Stopped after: ${result.stoppedAt} (${elapsed}) — Total cost: ${costStr}\n`),
      );
    } else if (result.approved) {
      console.log(chalk.green(`  Done in ${elapsed} — Total cost: ${costStr}\n`));
    } else if (result.success) {
      console.log(
        chalk.yellow(`  Completed with corrections pending (${elapsed}) — Total cost: ${costStr}\n`),
      );
    } else {
      console.log(chalk.red(`  Pipeline failed (${elapsed}) — Total cost: ${costStr}\n`));
    }

    if (result.filesCreated.length > 0) {
      console.log("  Files created:");
      for (const file of result.filesCreated) {
        console.log(`    ${file}`);
      }
      console.log();
    }

    const devUrl = adapter.getDevServerUrl();
    if (result.stoppedAt === "design-system") {
      console.log(
        chalk.dim(`  Run: npm run dev → ${devUrl}/design-system\n`),
      );
    } else {
      console.log(chalk.dim(`  Run: npm run dev → ${devUrl}\n`));
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(`\n  Pipeline error: ${msg}`));
    process.exit(1);
  } finally {
    process.removeListener("SIGINT", cleanup);
    process.removeListener("SIGTERM", cleanup);
  }
}

function totalStartFromDuration(durationMs: number): number {
  return Date.now() - durationMs;
}
