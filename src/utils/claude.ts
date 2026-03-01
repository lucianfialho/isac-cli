import { execSync } from "node:child_process";

export function ensureClaude(): boolean {
  try {
    execSync("claude --version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

export function getClaudeVersion(): string {
  try {
    return execSync("claude --version", { stdio: "pipe", encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}
