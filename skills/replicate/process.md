# ISAC Process — Page Replication

Detailed documentation of the visual replication pipeline used in this project.

## Overview

The process replicates web pages from a URL, using a 6-phase pipeline
with specialized subagents. The key is **never hardcoding visual values** — everything
goes through an intermediary design system with CSS custom properties.

## Why this process works

1. **Automatic capture**: no need to take screenshots manually — Phase 0 handles it
2. **Design System as contract**: CSS tokens are the interface between design and code
3. **Free dark mode**: semantic tokens with light/dark variants
4. **Consistency**: components consume tokens, not magic values
5. **Maintainability**: changing a color in a token updates the entire page
6. **Separation of concerns**: token extraction and visual documentation are independent phases

## Flow

```
URL ──── Phase 0 ──► Screenshots (.claude/screenshots/)
                         │
                    ┌────┴──────────────────┐
                    │                        │
Screenshots ─── Phase 1a ──► CSS Tokens    Phase 1c ──► Animation Catalog
    │               │    (globals.css)      (.claude/animations/catalog.json)
    │               ▼                        │
    └───── Phase 1b ──► DS Documentation     │
    │          (design-system/page.tsx)       │
    │               │                        │
    │               ▼                        │
    └───────── Phase 2 ──► Plan (structure + data + animations)
                                │
                                ▼
                   Phase 3 ──► Implementation (page.tsx + motion)
                                │
                                ▼
                   Phase 4 ──► Visual Verification
                                │
                            ┌───┴───┐
                            │       │
                         APPROVED  FIX ──► back to Phase 3
```

## Phase 0: Screenshot Capture

### Process

1. Navigate to the provided URL via chrome-devtools MCP
2. Wait for complete load (networkIdle)
3. Resize viewport to 1440px (desktop standard)
4. Capture full-page screenshot in light mode
5. Try emulating dark mode (`prefers-color-scheme: dark`) and capture
6. For long pages, capture individual sections

### Output

```
.claude/screenshots/
  full-page.png          # Light mode
  full-page-dark.png     # Dark mode (if available)
  section-*.png          # Individual sections (optional)
```

## Phase 1a: Token Extraction

### What to extract from screenshots

1. **Primitive color palette**
   - Backgrounds (primary, secondary, tertiary)
   - Text (primary, secondary, tertiary)
   - Borders (primary, secondary, subtle)
   - Accents (highlights, links, icons)

2. **Typography**
   - Font families (serif for headings, sans for body, mono for code)
   - Font sizes (display, headings, body, small, xs)
   - Font weights (regular, medium, semibold, bold)

3. **Spacing and radii**
   - Border radius (small, medium, pill)
   - Padding patterns

4. **Components**
   - Buttons (style, padding, border)
   - Badges (pills, tags)
   - Cards/surfaces
   - Tables
   - Headers

### Token structure

```css
:root {
  /* Primitives — never used directly in components */
  --sf-white: #ffffff;
  --sf-gray-100: #f5f5f5;
  /* ... */

  /* Semantics — used in components */
  --color-bg-primary: var(--sf-white);
  --color-text-primary: var(--sf-gray-900);
  /* ... */
}

[data-theme="dark"] {
  --color-bg-primary: var(--sf-gray-950);
  --color-text-primary: var(--sf-gray-100);
  /* ... */
}
```

### Expected result
- `app/globals.css` with primitive + semantic + dark mode tokens

## Phase 1b: Design System Documentation

### What the page must contain

The `app/design-system/page.tsx` page is an interactive visual documentation of all extracted tokens and components. It serves as a reference for Phase 3 (implementation) and as visual validation of the tokens.

### Expected structure (required sections)

1. **Header** — "Design System" title + ThemeToggle for switching themes
2. **Primitive Palette** — grid of colored swatches with name and CSS variable for each primitive
3. **Semantic Tokens** — table with 5 columns (Token / Light swatch / Light ref / Dark swatch / Dark ref), grouped by category (Background, Text, Border, Surface, Accent)
4. **Typography** — font families with preview, font sizes with "Aa" preview, font weights with "The quick brown fox" preview, type scale in context
5. **Border Radius** — squares with different radii and displayed values
6. **Components** — visual preview of each site component:
   - Sticky Header (glass-morphism with blur)
   - Buttons (primary + small)
   - Links (inline + project with arrow)
   - Language Badge (pills with border)
   - Fork Badge (with SVG icon)
   - Star Count (with accent color star)
7. **Leaderboard Table** — table with real data extracted from screenshots
8. **CTA Banner** — card with persuasive text + action button
9. **Hero / Definition Block** — 72px serif title, phonetics, numbered definitions (if applicable)

