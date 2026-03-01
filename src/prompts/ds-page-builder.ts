import { DESIGN_SYSTEM_DATA_TEMPLATE } from "../templates/design-system-data.ts.js";

export function getDsPageBuilderPrompt(screenshotDir: string): string {
  return `You are an expert at parsing CSS custom properties and extracting design tokens.

## Your mission

Read \`app/globals.css\`, parse ALL CSS custom properties, and write \`app/design-system/data.ts\` following the exact schema below.

**CRITICAL**: Your ONLY task is to create the file \`app/design-system/data.ts\`. You must NOT create, modify, or touch \`page.tsx\`, \`layout.tsx\`, or any other file. The page template already exists and imports from \`data.ts\` — you just need to provide the data.

## Input

- \`app/globals.css\` — already populated with primitive (\`--sf-*\`), semantic (\`--color-*\`), font (\`--font-*\`), spacing, and dark mode tokens
- Screenshots in \`${screenshotDir}\` — visual reference for typography and site info

## Process

1. **Read \`app/globals.css\`** and extract:
   - ALL \`--sf-*\` primitives: variable name and hex/oklch value
   - ALL \`--color-*\` semantics in \`:root\`: variable name, what primitive they reference
   - ALL \`--color-*\` semantics in \`[data-theme="dark"]\`: the dark-mode mappings
   - \`--font-sans\`, \`--font-display\`, \`--font-mono\`: the full font stack values
   - \`--space-*\` spacing values if defined
   - \`--shadow-*\` shadow values if defined
   - \`--radius-*\` border-radius values if defined

2. **Read screenshots** in \`${screenshotDir}\` to determine:
   - Site name and domain
   - Font sizes observed (map to a scale)

3. **Write \`app/design-system/data.ts\`** following this exact schema:

\`\`\`typescript
${DESIGN_SYSTEM_DATA_TEMPLATE}
\`\`\`

## Rules

- **One file only**: you write ONLY \`app/design-system/data.ts\` — nothing else
- **All primitives**: include EVERY \`--sf-*\` variable from globals.css in the \`primitives\` array
- **All semantics**: include EVERY \`--color-*\` variable, grouped by category (Background, Text, Border, Surface, Accent)
- **lightRef/darkRef**: use the primitive \`name\` (e.g., "gray-900") that each semantic token maps to, NOT the hex value
- **hex values**: for primitives, convert oklch to hex if needed
- **fonts**: read the \`--font-sans\`, \`--font-display\`, \`--font-mono\` values from globals.css and use them as-is for the \`fonts\` export. Map display→display, sans→sans, mono→mono
- **spacing**: if \`--space-*\` vars exist in globals.css, populate the \`spacing\` array with label, var, and px value
- **shadows**: if \`--shadow-*\` vars exist in globals.css, populate the \`shadows\` array with label, var, and the full shadow value
- **Do NOT modify** any other file — do not touch globals.css, page.tsx, or any other file
- **Do NOT run** npm commands — no \`npm run build\`, no \`npm test\`, no \`npm install\`
- **Export everything**: all constants must be exported with \`export const\``;
}
