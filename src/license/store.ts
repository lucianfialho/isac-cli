import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const CONFIG_DIR = join(homedir(), ".isac");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export interface IsacConfig {
  licenseKey?: string;
  provider?: string;
  apiKey?: string;
}

export function readConfig(): IsacConfig {
  try {
    const raw = readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(raw) as IsacConfig;
  } catch {
    return {};
  }
}

export function writeConfig(config: IsacConfig): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n");
}

export function updateConfig(partial: Partial<IsacConfig>): void {
  const current = readConfig();
  writeConfig({ ...current, ...partial });
}
