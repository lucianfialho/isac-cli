import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { log } from "../ui/logger.js";
import type { VerificationResult } from "./types.js";

/**
 * Default similarity threshold (0–1). Pages with >97% pixel match are approved.
 */
const DEFAULT_THRESHOLD = 0.97;

/**
 * Pixel-diff tolerance for individual pixels (0–255 per channel).
 * Allows minor anti-aliasing differences.
 */
const PIXEL_THRESHOLD = 0.1;

interface PixelDiffOptions {
  referenceDir: string;
  implementationUrl: string;
  outputDir: string;
  threshold?: number;
}

/**
 * Compare a reference screenshot with a live screenshot of the implementation.
 *
 * Uses agent-browser to capture the implementation screenshot, then pixelmatch
 * for pixel-level comparison.
 *
 * Returns a VerificationResult compatible with Phase 4.
 */
export async function runPixelDiff(options: PixelDiffOptions): Promise<VerificationResult> {
  const { referenceDir, implementationUrl, outputDir, threshold = DEFAULT_THRESHOLD } = options;

  // Check if reference screenshot exists
  const refPath = join(referenceDir, "full-page.png");
  if (!existsSync(refPath)) {
    log.warn("No reference screenshot found — skipping pixel-diff");
    return { approved: false, issues: ["No reference screenshot available for pixel-diff"] };
  }

  try {
    // Dynamic imports for optional dependencies
    const { PNG } = await import("pngjs");
    const pixelmatch = (await import("pixelmatch")).default;

    // Capture implementation screenshot via agent-browser
    log.info("Capturing implementation screenshot for pixel-diff...");
    mkdirSync(outputDir, { recursive: true });

    execSync(`agent-browser open "${implementationUrl}"`, { stdio: "pipe", timeout: 30_000 });
    execSync("agent-browser wait --load networkidle", { stdio: "pipe", timeout: 30_000 });
    execSync("agent-browser set viewport 1280 800", { stdio: "pipe" });
    execSync("agent-browser wait 1000", { stdio: "pipe" });

    const implPath = join(outputDir, "implementation-full-page.png");
    execSync(`agent-browser screenshot --full "${implPath}"`, { stdio: "pipe", timeout: 15_000 });

    // Dark mode screenshot
    const implDarkPath = join(outputDir, "implementation-full-page-dark.png");
    execSync("agent-browser set media dark", { stdio: "pipe" });
    execSync("agent-browser wait 500", { stdio: "pipe" });
    execSync(`agent-browser screenshot --full "${implDarkPath}"`, { stdio: "pipe", timeout: 15_000 });

    // Reset to light mode
    execSync("agent-browser set media light", { stdio: "pipe" });
    execSync("agent-browser close", { stdio: "pipe" });

    // Compare light mode
    const refImg = PNG.sync.read(readFileSync(refPath));
    const implImg = PNG.sync.read(readFileSync(implPath));

    // Resize to match (use smaller dimensions)
    const width = Math.min(refImg.width, implImg.width);
    const height = Math.min(refImg.height, implImg.height);

    // Create cropped buffers if needed
    const refBuf = cropPng(refImg, width, height);
    const implBuf = cropPng(implImg, width, height);

    const diff = new PNG({ width, height });
    const numDiffPixels = pixelmatch(
      refBuf, implBuf, diff.data,
      width, height,
      { threshold: PIXEL_THRESHOLD },
    );

    const totalPixels = width * height;
    const similarity = 1 - numDiffPixels / totalPixels;
    const similarityPct = (similarity * 100).toFixed(1);

    // Save diff image
    const diffPath = join(outputDir, "pixel-diff.png");
    writeFileSync(diffPath, PNG.sync.write(diff));

    log.info(`Pixel similarity: ${similarityPct}% (threshold: ${(threshold * 100).toFixed(0)}%)`);

    if (similarity >= threshold) {
      return {
        approved: true,
        issues: [],
        screenshots: { light: implPath },
      };
    }

    return {
      approved: false,
      issues: [
        `Pixel similarity ${similarityPct}% is below threshold ${(threshold * 100).toFixed(0)}%`,
        `${numDiffPixels} pixels differ out of ${totalPixels}`,
        `Diff image saved to ${diffPath}`,
      ],
      screenshots: { light: implPath },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.warn(`Pixel-diff failed: ${msg}`);
    return { approved: false, issues: [`Pixel-diff error: ${msg}`] };
  }
}

/**
 * Crop a PNG image buffer to the given dimensions (top-left corner).
 */
function cropPng(img: { data: Buffer; width: number; height: number }, w: number, h: number): Buffer {
  if (img.width === w && img.height === h) return img.data;
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const srcOffset = y * img.width * 4;
    const dstOffset = y * w * 4;
    img.data.copy(out, dstOffset, srcOffset, srcOffset + w * 4);
  }
  return out;
}
