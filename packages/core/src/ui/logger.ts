import chalk from "chalk";

const PHASE_ICONS: Record<string, string> = {
  "phase-0": "📸",
  "phase-1a": "🎨",
  "phase-1b": "📖",
  "phase-1c": "✨",
  "phase-2": "📐",
  "phase-3": "🔨",
  "phase-4": "🔍",
};

export const log = {
  phase(num: string, label: string) {
    const icon = PHASE_ICONS[`phase-${num}`] ?? "●";
    console.log(`\n  ${icon} ${chalk.bold(`Phase ${num}`)}: ${label}`);
  },

  success(msg: string) {
    console.log(`    ${chalk.green("✓")} ${msg}`);
  },

  error(msg: string) {
    console.log(`    ${chalk.red("✗")} ${msg}`);
  },

  warn(msg: string) {
    console.log(`    ${chalk.yellow("⚠")} ${msg}`);
  },

  info(msg: string) {
    console.log(`    ${chalk.dim(msg)}`);
  },

  divider() {
    console.log(`\n  ${"─".repeat(37)}`);
  },

  summary(label: string, value: string) {
    console.log(`  ${chalk.dim(label + ":")} ${value}`);
  },

  elapsed(startMs: number) {
    const elapsed = Date.now() - startMs;
    const secs = Math.floor(elapsed / 1000);
    const mins = Math.floor(secs / 60);
    const remainSecs = secs % 60;
    return mins > 0
      ? `${mins}m ${remainSecs}s`
      : `${remainSecs}s`;
  },
};
