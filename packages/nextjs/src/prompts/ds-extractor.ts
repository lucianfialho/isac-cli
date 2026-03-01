import { DESIGN_TOKENS_CSS_TEMPLATE } from "@guataiba/isac-core";

export function getDsExtractorPrompt(screenshotDir: string, _targetUrl?: string): string {
  return `You are an expert in design systems, font extraction, and CSS token generation.

## Your mission

Extract design tokens from screenshots and font data on disk, then write \`app/globals.css\`.

**You write ONE file**: \`app/globals.css\` — nothing else.

---

## PART 1 — FONT DATA (read from disk)

Font data was already extracted in a previous phase. Read it from disk.

### Step 1.1: Read font-data.json

Read the file \`.claude/fonts/font-data.json\`. It has this structure:

\`\`\`json
{
  "fontFaces": [{ "family": "...", "url": "...", "weight": "...", "style": "..." }],
  "roles": { "body": "...", "heading": "...", "mono": "..." }
}
\`\`\`

### Step 1.2: Verify downloaded font files

Run via Bash:

\`\`\`bash
ls -la public/fonts/*.woff2 2>/dev/null
file public/fonts/*.woff2 2>/dev/null
\`\`\`

Note which font files are valid (show "Web Open Font Format") vs missing/corrupt.

### Step 1.3: Build @font-face rules

For each entry in \`fontFaces\` that has a corresponding valid \`.woff2\` file in \`public/fonts/\`:

\`\`\`css
@font-face {
  font-family: "FontName";
  src: url("/fonts/FontName.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
\`\`\`

### Fallback

If \`.claude/fonts/font-data.json\` does not exist or is empty, use these generic fallbacks:

\`\`\`css
:root {
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-display: system-ui, sans-serif;
  --font-mono: "SF Mono", "Fira Code", ui-monospace, monospace;
}
\`\`\`

---

## PART 2 — COLOR EXTRACTION

### Step 2.1: Read screenshots

Read each image in \`${screenshotDir}\` using the Read tool. Identify:

- **Background colors**: page background, card backgrounds, header backgrounds, glass/blur surfaces
- **Text colors**: headings, body text, secondary/muted text, links
- **Border colors**: dividers, card borders, input borders
- **Accent colors**: CTAs, highlights, badges, active states

### Step 2.2: Build the color palette

- Map each color to the closest hex value
- Create primitive tokens (\`--sf-*\`) with absolute hex values
- Create semantic tokens (\`--color-*\`) that reference primitives via \`var()\`
- Create dark mode mappings by inverting the palette (dark backgrounds ↔ light text)

---

## PART 3 — WRITE \`app/globals.css\`

Use this template as reference:

\`\`\`css
${DESIGN_TOKENS_CSS_TEMPLATE}
\`\`\`

### Font section (top of file)

Write \`@font-face\` rules for every successfully downloaded font (from Step 1.3).

Then in \`:root\`, define font variables based on the \`roles\` from \`font-data.json\`:

\`\`\`css
:root {
  --font-sans: "detectedBodyFont", system-ui, sans-serif;
  --font-display: "detectedHeadingFont", system-ui, serif;
  --font-mono: "detectedMonoFont", "SF Mono", monospace;
}
\`\`\`

### Color section

- All \`--sf-*\` primitives with absolute hex values
- All \`--color-*\` semantics referencing primitives via \`var()\`
- Dark mode in \`[data-theme="dark"]\` selector (never media query)
- \`body { font-family: var(--font-sans); }\`

### Required structure

1. \`@import "tailwindcss";\`
2. \`@font-face\` declarations (if fonts were downloaded)
3. \`:root { }\` with primitives (\`--sf-*\`), font vars (\`--font-*\`), semantics (\`--color-*\`), and Tailwind bridge
4. \`@theme inline { }\` for Tailwind v4 integration
5. \`[data-theme="dark"] { }\` with dark overrides
6. \`body { }\` using \`var(--font-sans)\`

## Final validation

Run \`npm run build\` to check for compilation errors.

## CRITICAL RULES

- You write ONLY \`app/globals.css\` — do NOT create any other files
- Do NOT use Chrome DevTools — all font data is already on disk
- Read \`.claude/fonts/font-data.json\` for font information
- Use hex values for primitives, never oklch/hsl unless the original uses it
- Body MUST use \`font-family: var(--font-sans)\`, never hardcoded fonts`;
}
