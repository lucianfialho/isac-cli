# @guataiba/isac-cli

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
