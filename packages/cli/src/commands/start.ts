import { resolve, basename } from "node:path";
import { readdirSync, existsSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import * as clack from "@clack/prompts";
import chalk from "chalk";
import { printBanner, writeConfig, type IsacConfig } from "@guataiba/isac-core";
import { ADAPTERS } from "../adapters.js";

export interface StartOptions {
  dir?: string;
}

function isEmptyDir(dir: string): boolean {
  if (!existsSync(dir)) return true;
  const entries = readdirSync(dir);
  return entries.length === 0 || (entries.length === 1 && entries[0] === ".git");
}

function cancel(): never {
  clack.cancel("Setup cancelled.");
  process.exit(0);
}

export async function startCommand(options: StartOptions): Promise<void> {
  printBanner();

  const dir = resolve(options.dir ?? process.cwd());
  const isNew = isEmptyDir(dir);

  clack.intro(chalk.cyan("Let's set up your ISAC project"));

  if (isNew) {
    clack.log.info("Empty directory detected — we'll scaffold a new project.");
  } else if (existsSync(resolve(dir, "isac.config.json"))) {
    clack.log.info("Existing ISAC config found — we'll update your preferences.");
  } else {
    clack.log.info("Existing project detected — we'll add ISAC configuration.");
  }

  // ── Step 1: Project name ──────────────────────────────────

  const projectName = await clack.text({
    message: "Project name",
    placeholder: basename(dir),
    defaultValue: basename(dir),
    validate(value: string | undefined) {
      if (!value || !value.trim()) return "Project name is required.";
      if (!/^[a-z0-9@._/-]+$/i.test(value)) return "Use only alphanumeric, @, ., -, / characters.";
    },
  });
  if (clack.isCancel(projectName)) cancel();

  // ── Step 2: Framework ─────────────────────────────────────

  const frameworkOptions = Object.entries(ADAPTERS).map(([key, adapter]) => ({
    value: key,
    label: adapter.displayName,
    hint: key === "nextjs" ? "recommended" : undefined,
  }));

  // Add coming-soon frameworks
  frameworkOptions.push(
    { value: "_remix", label: "Remix", hint: "coming soon" },
    { value: "_astro", label: "Astro", hint: "coming soon" },
  );

  let framework: string | symbol;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    framework = await clack.select({
      message: "Framework",
      options: frameworkOptions,
    });
    if (clack.isCancel(framework)) cancel();

    if (typeof framework === "string" && framework.startsWith("_")) {
      const name = framework.slice(1);
      clack.log.warn(`${name} is not yet available. For now, use Next.js. Track progress at https://github.com/guataiba/isac-cli/issues`);
      continue;
    }
    break;
  }

  // ── Step 3: CSS approach ──────────────────────────────────

  const css = await clack.select({
    message: "CSS approach",
    options: [
      { value: "tailwind" as const, label: "Tailwind CSS", hint: "recommended" },
      { value: "css-modules" as const, label: "CSS Modules" },
      { value: "vanilla" as const, label: "Vanilla CSS" },
    ],
  });
  if (clack.isCancel(css)) cancel();

  // ── Step 4: Component library ─────────────────────────────

  const componentLibrary = await clack.select({
    message: "Component library",
    options: [
      { value: "shadcn" as const, label: "shadcn/ui", hint: css === "tailwind" ? "recommended with Tailwind" : undefined },
      { value: "radix" as const, label: "Radix UI Primitives" },
      { value: "headless" as const, label: "Headless UI" },
      { value: "none" as const, label: "None (custom components)" },
    ],
  });
  if (clack.isCancel(componentLibrary)) cancel();

  // ── Step 5: Icon library ──────────────────────────────────

  const iconLibrary = await clack.select({
    message: "Icon library",
    options: [
      { value: "lucide" as const, label: "Lucide React", hint: "lightweight, popular" },
      { value: "heroicons" as const, label: "Heroicons" },
      { value: "phosphor" as const, label: "Phosphor Icons" },
      { value: "radix-icons" as const, label: "Radix Icons" },
      { value: "none" as const, label: "None" },
    ],
  });
  if (clack.isCancel(iconLibrary)) cancel();

  // ── Step 6: Fonts ─────────────────────────────────────────

  const fonts = await clack.select({
    message: "Font strategy",
    options: [
      { value: "google" as const, label: "Google Fonts (via next/font)", hint: "recommended" },
      { value: "system" as const, label: "System fonts only" },
      { value: "custom" as const, label: "Custom (I'll provide my own)" },
    ],
  });
  if (clack.isCancel(fonts)) cancel();

  // ── Step 7: Color scheme ──────────────────────────────────

  const colorScheme = await clack.select({
    message: "Color scheme support",
    options: [
      { value: "both" as const, label: "Light + Dark mode", hint: "recommended" },
      { value: "light" as const, label: "Light only" },
      { value: "dark" as const, label: "Dark only" },
    ],
  });
  if (clack.isCancel(colorScheme)) cancel();

  // ── Summary ───────────────────────────────────────────────

  const config: IsacConfig = {
    projectName: projectName as string,
    framework: framework as IsacConfig["framework"],
    css: css as IsacConfig["css"],
    componentLibrary: componentLibrary as IsacConfig["componentLibrary"],
    iconLibrary: iconLibrary as IsacConfig["iconLibrary"],
    fonts: fonts as IsacConfig["fonts"],
    colorScheme: colorScheme as IsacConfig["colorScheme"],
  };

  const adapterDisplay = ADAPTERS[config.framework]?.displayName ?? config.framework;

  clack.note(
    [
      `${chalk.dim("Project")}       ${config.projectName}`,
      `${chalk.dim("Framework")}     ${adapterDisplay}`,
      `${chalk.dim("CSS")}           ${config.css}`,
      `${chalk.dim("Components")}    ${config.componentLibrary}`,
      `${chalk.dim("Icons")}         ${config.iconLibrary}`,
      `${chalk.dim("Fonts")}         ${config.fonts}`,
      `${chalk.dim("Color scheme")}  ${config.colorScheme}`,
    ].join("\n"),
    "Configuration summary",
  );

  const confirmed = await clack.confirm({
    message: "Proceed with setup?",
  });
  if (clack.isCancel(confirmed) || !confirmed) cancel();

  // ── Scaffold (new project) ────────────────────────────────

  if (isNew) {
    await scaffoldProject(dir, config);
  }

  // ── Write config ──────────────────────────────────────────

  const configDir = isNew ? resolve(dir, config.projectName) : dir;
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
  writeConfig(configDir, config);
  clack.log.success("Saved isac.config.json");

  // ── Done ──────────────────────────────────────────────────

  const nextCmd = isNew
    ? `cd ${config.projectName} && isac capture <url>`
    : "isac capture <url>";

  clack.outro(
    `Setup complete! Run ${chalk.cyan(nextCmd)} to get started.`,
  );
}

