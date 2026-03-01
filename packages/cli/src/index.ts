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
  .option("--skip-animations", "Skip animation detection phase", false)
  .option("--max-retries <n>", "Max verification retries", "3")
  .option(
    "--framework <name>",
    "Framework adapter to use (default: nextjs)",
    "nextjs",
  )
  .option(
    "--only-design-system",
    "Stop after building the design system (Phase 0 + 1a + 1b)",
    false,
  )
  .option(
    "--stop-after <phase>",
    "Stop after a specific phase: screenshots, design-system, planning",
  )
  .action(async (url: string, opts: Record<string, string | boolean>) => {
    await captureCommand(url, {
      dir: opts.dir as string | undefined,
      skipAnimations: opts.skipAnimations as boolean,
      maxRetries: opts.maxRetries ? parseInt(opts.maxRetries as string, 10) : 3,
      framework: (opts.framework as string) ?? "nextjs",
      onlyDesignSystem: opts.onlyDesignSystem as boolean,
      stopAfter: opts.stopAfter as string | undefined,
    });
  });

program.parse();
