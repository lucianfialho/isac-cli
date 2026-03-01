---
name: replicate
description: Automated pipeline to replicate web pages. Captures screenshots from a URL, extracts design system, plans, implements, and visually verifies.
disable-model-invocation: true
argument-hint: <url> [--teams]
---

# ISAC Pipeline — Page Replication

You are an orchestrator that coordinates specialized subagents to replicate a web page from a URL.

For detailed process documentation, see [process.md](process.md).

## Input

`$ARGUMENTS` contains the full argument string. Parse as follows:

1. **URL** (first token): must start with `http`. If missing or invalid, respond with error:
   > Invalid URL. Usage: `/isac:replicate <url> [--teams]`
2. **Flag --teams**: check if `$ARGUMENTS` contains `--teams`

Parsing examples:
- `https://example.com` → url=https://example.com, teams=false
- `https://example.com --teams` → url=https://example.com, teams=true

## Prerequisites

Before starting, verify:
1. Next.js project is configured (package.json with next)
2. `app/globals.css` exists
3. If `--teams` was used, verify that `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` is set to `1`

---

## Pipeline (default mode — without --teams)

Execute phases **sequentially** via the Task tool. Each phase depends on the previous one.

### Phase 0: Screenshot Capture

Delegate to the **screenshot-capturer** subagent with the prompt:

> Capture full-page screenshots of the URL `<URL>`.
> Save to `.claude/screenshots/`.
> Capture in light and dark mode if available.
> Use 1440px viewport (desktop).

**Success criteria**: `.claude/screenshots/full-page.png` exists.

---

### Phase 1a: Token Extraction

Delegate to the **ds-extractor** subagent with the prompt:

> Analyze the screenshots in `.claude/screenshots/` and extract the complete design system.
> Create CSS custom properties in `app/globals.css` with light/dark tokens.
>
> Use the template at `skills/replicate/templates/design-tokens.css` as reference.
> Screenshots are in: `.claude/screenshots/`

**Success criteria**: `app/globals.css` contains semantic tokens with light and dark variants.

---

### Phase 1b: Design System Documentation

Delegate to the **ds-page-builder** subagent with the prompt:

> Build the design system visual documentation page.
> Read the tokens in `app/globals.css` and the screenshots in `.claude/screenshots/`.
> Use the template at `skills/replicate/templates/design-system-page.tsx` as scaffolding.
> Create:
> 1. `app/design-system/page.tsx` — complete documentation with all sections
> 2. `app/design-system/layout.tsx` — layout wrapper
> 3. `app/design-system/components/theme-toggle.tsx` — system/light/dark toggle
> 4. `app/components/theme-toggle.tsx` — copy for use on the main page
>
> Screenshots are in: `.claude/screenshots/`

**Success criteria**: `app/design-system/page.tsx` renders without errors, shows all sections (primitives, semantics, typography, radii, components).

---

### Phase 1c: Animation Detection

Delegate to the **animation-detector** subagent with the prompt:

> Detect all animations on the reference page at `<URL>`.
> The page should already be open in chrome-devtools from Phase 0.
> Run the detection script from `skills/replicate/templates/animation-detection.js` via `evaluate_script`.
> Parse the results, add Motion.dev equivalents, and write the catalog to `.claude/animations/catalog.json`.
>
> Screenshots are in: `.claude/screenshots/`

**Success criteria**: `.claude/animations/catalog.json` exists with animation type, trigger, and motionEquivalent for each detected animation.

---

### Phase 2: Planning

Delegate to the **page-planner** subagent with the prompt:

> Analyze the screenshots in `.claude/screenshots/` and the design system in `app/globals.css` and `app/design-system/page.tsx`.
> Also read the animation catalog at `.claude/animations/catalog.json` if it exists.
> Create a detailed plan covering:
> 1. Page section structure (hero, header, tables, CTAs, footer)
> 2. Real data extracted from screenshots (text, numbers, names)
> 3. Component hierarchy
> 4. Mapping of each visual element to CSS tokens
> 5. External links visible in screenshots
> 6. Animation specifications per section (from catalog, if available)
> 7. Components that need `"use client"` due to Motion.dev animations
>
> Return the complete plan as structured text.