### Relationship with the template

The `ds-page-builder` agent uses the template at `skills/replicate/templates/design-system-page.tsx` as scaffolding. The template contains the complete JSX structure with `/* FILL IN */` comments indicating where to insert real data. The agent must:

1. Read the template to understand the structure
2. Read `app/globals.css` to get the tokens
3. Read screenshots to extract sample data
4. Generate the final page replacing all placeholders

### Generated files

| File | Description |
|---|---|
| `app/design-system/page.tsx` | Complete visual documentation |
| `app/design-system/layout.tsx` | Layout wrapper (bg + color + min-height) |
| `app/design-system/components/theme-toggle.tsx` | system/light/dark toggle with localStorage |
| `app/components/theme-toggle.tsx` | Copy for use on the main page |

### Approval criteria

- `npm run build` passes without errors
- Page contains ALL 9 sections listed above
- `primitives` and `semanticTokens` arrays match 1:1 with globals.css
- Table data is real (extracted from screenshots), not lorem ipsum
- ThemeToggle works (cycles system → light → dark)
- Colors use exclusively `var()`, no hardcoded hex/rgb in components

## Phase 1c: Animation Detection

### Purpose

Detect all animations on the reference page and produce a structured catalog that Phase 3 can use to reproduce them with the `motion` package.

### What to detect

1. **CSS Animations**: elements with `animationName` via `getComputedStyle()`
2. **CSS Transitions**: elements with non-default `transition` property (hover effects, state changes)
3. **Web Animations API**: active animations via `document.getAnimations()`
4. **Scroll-triggered**: elements with scroll-reveal classes (`data-aos`, `data-scroll`, GSAP markers, IntersectionObserver patterns)
5. **@keyframes**: all keyframe rules from accessible stylesheets
6. **Animation libraries**: GSAP, Anime.js, Framer Motion, Motion, AOS, Lottie, ScrollReveal

### Detection methodology

The `animation-detector` agent uses chrome-devtools `evaluate_script` to run a detection script (`skills/replicate/templates/animation-detection.js`) in the page context. The script:

1. Iterates all DOM elements checking computed styles for animations and transitions
2. Calls `document.getAnimations()` for Web Animations API usage
3. Checks for scroll-library-specific attributes and classes
4. Extracts `@keyframes` rules from all accessible stylesheets
5. Checks `window` globals and `<script>` tags for known animation libraries

### Catalog format

Output: `.claude/animations/catalog.json`

```json
{
  "url": "https://example.com",
  "detectedLibraries": [{ "name": "gsap", "version": "3.12" }],
  "keyframes": { "fadeIn": [{ "keyText": "from", "style": "opacity: 0" }] },
  "animations": [
    {
      "id": "css-animation-1",
      "selector": ".hero h1",
      "type": "css-animation",
      "trigger": "page-load",
      "properties": { "opacity": [0, 1], "transform": ["translateY(20px)", "translateY(0)"] },
      "duration": 800,
      "delay": 200,
      "easing": "cubic-bezier(0.4, 0, 0.2, 1)",
      "motionEquivalent": "animate('.hero h1', { opacity: [0,1], y: [20,0] }, { duration: 0.8, delay: 0.2 })"
    }
  ],
  "summary": {
    "total": 12,
    "byType": { "css-animation": 3, "css-transition": 5, "scroll-triggered": 4 },
    "byTrigger": { "page-load": 3, "hover": 5, "in-view": 4 },
    "complexity": "intermediate"
  }
}
```

### Motion.dev mapping rules

| Animation type | Trigger | Motion.dev equivalent |
|---|---|---|
| CSS animation (entrance) | page-load | `animate(selector, keyframes, options)` |
| CSS animation (infinite) | page-load | `animate(selector, keyframes, { repeat: Infinity })` |
| CSS transition (hover) | hover | Keep as CSS `transition` property |
| CSS transition (state) | interaction | `animate(selector, newState, options)` |
| Scroll reveal | in-view | `inView(selector, ({ target }) => animate(target, ...))` |
| Scroll parallax | scroll | `scroll(animate(selector, keyframes), { target })` |
| Staggered entrance | page-load | `animate(selector, keyframes, { delay: stagger(0.1) })` |
| Complex sequence | page-load | `timeline([...])` from `motion` |

### Approval criteria

- `.claude/animations/catalog.json` exists and is valid JSON
- All visible CSS animations detected
- All interactive transitions detected
- Each animation has type, trigger, and `motionEquivalent`
- Summary counts are accurate

## Phase 2: Planning

### What to analyze

