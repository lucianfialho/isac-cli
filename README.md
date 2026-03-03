# ISAC — Intelligent Site Analysis & Capture

ISAC extracts the Brand DNA from any live website — fonts, colors, design tokens, branding, and icons — and generates a production-ready design system for your Next.js project. Powered by Claude Code.

[![Watch the demo](https://img.youtube.com/vi/uMwzfATF7IE/maxresdefault.jpg)](https://youtu.be/uMwzfATF7IE)

## Packages

| Package | Version | Description |
|---|---|---|
| [`@guataiba/isac-cli`](https://www.npmjs.com/package/@guataiba/isac-cli) | [![npm](https://img.shields.io/npm/v/@guataiba/isac-cli)](https://www.npmjs.com/package/@guataiba/isac-cli) | CLI tool (`isac capture <url>`) |
| [`@guataiba/isac-core`](https://www.npmjs.com/package/@guataiba/isac-core) | [![npm](https://img.shields.io/npm/v/@guataiba/isac-core)](https://www.npmjs.com/package/@guataiba/isac-core) | Framework-agnostic pipeline engine |
| [`@guataiba/isac-nextjs`](https://www.npmjs.com/package/@guataiba/isac-nextjs) | [![npm](https://img.shields.io/npm/v/@guataiba/isac-nextjs)](https://www.npmjs.com/package/@guataiba/isac-nextjs) | Next.js (App Router) adapter |

## Prerequisites

- **Claude Code** 1.0.33+ ([download](https://claude.ai/download))
- **Google Chrome** installed (used for color extraction via Playwright and Chrome DevTools MCP)
- A **Next.js** project with `app/globals.css`
- Node.js 18+

## Installation

```bash
npm install -g @guataiba/isac-cli
```

## Usage

### Design system extraction (default)

Inside a Next.js project:

```bash
isac capture <url>
```

This extracts fonts, colors, branding, and icons from the target URL, generates `globals.css` with design tokens, and builds a visual design system documentation page.

### Full page build

```bash
isac capture <url> --replicate
```

Goes further: captures full-page screenshots, plans the page structure, builds the page using the extracted Brand DNA, and visually verifies the result.

### Interactive setup

```bash
isac start
```

### Options

| Flag | Description |
|---|---|
| `-d, --dir <path>` | Target directory (defaults to cwd) |
| `--replicate` | Full page build mode (screenshots + implementation) |
| `--framework <name>` | Framework adapter (default: `nextjs`) |
| `--max-retries <n>` | Max verification retries (default: 3) |
| `--stop-after <phase>` | Stop after: `screenshots`, `design-system`, or `planning` |

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
| **Phase 0** | Navigate to URL, extract fonts/branding/icons via Claude, extract colors deterministically via Playwright | Claude + Chrome DevTools MCP + Playwright |
| **Phase 1A** | Generate `globals.css` from extracted JSON data | Pure TypeScript (no LLM) |
| **Phase 1B** | Build design system documentation (`data.ts`) | Claude |
| **Phase 2** | Plan page structure from screenshots | Claude |
| **Phase 3** | Implement the page | Claude |
| **Phase 4** | Visual verification with correction loop | Claude + Chrome DevTools MCP |

In **design-system** mode (default), the pipeline runs Phase 0 → 1A → 1B and stops.
In **replicate** mode, it runs all phases (0 → 1A → 1B+2 → 3 → 4).

## Architecture

```
packages/
  core/     → Pipeline engine, css-generator, color-extractor (Playwright), prompts, templates
  nextjs/   → Next.js App Router adapter (prompts, templates, file structure)
  cli/      → CLI entry point, bundles core + nextjs
examples/
  claude-on-mars/  → Complete capture example
```

## Example output

See [`examples/claude-on-mars/`](examples/claude-on-mars/) for a complete Brand DNA extraction example.

## Roadmap

- **More framework adapters** — Astro, Remix, SvelteKit, and others
- **Copy HEX on design system page** — Click-to-copy for hex color codes
- **CLI command evolution** — Evolve CLI commands as the tool matures

## License

MIT — see [LICENSE](LICENSE).
