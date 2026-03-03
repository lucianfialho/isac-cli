import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { Command } from "commander";
import { captureCommand } from "./commands/capture.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf-8"));

const program = new Command();

program
  .name("isac")
  .description("ISAC — Intelligent Site Analysis & Cloning CLI")
  .version(pkg.version);

program
  .command("capture")
  .alias("replicate")
  .description("Capture and extract design system from a URL")
  .argument("<url>", "URL of the page to capture")
  .option("-d, --dir <path>", "Target directory (defaults to cwd)")
.option("--max-retries <n>", "Max verification retries", "3")
  .option(
    "--framework <name>",
    "Framework adapter to use (default: nextjs)",
    "nextjs",
  )
  .option(
    "--replicate",
    "Full page replication (screenshots + implementation)",
    false,
  )
  .option(
    "--stop-after <phase>",
    "Stop after a specific phase: screenshots, design-system, planning, implementation",
  )
  .option(
    "--animations",
    "Detect and catalog page animations (replicate mode only)",
    false,
  )
  .action(async (url: string, opts: Record<string, string | boolean>) => {
    const invokedAsReplicate = process.argv[2] === "replicate";
    await captureCommand(url, {
      dir: opts.dir as string | undefined,
      maxRetries: opts.maxRetries ? parseInt(opts.maxRetries as string, 10) : 3,
      framework: (opts.framework as string) ?? "nextjs",
      replicate: invokedAsReplicate || (opts.replicate as boolean),
      stopAfter: opts.stopAfter as string | undefined,
      animations: (opts.animations as boolean) ?? false,
    });
  });

program
  .command("start")
  .alias("init")
  .description("Interactive project setup wizard")
  .option("-d, --dir <path>", "Target directory (defaults to cwd)")
  .action(async (opts: Record<string, string>) => {
    const { startCommand } = await import("./commands/start.js");
    await startCommand({ dir: opts.dir });
  });

program.parse();
