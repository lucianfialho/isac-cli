import { Command } from "commander";
import { replicateCommand } from "./commands/replicate.js";

const program = new Command();

program
  .name("isac")
  .description("ISAC — Intelligent Site Analysis & Cloning CLI")
  .version("1.0.0");

program
  .command("replicate")
  .description("Replicate a web page as a pixel-perfect Next.js app")
  .argument("<url>", "URL of the page to replicate")
  .option("-d, --dir <path>", "Target directory (defaults to cwd)")
  .option("--skip-animations", "Skip animation detection phase", false)
  .option("--max-retries <n>", "Max verification retries", "3")
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
    await replicateCommand(url, {
      dir: opts.dir as string | undefined,
      skipAnimations: opts.skipAnimations as boolean,
      maxRetries: opts.maxRetries ? parseInt(opts.maxRetries as string, 10) : 3,
      onlyDesignSystem: opts.onlyDesignSystem as boolean,
      stopAfter: opts.stopAfter as string | undefined,
    });
  });

program.parse();
