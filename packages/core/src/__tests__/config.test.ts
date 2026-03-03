import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { readConfig, writeConfig, type IsacConfig } from "../config.js";

const SAMPLE_CONFIG: IsacConfig = {
  projectName: "my-project",
  framework: "nextjs",
  css: "tailwind",
  componentLibrary: "shadcn",
  iconLibrary: "lucide",
};

describe("config", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "isac-config-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe("readConfig", () => {
    it("returns null when no config file exists", () => {
      expect(readConfig(tempDir)).toBeNull();
    });

    it("reads a valid config file", () => {
      writeConfig(tempDir, SAMPLE_CONFIG);
      const config = readConfig(tempDir);
      expect(config).toEqual(SAMPLE_CONFIG);
    });

    it("returns null for invalid JSON", () => {
      const configPath = join(tempDir, "isac.config.json");
      require("node:fs").writeFileSync(configPath, "not json{{{", "utf-8");
      expect(readConfig(tempDir)).toBeNull();
    });
  });

  describe("writeConfig", () => {
    it("writes config as formatted JSON", () => {
      writeConfig(tempDir, SAMPLE_CONFIG);
      const raw = readFileSync(join(tempDir, "isac.config.json"), "utf-8");
      expect(raw).toBe(JSON.stringify(SAMPLE_CONFIG, null, 2) + "\n");
    });

    it("overwrites existing config", () => {
      writeConfig(tempDir, SAMPLE_CONFIG);
      const updated: IsacConfig = { ...SAMPLE_CONFIG, css: "vanilla" };
      writeConfig(tempDir, updated);
      const config = readConfig(tempDir);
      expect(config?.css).toBe("vanilla");
    });
  });

  describe("IsacConfig type contracts", () => {
    it("supports all framework values", () => {
      const config: IsacConfig = { ...SAMPLE_CONFIG, framework: "nextjs" };
      expect(config.framework).toBe("nextjs");
    });

    it("supports all css values", () => {
      for (const css of ["tailwind", "css-modules", "vanilla"] as const) {
        const config: IsacConfig = { ...SAMPLE_CONFIG, css };
        expect(config.css).toBe(css);
      }
    });

    it("supports all componentLibrary values", () => {
      for (const lib of ["shadcn", "radix", "headless", "none"] as const) {
        const config: IsacConfig = { ...SAMPLE_CONFIG, componentLibrary: lib };
        expect(config.componentLibrary).toBe(lib);
      }
    });

    it("supports all iconLibrary values", () => {
      for (const lib of ["lucide", "heroicons", "phosphor", "radix-icons", "none"] as const) {
        const config: IsacConfig = { ...SAMPLE_CONFIG, iconLibrary: lib };
        expect(config.iconLibrary).toBe(lib);
      }
    });

    it("does not include unused fields (fonts, colorScheme)", () => {
      const config: IsacConfig = { ...SAMPLE_CONFIG };
      expect("fonts" in config).toBe(false);
      expect("colorScheme" in config).toBe(false);
    });
  });
});
