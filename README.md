# isac

> **saci ao contrario** — a reference to Brazilian folklore

Automated pipeline to replicate web pages using Claude Code skills, subagents, and MCP servers.

Built with Next.js, TypeScript, and Claude Code.

## What is this

isac is an experiment in automated web page replication. Given a URL, it runs a 5-phase pipeline that captures screenshots, extracts a design system, plans the structure, implements the code, and verifies the result visually — all orchestrated by specialized Claude Code subagents.

The core idea: **never hardcode visual values**. Everything flows through a design system with CSS custom properties, making the output maintainable and dark-mode-ready by default.

```
URL ──── Phase 0 ──► Screenshots (.claude/screenshots/)
                         │
Screenshots ─── Phase 1 ──► Design System (CSS tokens)
    │                           │
    │                           ▼
    └───────── Phase 2 ──► Plan (structure + data)
                                │
                                ▼
                   Phase 3 ──► Implementation (page.tsx)
                                │
                                ▼
                   Phase 4 ──► Visual Verification
                                │
                            ┌───┴───┐
                            │       │
                         APPROVED  FIX ──► back to Phase 3
```

## Demo

The slopforks.com home page was replicated as a real-world proof of concept.

- `/` — replicated home page (hero, leaderboard table, CTA banner)
- `/design-system` — extracted design tokens with live preview

## Project structure

```
.
├── app/
│   ├── page.tsx                          # Replicated page
│   ├── layout.tsx                        # Root layout (fonts, metadata)
│   ├── globals.css                       # Design tokens (light + dark)
│   ├── components/
│   │   └── theme-toggle.tsx              # Light/dark/system toggle
│   └── design-system/
│       ├── page.tsx                      # Token documentation page
│       ├── layout.tsx                    # Design system layout
│       └── components/
│           └── theme-toggle.tsx          # Toggle for DS page
├── .claude/
│   ├── agents/
│   │   ├── screenshot-capturer.md       # Phase 0: screenshot capture
│   │   ├── ds-extractor.md              # Phase 1: design system extraction
│   │   ├── page-planner.md              # Phase 2: structure planning
│   │   ├── page-builder.md              # Phase 3: implementation
│   │   └── visual-verifier.md           # Phase 4: visual QA
│   ├── skills/
│   │   └── isac/
│   │       ├── SKILL.md                 # Skill definition (orchestrator)
│   │       ├── process.md               # Detailed process documentation
│   │       └── templates/
│   │           └── design-tokens.css    # CSS token template
│   └── screenshots/                     # Reference + verification screenshots
├── .mcp.json                            # MCP server configuration
└── package.json
```

## Skill: /isac

Invoke the pipeline with:

```
/isac replicate https://example.com
```

The first argument is the subcommand (`replicate`), followed by the target URL.

### The 5 phases

| Phase | Agent | What it does |
|---|---|---|
| 0. Capture | screenshot-capturer | Navigates to URL, captures full-page screenshots in light and dark mode |
| 1. Design System | ds-extractor | Analyzes screenshots, extracts primitive + semantic CSS tokens with light/dark variants |
| 2. Planning | page-planner | Maps every section, extracts real data from screenshots, assigns tokens to elements |
| 3. Implementation | page-builder | Builds `page.tsx` using only `var(--token)` for colors, runs `npm run build` to validate |
| 4. Verification | visual-verifier | Captures screenshots of the implementation via Chrome DevTools, compares with reference |

If Phase 4 reports issues, corrections are sent back to the page-builder and verification runs again (up to 3 iterations).

### --teams flag

Use the `--teams` flag to run with agent teams instead of sequential subagents:

```
/isac replicate https://example.com --teams
```

In teams mode:
- The orchestrator acts as a team lead
- 5 specialized teammates are spawned (one per phase)
- Tasks are created with dependencies in a shared task list
- The verifier communicates directly with the builder for corrections (no orchestrator overhead)

Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in the environment (already configured in `.claude/settings.local.json`).

## Subagents

| Agent | Model | MCP Servers | Role |
|---|---|---|---|
| screenshot-capturer | haiku | chrome-devtools | Navigates to URL, captures full-page screenshots in light and dark mode at 1440px viewport |
| ds-extractor | opus | chrome-devtools | Extracts color palette, typography, spacing, and component patterns from screenshots into CSS custom properties |
| page-planner | opus | chrome-devtools, vercel | Analyzes screenshots + design system to produce a detailed implementation plan with section structure, real data, and token mapping |
| page-builder | opus | shadcn, hugeicons, reactbits | Implements the page following the plan, using only design tokens for colors. Validates with `npm run build` |
| visual-verifier | sonnet | chrome-devtools | Captures full-page screenshots in light and dark mode, compares with reference, reports differences or approves |

## MCP servers

| Server | Type | Purpose |
|---|---|---|
| chrome-devtools | stdio (npx) | Screenshot capture, page navigation, visual inspection |
| reactbits | stdio (npx) | Access to ReactBits component library |
| shadcn | HTTP | Access to shadcn/ui component registry |
| vercel | HTTP | Vercel platform integration |
| hugeicons | stdio (npx) | Icon library for UI elements |

Configured in `.mcp.json` at the project root.

## Design system

The design system uses a two-tier token architecture:

### Primitive tokens

Absolute values that define the raw palette. Never used directly in components.

```css
--sf-white: #ffffff;
--sf-gray-100: #f5f5f5;
--sf-gray-900: #171717;
--sf-amber: oklch(0.769 0.188 70.08);
```

### Semantic tokens

Reference primitives via `var()`. These are what components consume.

```css
--color-bg-primary: var(--sf-white);
--color-text-primary: var(--sf-gray-900);
--color-border-primary: var(--sf-gray-200);
--color-accent: var(--sf-amber);
```

### Dark mode

Toggled via `data-theme="dark"` on `<html>`. Semantic tokens are remapped to different primitives:

```css
[data-theme="dark"] {
  --color-bg-primary: var(--sf-gray-950);
  --color-text-primary: var(--sf-gray-100);
}
```

### Fonts

| Role | Stack |
|---|---|
| Display/headings | Source Serif 4, Georgia, serif |
| Body | system-ui, sans-serif |
| Code/badges | ui-monospace, SFMono-Regular, Menlo, monospace |

## How to use

### Prerequisites

- Node.js 18+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI installed
- MCP servers configured (already in `.mcp.json`)

### Run the existing replica

```bash
npm install
npm run dev
# open http://localhost:3000
```

### Replicate a different page

Run the skill with the target URL:

```
/isac replicate https://example.com
```

The pipeline will:
- Capture screenshots of the target URL (Phase 0)
- Extract a design system from the screenshots
- Plan the page structure
- Implement the page
- Verify the result visually

For complex pages, use teams mode for direct builder-verifier communication:

```
/isac replicate https://example.com --teams
```

## Tech stack

| Technology | Version |
|---|---|
| Next.js | 16.1.6 |
| React | 19.2.3 |
| Tailwind CSS | 4.x |
| TypeScript | 5.x |
