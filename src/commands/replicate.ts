import { Command } from "commander";
import { log } from "../ui/logger.js";
import { printBanner } from "../ui/banner.js";

export const replicateCommand = new Command("replicate")
  .description("Replicate a web page from URL")
  .argument("<url>", "URL of the page to replicate")
  .option("-d, --dir <path>", "Target project directory", ".")
  .option("--skip-animations", "Skip animation detection phase")
  .option("--max-retries <n>", "Max visual verification retries", "3")
  .action(async (url: string, opts: { dir: string; skipAnimations?: boolean; maxRetries: string }) => {
    printBanner();
    log.info(`Replicating ${url}`);
    log.info(`Target directory: ${opts.dir}`);

    const { runPipeline } = await import("../pipeline/orchestrator.js");
    await runPipeline(url, {
      cwd: opts.dir,
      skipAnimations: opts.skipAnimations ?? false,
      maxRetries: parseInt(opts.maxRetries, 10),
    });
  });
