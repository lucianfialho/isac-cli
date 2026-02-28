export const DESIGN_SYSTEM_PAGE_TEMPLATE = `import type { Metadata } from "next";
import { ThemeToggle } from "./components/theme-toggle";

export const metadata: Metadata = {
  title: "Design System — /* FILL IN: site name */",
  description:
    "Design system tokens and components extracted from /* FILL IN: domain */",
};

/* ───────── static tokens (non-color) ───────── */
const fonts = {
  serif: /* FILL IN: serif font stack */ '"Georgia", serif',
  sans: /* FILL IN: sans font stack */ 'ui-sans-serif, system-ui, sans-serif',
  mono: /* FILL IN: mono font stack */ 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};
const fontSizes = {
  /* FILL IN: size scale extracted from screenshots */
  xs: "12px",
  sm: "13px",
  base: "14px",
  md: "16px",
  display: "72px",
};
const fontWeights = {
  /* FILL IN: weights used on the site */
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};
const radii = {
  /* FILL IN: extracted border-radius values */
  sm: "6px",
  md: "8px",
  pill: "9999px",
};

/* ───────── primitive palette ───────── */
/* FILL IN: Add all primitive colors extracted from screenshots. */
const primitives: { name: string; var: string; light: string; dark: string }[] = [
  { name: "white", var: "--sf-white", light: "#ffffff", dark: "#ffffff" },
  { name: "black", var: "--sf-black", light: "#000000", dark: "#000000" },
  /* FILL IN: gray scale (50-950), accent colors, etc. */
];

/* ───────── semantic tokens ───────── */
/* FILL IN: Group semantic tokens by category. */
const semanticTokens: {
  category: string;
  tokens: { name: string; var: string; lightRef: string; darkRef: string }[];
}[] = [
  {
    category: "Background",
    tokens: [
      { name: "bg-primary", var: "--color-bg-primary", lightRef: "white", darkRef: "/* FILL IN */" },
    ],
  },
];

/* ───────── helpers ───────── */
function resolveHex(ref: string): string {
  const found = primitives.find((p) => p.name === ref);
  return found ? found.light : ref;
}
function resolveHexDark(ref: string): string {
  const found = primitives.find((p) => p.name === ref);
  return found ? found.dark : ref;
}

/* ───────── page ───────── */
export default function DesignSystemPage() {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
      <header><h1>Design System</h1><ThemeToggle /></header>
      {/* ... sections ... */}
    </div>
  );
}`;
