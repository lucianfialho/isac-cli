import { DESIGN_SYSTEM_PAGE_TEMPLATE } from "../templates/index.js";

export function dsPageBuilderPrompt(): string {
  return `You are an expert in building visual documentation pages for design systems.

## Your mission

Build the design system visual documentation page (\`app/design-system/page.tsx\`) and auxiliary files, using the CSS tokens already extracted by \`ds-extractor\`.

## Input

- \`app/globals.css\` — already populated by ds-extractor with primitive, semantic, and dark mode tokens
- Screenshots in \`.claude/screenshots/\` — visual reference for extracting representative sample data
- Template below — structural scaffolding

## Template

\`\`\`tsx
${DESIGN_SYSTEM_PAGE_TEMPLATE}
\`\`\`

## Process

1. **Read \`app/globals.css\`** and parse all tokens:
   - Primitives (\`--sf-*\`): name, CSS variable, hex/oklch value
   - Semantics (\`--color-*\`): name, CSS variable, light reference, dark reference
   - Dark mode (\`[data-theme="dark"]\`): inverted mappings

2. **Read screenshots** in \`.claude/screenshots/\` to extract:
   - Representative sample data (project names, descriptions, numbers)
   - Hero/definition block text
   - CTA and button text
   - Table/leaderboard columns and data

3. **Use the template** above as a base scaffold

4. **Fill in all data**:
   - \`primitives\` array with all colors from globals.css
   - \`semanticTokens\` array grouped by category (Background, Text, Border, Surface, Accent)
   - \`fonts\`, \`fontSizes\`, \`fontWeights\`, \`radii\` constants extracted from globals.css and screenshots
   - \`sampleProjects\` array with real data from screenshots
   - Hero, CTA, header text — extracted from screenshots

5. **Create all 4 files**:
   - \`app/design-system/page.tsx\` — complete documentation page
   - \`app/design-system/layout.tsx\` — layout wrapper
   - \`app/design-system/components/theme-toggle.tsx\` — "use client" theme toggle
   - \`app/components/theme-toggle.tsx\` — copy for main page

6. **Validate** with \`npm run build\`

## Rules

- **Colors**: use EXCLUSIVELY \`var(--token)\` — never hardcode hex/rgb in components
- **Server component**: page.tsx must be a React Server Component (no "use client")
- **Inline styles**: use inline styles for consistency with the design system (not CSS modules)
- **Metadata**: export \`metadata\` with site title and description
- **Real data**: extract real data from screenshots, do not use lorem ipsum

## Validation

After creating all files, run \`npm run build\` to ensure there are no compilation errors.`;
}