// ── Scaffolding ───────────────────────────────────────────────────

async function scaffoldProject(dir: string, config: IsacConfig): Promise<void> {
  if (config.framework === "nextjs") {
    await scaffoldNextJs(dir, config);
  }
}

async function scaffoldNextJs(dir: string, config: IsacConfig): Promise<void> {
  const s = clack.spinner();

  // ── Create Next.js app ──────────────────────────────────────

  s.start("Creating Next.js project...");

  const flags = [
    "--typescript",
    "--eslint",
    "--app",
    "--no-src-dir",
    '--import-alias="@/*"',
    "--no-turbopack",
  ];

  if (config.css === "tailwind") {
    flags.push("--tailwind");
  } else {
    flags.push("--no-tailwind");
  }

  try {
    execSync(
      `npx create-next-app@latest ${config.projectName} ${flags.join(" ")} --yes`,
      { cwd: dir, stdio: "pipe" },
    );
    s.stop("Next.js project created");
  } catch (err) {
    s.stop("Failed to create Next.js project");
    const msg = err instanceof Error ? err.message : String(err);
    clack.log.error(msg);
    process.exit(1);
  }

  const projectDir = resolve(dir, config.projectName);

  // ── Install extra dependencies ──────────────────────────────

  const deps: string[] = [];

  const iconPackages: Record<string, string> = {
    lucide: "lucide-react",
    heroicons: "@heroicons/react",
    phosphor: "@phosphor-icons/react",
    "radix-icons": "@radix-ui/react-icons",
  };
  if (config.iconLibrary !== "none" && iconPackages[config.iconLibrary]) {
    deps.push(iconPackages[config.iconLibrary]);
  }

  if (deps.length > 0) {
    s.start("Installing additional dependencies...");
    try {
      execSync(`npm install ${deps.join(" ")}`, {
        cwd: projectDir,
        stdio: "pipe",
      });
      s.stop("Dependencies installed");
    } catch {
      s.stop("Some dependencies failed to install — you can install them manually.");
    }
  }

  // ── shadcn/ui init ──────────────────────────────────────────

  if (config.componentLibrary === "shadcn" && config.css === "tailwind") {
    s.start("Initializing shadcn/ui...");
    try {
      execSync("npx shadcn@latest init --yes", {
        cwd: projectDir,
        stdio: "pipe",
      });
      s.stop("shadcn/ui initialized");
    } catch {
      s.stop("shadcn/ui init failed — you can run 'npx shadcn@latest init' manually.");
    }
  }

  // ── Create required dirs ──────────────────────────────────

  const adapter = ADAPTERS[config.framework];
  if (adapter) {
    for (const reqDir of adapter.getRequiredDirs()) {
      const fullPath = resolve(projectDir, reqDir);
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
    }
  }
}