1. **Page sections**: hero, header, content, tables, CTAs, footer
2. **Real data**: extract text, numbers, names from screenshots
3. **Hierarchy**: which component contains which
4. **Links**: visible external URLs
5. **Behaviors**: sticky headers, scroll effects
6. **Animations**: read `.claude/animations/catalog.json` and map animations to sections

### Plan format

```markdown
## Structure
1. Sticky Header — glass-morphism, logo + button + toggle
2. Hero — 72px serif title, definitions, credits
3. Leaderboard — table with N rows
4. CTA Banner — call-to-action + button

## Data
| # | Name | Description | ... |

## Tokens per section
- Header: bg-glass, border-subtle, surface-elevated
- Hero: text-primary (title), text-secondary (subtitle)
```

## Phase 3: Implementation

### Golden rules

1. **Colors**: `var(--color-token)` — NEVER `#hex` or `rgb()`
2. **Fonts**: define stacks as JS constants, use var() for custom fonts
3. **Client components**: only where necessary (ThemeToggle, animated sections). Page can be a server component
4. **Inline styles**: follow design-system pattern for consistency with tokens
5. **Animations**: use `motion` package (`npm install motion`) for detected animations
6. **Build**: `npm run build` must pass

### Animation implementation

When `.claude/animations/catalog.json` exists:

1. Install `motion`: `npm install motion`
2. Import: `import { animate, stagger, inView, scroll, timeline } from 'motion'`
3. Simple hover transitions → CSS `transition` property (no JS)
4. Entrance animations → `animate()` in `useEffect`
5. Scroll-triggered → `inView()` from `motion`
6. Scroll-linked → `scroll(animate(...))` from `motion`
7. Components using `motion` JS APIs must have `"use client"`
8. Extract animated sections into separate client components

### Checklist

- [ ] All plan sections implemented
- [ ] All real data inserted
- [ ] Dark mode functional
- [ ] ThemeToggle integrated
- [ ] Basic responsive layout (overflow-x on tables)
- [ ] Animations implemented per catalog (if available)
- [ ] Animated components have `"use client"` directive
- [ ] `motion` in package.json (if animations exist)
- [ ] Build without errors

## Phase 4: Visual Verification

### Process

1. Dev server running
2. Screenshot in light mode (full page)
3. Screenshot in dark mode (full page)
4. Comparison with reference:
   - Layout and proportions
   - Colors and contrast
   - Typography and weights
   - Spacing
   - Correct data

### Approval criteria

- Faithful structure (same sections, same order)
- Compatible colors (correct tokens, functional dark mode)
- Correct typography (serif/sans/mono in the right places)
- Correct data (text, numbers, names)

## Subagents

| Subagent | Function | Model | Tools |
|---|---|---|---|
| screenshot-capturer | Captures screenshots from URL | haiku | MCP chrome-devtools |
| ds-extractor | Extracts CSS tokens from screenshots | opus | Read, Write, Edit, Glob |
| ds-page-builder | Builds DS visual documentation | opus | Read, Write, Edit, Glob, Bash |
| animation-detector | Detects and catalogs animations | sonnet | MCP chrome-devtools |
| page-planner | Plans page structure | opus | Read, Glob, Grep |
| page-builder | Implements the code | opus | Read, Write, Edit, Glob, Grep, Bash, MCP motion-dev |
| visual-verifier | Compares screenshots | sonnet | Read, Glob, Bash, MCP chrome-devtools |

## Agent Teams Mode (--teams)

When invoked with `--teams`, the pipeline uses agent teams instead of sequential subagents.

### Key difference

| Aspect | Subagents (default) | Agent Teams (--teams) |
|---|---|---|
| Orchestration | Main session delegates sequentially | Team lead creates tasks with dependencies |
| Communication | Via orchestrator (hub-and-spoke) | Direct between teammates (shared task list) |
| Correction loop | Orchestrator mediates builder↔verifier | Verifier creates task directly for builder |
| Overhead | Higher (context passes through orchestrator) | Lower (peer-to-peer communication) |

### When to use --teams

- Complex pages with many sections
- When the correction loop is expected (detailed pages)
- To leverage direct builder↔verifier communication

### Requirements

- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` must be set in env
- Configurable in `settings.json` (plugin default) or `.claude/settings.local.json` (user override)

## Real Example: slopforks.com

This process was used to replicate the slopforks.com homepage in this repository.

### Result
- **Design System**: 14 primitive colors, 14 semantic tokens, 3 font stacks, 3 radii
- **Components**: ThemeToggle, sticky header, language badges, star counts, fork badges
- **Page**: hero with definition, leaderboard with 11 projects, CTA banner
- **Dark mode**: functional via `[data-theme="dark"]`
- **Build**: passes without errors
