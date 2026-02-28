import { execSync } from "node:child_process";
import { buildConfig } from "./config.js";
import { log } from "../ui/logger.js";

let clientInstance: any = null;

function ensureBinary(): string {
  try {
    const path = execSync("which opencode", { encoding: "utf-8" }).trim();
    return path;
  } catch {
    // Try node_modules/.bin
    try {
      const path = execSync("npx which opencode", {
        encoding: "utf-8",
      }).trim();
      return path;
    } catch {
      throw new Error(
        "OpenCode binary not found. Install it with: npm install -g opencode-ai"
      );
    }
  }
}

export async function bootOpencode(cwd: string): Promise<any> {
  if (clientInstance) return clientInstance;

  ensureBinary();
  const config = buildConfig();
  process.env.OPENCODE_CONFIG_CONTENT = JSON.stringify(config);

  const { createOpencode } = await import("@opencode-ai/sdk");
  const client = await createOpencode({ cwd });
  clientInstance = client;
  return client;
}

export function getClient(): any {
  if (!clientInstance) {
    throw new Error("OpenCode not initialized. Call bootOpencode() first.");
  }
  return clientInstance;
}
