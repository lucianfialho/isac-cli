# ISAC — Intelligent Site Analysis & Capture

ISAC extracts the Brand DNA from any live website — fonts, colors, design tokens, branding, and icons — and generates a production-ready design system for your Next.js project. Powered by Claude Code.

<p align="center">
  <img src="https://s3.sa-east-1.amazonaws.com/download.metricasboss.com.br/export-1772621841033.gif" alt="ISAC benchmark — design system extraction in ~6s, $0.00 API cost" width="100%">
</p>

## Packages

| Package | Version | Description |
|---|---|---|
| [`@guataiba/isac-cli`](https://www.npmjs.com/package/@guataiba/isac-cli) | [![npm](https://img.shields.io/npm/v/@guataiba/isac-cli)](https://www.npmjs.com/package/@guataiba/isac-cli) | CLI tool (`isac capture <url>`) |
| [`@guataiba/isac-core`](https://www.npmjs.com/package/@guataiba/isac-core) | [![npm](https://img.shields.io/npm/v/@guataiba/isac-core)](https://www.npmjs.com/package/@guataiba/isac-core) | Framework-agnostic pipeline engine |
| [`@guataiba/isac-nextjs`](https://www.npmjs.com/package/@guataiba/isac-nextjs) | [![npm](https://img.shields.io/npm/v/@guataiba/isac-nextjs)](https://www.npmjs.com/package/@guataiba/isac-nextjs) | Next.js (App Router) adapter |

## Quick start

### Prerequisites

- **Claude Code** 1.0.33+ ([download](https://claude.ai/download))
- **Google Chrome** installed (used by agent-browser for color/font/icon extraction)
- **Node.js** 18+

### Install the CLI globally

```bash
npm install -g @guataiba/isac-cli
```

### Run it

ISAC works **inside an existing Next.js project**. You need to scaffold one first, then run ISAC inside it:

```bash
# 1. Create a Next.js project (required — ISAC does NOT scaffold projects)
npx create-next-app@latest my-app
cd my-app

# 2. Extract a design system from any website
isac capture https://example.com
```

That's it. ISAC will extract the design system from the URL and generate files inside your project.

> **Important:** Always run `npx create-next-app@latest` first. ISAC expects an existing Next.js project with `app/globals.css`, `package.json`, and dependencies installed.

## Usage

### Design system extraction (default)

```bash
isac capture <url>
```

Extracts fonts, colors, branding, and icons from the target URL, generates `globals.css` with design tokens, and builds a visual design system documentation page.

### Full page build

```bash
isac capture <url> --replicate
```

Goes further: captures full-page screenshots, plans the page structure, builds the page using the extracted Brand DNA, and visually verifies the result.

### Interactive setup

```bash
isac start
```

Walks you through creating an `isac.config.json` with your project preferences (framework, CSS strategy, component library, icon library).

### Options

| Flag | Description |
|---|---|
| `-d, --dir <path>` | Target directory (defaults to cwd) |
| `--replicate` | Full page build mode (screenshots + implementation) |
| `--framework <name>` | Framework adapter (default: `nextjs`) |
| `--max-retries <n>` | Max verification retries (default: 3) |
| `--stop-after <phase>` | Stop after: `screenshots`, `design-system`, or `planning` |

## Try it from scratch

```bash
# 1. Create a fresh Next.js project
npx create-next-app@latest my-app
cd my-app

# 2. Install the CLI
npm install -g @guataiba/isac-cli

# 3. Extract a design system from any website
isac capture https://example.com

# 4. Or do a full page replication
isac capture https://example.com --replicate
```

## Local development

This is a **pnpm monorepo**. All three packages (`core`, `nextjs`, `cli`) are built with [tsup](https://github.com/egoist/tsup) and linked via `workspace:*` dependencies.

### Setup

```bash
# Install all dependencies (requires pnpm 9+)
pnpm install

# Build all packages (core → nextjs → cli)
pnpm build
```

### Development with watch mode

```bash
# Rebuild all packages on file changes
pnpm dev
```

This runs `tsup --watch` in parallel across all packages, so changes in `core` or `nextjs` are immediately reflected in the CLI.

### Running tests

```bash
pnpm test
```

### Type checking

```bash
pnpm typecheck
```

### Project structure

```
isac-cli/
├── packages/
│   ├── core/       # Pipeline engine, CSS generator, color extractor, section catalog, prompts
│   ├── nextjs/     # Next.js App Router adapter (templates, prompts, renderers)
│   └── cli/        # CLI entry point — bundles core + nextjs into a single executable
├── examples/
│   ├── capture/anthropic-com/    # Design system extraction example
│   └── replicate/anthropic-com/  # Full page replication example
├── package.json         # Root workspace scripts
└── pnpm-workspace.yaml  # Workspace configuration
```

## What it produces

### Extracted data (`.claude/`)

| File | Description |
|---|---|
| `.claude/fonts/font-data.json` | Font families, weights, and roles |
| `.claude/colors/color-data.json` | Light mode color palette |
| `.claude/colors/color-data-dark.json` | Dark mode color palette |
| `.claude/branding/brand-data.json` | Company name, tagline, logo URL |
| `.claude/icons/icon-data.json` | Icon library and detected icons |
| `.claude/screenshots/` | Reference screenshots (replicate mode) |

### Generated files

| File | Description |
|---|---|
| `app/globals.css` | CSS custom properties (primitives `--sf-*`, semantics `--color-*`, dark mode, Tailwind v4 bridge) |
| `app/design-system/page.tsx` | Visual design system documentation |
| `app/design-system/data.ts` | Design token data (parsed from globals.css) |
| `app/design-system/layout.tsx` | Layout wrapper |
| `app/design-system/components/theme-toggle.tsx` | Theme toggle component |
| `app/components/theme-toggle.tsx` | Theme toggle for main page |
| `public/fonts/*.woff2` | Downloaded web fonts |
| `app/page.tsx` | Generated page (replicate mode only) |

## Pipeline phases

| Phase | What it does | Powered by |
|---|---|---|
| **Phase 0** | Navigate to URL, extract fonts/colors/branding/icons and capture screenshots | agent-browser (deterministic, $0.00) |
| **Phase 1A** | Generate `globals.css` from extracted JSON data | Pure TypeScript (no LLM) |
| **Phase 1B** | Build design system documentation (`data.ts`) | Pure TypeScript (no LLM) |
| **Phase 2** | Plan page structure from screenshots | Claude |
| **Phase 3** | Implement the page | Claude |
| **Phase 4** | Visual verification with correction loop | Claude + agent-browser |

In **design-system** mode (default), the pipeline runs Phase 0 → 1A → 1B and stops.
In **replicate** mode, it runs all phases (0 → 1A → 1B+2 → 3 → 4).

## Examples

| Example | Description |
|---|---|
| [`examples/capture/anthropic-com/`](examples/capture/anthropic-com/) | Design system extraction from [anthropic.com](https://www.anthropic.com/) |
| [`examples/replicate/anthropic-com/`](examples/replicate/anthropic-com/) | Full landing page replication from [anthropic.com](https://www.anthropic.com/) |

Each example was scaffolded with `npx create-next-app@latest` and then processed with the corresponding `isac` command. They contain the full ISAC output — `globals.css`, design system docs, extracted data, and (in replicate mode) the replicated landing page.

To recreate an example from scratch:

```bash
npx create-next-app@latest my-app && cd my-app
isac capture https://www.anthropic.com/            # design system only
isac replicate https://www.anthropic.com/          # full page replication
```

## Roadmap

- **More framework adapters** — Astro, Remix, SvelteKit, and others
- **Copy HEX on design system page** — Click-to-copy for hex color codes
- **CLI command evolution** — Evolve CLI commands as the tool matures

## License

MIT — see [LICENSE](LICENSE).
