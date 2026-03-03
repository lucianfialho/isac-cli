import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const CONFIG_FILENAME = "isac.config.json";

export interface IsacConfig {
  projectName: string;
  framework: "nextjs";
  /** Used during scaffolding (isac start) to configure create-next-app flags */
  css: "tailwind" | "css-modules" | "vanilla";
  /** Used during scaffolding to init component library (e.g. shadcn) */
  componentLibrary: "shadcn" | "radix" | "headless" | "none";
  /** Used during scaffolding to install icon packages */
  iconLibrary: "lucide" | "heroicons" | "phosphor" | "radix-icons" | "none";
}

export function readConfig(dir: string): IsacConfig | null {
  const configPath = join(dir, CONFIG_FILENAME);
  if (!existsSync(configPath)) return null;
  try {
    const raw = readFileSync(configPath, "utf-8");
    return JSON.parse(raw) as IsacConfig;
  } catch {
    return null;
  }
}

export function writeConfig(dir: string, config: IsacConfig): void {
  const configPath = join(dir, CONFIG_FILENAME);
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
}
