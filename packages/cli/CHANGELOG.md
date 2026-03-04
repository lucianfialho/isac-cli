# @guataiba/isac-cli

## 2.2.1

### Patch Changes

- Updated dependencies [ee14526]
  - @guataiba/isac-core@2.2.1
  - @guataiba/isac-nextjs@2.2.1

## 2.2.0

### Minor Changes

- b60997f: Replace Playwright with agent-browser for fully deterministic Phase 0 pipeline (zero Claude API cost). Add section catalog, page renderers, and pixel-diff for visual verification. Fix theme toggle and hydration issues via finalizeProject() adapter hook.

### Patch Changes

- Updated dependencies [b60997f]
  - @guataiba/isac-core@2.2.0
  - @guataiba/isac-nextjs@2.2.0

## 2.1.0

### Minor Changes

- Replace Claude CLI with pure TypeScript css-generator in Phase 1A

  Phase 1A token extraction no longer spawns Claude CLI. A deterministic `generateGlobalsCss()` function reads the Phase 0 JSON artifacts and generates `globals.css` directly, reducing execution time from ~3 min to <1s with zero LLM cost.

### Patch Changes

- Updated dependencies
  - @guataiba/isac-core@2.1.0
  - @guataiba/isac-nextjs@2.1.0

## 2.0.1

### Patch Changes

- f999471: Read CLI version from package.json instead of hardcoding
  - @guataiba/isac-core@2.0.1
  - @guataiba/isac-nextjs@2.0.1

## 2.0.0

### Major Changes

- 12468e6: Initial public release of ISAC — Intelligent Site Analysis & Cloning CLI.

  - 7 specialized agents (screenshot-capturer, ds-extractor, ds-page-builder, animation-detector, page-planner, page-builder, visual-verifier)
  - `isac capture <url>` command with full pipeline
  - Chrome DevTools MCP integration for screenshot capture
  - Design token extraction with light/dark mode
  - Design system documentation page generation
  - Animation detection and Motion.dev mapping
  - Page structure planning and implementation
  - Visual verification with correction loop
  - Multipackage architecture: `@guataiba/isac-core`, `@guataiba/isac-nextjs`, `@guataiba/isac-cli`

### Patch Changes

- Updated dependencies [12468e6]
  - @guataiba/isac-core@2.0.0
  - @guataiba/isac-nextjs@2.0.0
