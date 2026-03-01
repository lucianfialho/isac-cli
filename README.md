# ISAC — Intelligent Site Analysis & Cloning CLI

ISAC captures screenshots from a URL, extracts the design system, detects animations, plans the page structure, implements a pixel-perfect Next.js replica, and visually verifies the result — all powered by Claude Code.

## Prerequisites

- **Claude Code** 1.0.33+ ([download](https://claude.ai/download))
- **Google Chrome** running with remote debugging (for chrome-devtools MCP)
- A **Next.js** project with `app/globals.css`
- Node.js 18+

## Installation

```bash
npm install -g @isac/cli
```

## Usage

Inside a Next.js project, run:

```bash
isac capture <url>
```

### Options

| Flag | Description |
|---|---|
| `-d, --dir <path>` | Target directory (defaults to cwd) |
| `--skip-animations` | Skip animation detection phase |
| `--max-retries <n>` | Max verification retries (default: 3) |
| `--only-design-system` | Stop after building the design system |
| `--stop-after <phase>` | Stop after: `screenshots`, `design-system`, or `planning` |

## What it produces

| File | Description |
|---|---|
| `.claude/screenshots/` | Reference screenshots (light + dark) |
| `app/globals.css` | CSS custom properties (primitive + semantic tokens, dark mode) |
| `app/design-system/page.tsx` | Visual design system documentation |
| `app/design-system/layout.tsx` | Layout wrapper |
| `app/design-system/components/theme-toggle.tsx` | Theme toggle component |
| `app/components/theme-toggle.tsx` | Theme toggle for main page |
| `.claude/animations/catalog.json` | Animation catalog with Motion.dev mappings |
| `app/page.tsx` | The replicated page |
| `app/layout.tsx` | Updated layout with metadata and fonts |

## Pipeline phases

1. **Phase 0** — Screenshot capture (chrome-devtools)
2. **Phase 1a** — CSS token extraction
3. **Phase 1b** — Design system documentation
4. **Phase 1c** — Animation detection
5. **Phase 2** — Page structure planning
6. **Phase 3** — Implementation
7. **Phase 4** — Visual verification (with correction loop)

## Example output

See `examples/claude-on-mars/` for a complete capture example.

## Roadmap

- **Multipackage architecture** — Modular rendering engine based on `json-render`, enabling support for multiple frameworks beyond Next.js
- **Copy HEX on design system page** — Add a click-to-copy button for hex color codes on the generated design system page
- **Brand logo extraction** — Automatically detect and download the brand's logo from the target URL
- **CLI command evolution** — Evolve CLI commands (e.g. `brand-detector`, framework-specific generators) as the tool matures

## License

MIT — see [LICENSE](LICENSE).
