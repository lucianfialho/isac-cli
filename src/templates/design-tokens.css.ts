export const DESIGN_TOKENS_CSS_TEMPLATE = `/* ═══════════════════════════════════════════════════════════
   TEMPLATE: CSS Design Tokens
   Fill in with values extracted from screenshots.
   ═══════════════════════════════════════════════════════════ */

@import "tailwindcss";

:root {
  /* --- Primitive palette ---
     Absolute values. Never use directly in components.
     Feed the semantic tokens below. */
  --sf-white: #ffffff;
  --sf-black: #000000;
  /* --sf-gray-50: #...; */
  /* --sf-gray-100: #...; */
  /* --sf-gray-200: #...; */
  /* --sf-gray-300: #...; */
  /* --sf-gray-400: #...; */
  /* --sf-gray-500: #...; */
  /* --sf-gray-600: #...; */
  /* --sf-gray-700: #...; */
  /* --sf-gray-800: #...; */
  /* --sf-gray-900: #...; */
  /* --sf-gray-950: #...; */
  /* --sf-accent: oklch(...); */

  /* --- Semantic tokens (light = default) ---
     These are the tokens that components should consume. */

  /* Backgrounds */
  --color-bg-primary: var(--sf-white);
  --color-bg-secondary: var(--sf-gray-50);
  --color-bg-tertiary: var(--sf-gray-100);
  --color-bg-glass: rgba(255, 255, 255, 0.8);

  /* Text */
  --color-text-primary: var(--sf-gray-900);
  --color-text-secondary: var(--sf-gray-500);
  --color-text-tertiary: var(--sf-gray-400);
  --color-text-inverse: var(--sf-white);

  /* Borders */
  --color-border-primary: var(--sf-gray-200);
  --color-border-secondary: var(--sf-gray-300);
  --color-border-subtle: var(--sf-gray-100);

  /* Surfaces */
  --color-surface-elevated: var(--sf-white);
  --color-surface-sunken: var(--sf-gray-50);

  /* Accent */
  --color-accent: var(--sf-accent);

  /* --- Tailwind bridge --- */
  --background: var(--color-bg-primary);
  --foreground: var(--color-text-primary);
}

/* --- Dark theme (via data-theme attribute) --- */
[data-theme="dark"] {
  --color-bg-primary: var(--sf-gray-950);
  --color-bg-secondary: var(--sf-gray-900);
  --color-bg-tertiary: var(--sf-gray-800);
  --color-bg-glass: rgba(10, 10, 10, 0.8);

  --color-text-primary: var(--sf-gray-100);
  --color-text-secondary: var(--sf-gray-400);
  --color-text-tertiary: var(--sf-gray-600);
  --color-text-inverse: var(--sf-gray-950);

  --color-border-primary: var(--sf-gray-800);
  --color-border-secondary: var(--sf-gray-700);
  --color-border-subtle: var(--sf-gray-800);

  --color-surface-elevated: var(--sf-gray-900);
  --color-surface-sunken: var(--sf-gray-950);

  --background: var(--color-bg-primary);
  --foreground: var(--color-text-primary);
}

body {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: Arial, Helvetica, sans-serif;
}`;
