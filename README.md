# ISAC — Automated Page Replication Plugin for Claude Code

ISAC captures screenshots from a URL, extracts the design system, detects animations, plans the page structure, implements a pixel-perfect Next.js replica, and visually verifies the result.

## Prerequisites

- **Claude Code** 1.0.33+
- **Google Chrome** running with remote debugging (for chrome-devtools MCP)
- A **Next.js** project with `app/globals.css`
- Node.js 18+

## Installation

```bash
claude plugin install lucianfialho/isac
```

## Usage

Inside a Next.js project, run:

```
/isac:replicate <url>
```

With agent teams (parallel execution, direct builder-verifier communication):

```
/isac:replicate <url> --teams
```

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

See `examples/claude-on-mars/` for a complete replication example.

## License

Commercial — see [LICENSE](LICENSE).