**Success criteria**: plan identifies all sections visible in screenshots with concrete data.

---

### Phase 3: Implementation

Delegate to the **page-builder** subagent with the prompt:

> Implement the page in `app/page.tsx` following this plan:
> [INSERT PHASE 2 PLAN]
>
> Mandatory rules:
> - Use ONLY `var(--token)` for colors — NEVER hardcoded hex/rgb values
> - Support dark mode via `[data-theme="dark"]` (already configured in globals.css)
> - Reuse ThemeToggle from `app/components/theme-toggle.tsx` (copy from design-system if it doesn't exist)
> - Update metadata in `app/layout.tsx`
> - If `.claude/animations/catalog.json` exists, implement animations using the `motion` package (install with `npm install motion` if needed)
> - Run `npm run build` at the end to validate
>
> Design system is in: `app/globals.css`
> Animation catalog: `.claude/animations/catalog.json` (if available)
> Visual reference: screenshots in `.claude/screenshots/`

**Success criteria**: `npm run build` passes without errors.

---

### Phase 4: Visual Verification

Delegate to the **visual-verifier** subagent with the prompt:

> Verify the implementation by comparing with reference screenshots.
> 1. Start `npm run dev` if not already running
> 2. Navigate to http://localhost:3000
> 3. Capture full page screenshot in light mode
> 4. Capture screenshot in dark mode
> 5. Visually compare with screenshots in `.claude/screenshots/`
> 6. List differences found (layout, colors, typography, spacing, data)
>
> Report: APPROVED if faithful, or list of needed corrections.

**Success criteria**: page visually faithful to the reference screenshot in both modes.

---

## Pipeline (teams mode — with --teams)

> Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in env.

In this mode, the orchestrator (main session) acts as **team lead** using agent teams instead of sequential subagents.

### 1. Create agent team

Create a team with 6 specialized teammates, one for each phase:

| Teammate | Base agent | Responsibility |
|---|---|---|
| capturer | screenshot-capturer | Phase 0: Screenshot capture |
| extractor | ds-extractor | Phase 1a: CSS token extraction |
| ds-documenter | ds-page-builder | Phase 1b: Design system documentation |
| animator | animation-detector | Phase 1c: Animation detection |
| planner | page-planner | Phase 2: Planning |
| builder | page-builder | Phase 3: Implementation |
| verifier | visual-verifier | Phase 4: Visual verification |

### 2. Create tasks with dependencies

Use the shared task list to define dependencies:

```
Task 1: "Capture screenshots of <URL>" (no blockers)
Task 2: "Extract CSS tokens from screenshots" (blocked by 1)
Task 3: "Build design system documentation page" (blocked by 2)
Task 4: "Detect animations on reference page" (blocked by 1)
Task 5: "Plan page structure" (blocked by 2, 3, 4)
Task 6: "Implement page in page.tsx" (blocked by 5)
Task 7: "Verify visual fidelity" (blocked by 6)
```

### 3. Execution

- Teammates claim tasks as they become unblocked
- Each teammate uses the tools from their base agent
- The team lead monitors progress via the task list

### 4. Advantage: direct correction loop

In teams mode, when the verifier reports issues:
- The verifier communicates directly with the builder via task list
- Creates a new task: "Fix: [list of issues]" assigned to the builder
- Builder fixes and creates a re-verification task for the verifier
- No orchestrator overhead in between

---

## Correction Loop (both modes)

If Phase 4 reports issues:
1. Delegate corrections to **page-builder** with the list of issues
2. Re-execute Phase 4
3. Repeat until APPROVED (maximum 3 iterations)

## Final Result

Upon completion, summarize:
- Replicated URL
- Files created/modified
- Design system tokens
- Page sections implemented
- Visual verification status
- Mode used (subagents or teams)
