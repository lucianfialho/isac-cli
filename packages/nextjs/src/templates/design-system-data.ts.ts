export const DESIGN_SYSTEM_DATA_TEMPLATE = `// ─── Site Info ──────────────────────────────────────────────────
export const siteInfo = {
  name: "Example Site",
  domain: "example.com",
  tagline: "",
  description: "",
};

// ─── Branding ───────────────────────────────────────────────────
export const branding = {
  logoUrl: "",
  faviconUrl: "",
  ogImageUrl: "",
  aboutText: "",
};

// ─── Typography ─────────────────────────────────────────────────
// Font stacks as defined in globals.css --font-* variables.
// Use the ACTUAL font family names extracted from the site's @font-face rules.
export const fonts = {
  display: '"SiteSerif", system-ui, serif',
  sans: '"SiteSans", system-ui, sans-serif',
  mono: '"SiteMono", "SF Mono", monospace',
};

export const fontSizes: { label: string; size: string; sample: string }[] = [
  { label: "xs", size: "12px", sample: "Extra Small" },
  { label: "sm", size: "14px", sample: "Small" },
  { label: "base", size: "16px", sample: "Base" },
  { label: "lg", size: "18px", sample: "Large" },
  { label: "xl", size: "20px", sample: "Extra Large" },
  { label: "2xl", size: "24px", sample: "Heading 2XL" },
  { label: "3xl", size: "30px", sample: "Heading 3XL" },
  { label: "4xl", size: "36px", sample: "Heading 4XL" },
  { label: "display", size: "48px", sample: "Display" },
];

export const fontWeights: { label: string; weight: number }[] = [
  { label: "regular", weight: 400 },
  { label: "medium", weight: 500 },
  { label: "semibold", weight: 600 },
  { label: "bold", weight: 700 },
];

// ─── Spacing ────────────────────────────────────────────────────
export const spacing: { label: string; var: string; px: string }[] = [
  { label: "1", var: "--space-1", px: "4px" },
  { label: "2", var: "--space-2", px: "8px" },
  { label: "3", var: "--space-3", px: "12px" },
  { label: "4", var: "--space-4", px: "16px" },
  { label: "6", var: "--space-6", px: "24px" },
  { label: "8", var: "--space-8", px: "32px" },
  { label: "12", var: "--space-12", px: "48px" },
  { label: "16", var: "--space-16", px: "64px" },
];

// ─── Border Radius ──────────────────────────────────────────────
export const radii: { label: string; value: string }[] = [
  { label: "sm", value: "4px" },
  { label: "md", value: "8px" },
  { label: "lg", value: "12px" },
  { label: "xl", value: "16px" },
  { label: "pill", value: "9999px" },
];

// ─── Shadows ────────────────────────────────────────────────────
export const shadows: { label: string; var: string; value: string }[] = [
  { label: "sm", var: "--shadow-sm", value: "0 1px 2px rgba(0,0,0,0.05)" },
  { label: "md", var: "--shadow-md", value: "0 4px 12px rgba(0,0,0,0.08)" },
  { label: "lg", var: "--shadow-lg", value: "0 8px 24px rgba(0,0,0,0.1)" },
  { label: "xl", var: "--shadow-xl", value: "0 16px 48px rgba(0,0,0,0.12)" },
];

// ─── Primitive Palette ──────────────────────────────────────────
export const primitives: { name: string; var: string; hex: string }[] = [
  { name: "white", var: "--sf-white", hex: "#ffffff" },
  { name: "black", var: "--sf-black", hex: "#000000" },
  // gray scale
  { name: "gray-50", var: "--sf-gray-50", hex: "#f9fafb" },
  { name: "gray-100", var: "--sf-gray-100", hex: "#f3f4f6" },
  { name: "gray-200", var: "--sf-gray-200", hex: "#e5e7eb" },
  { name: "gray-300", var: "--sf-gray-300", hex: "#d1d5db" },
  { name: "gray-400", var: "--sf-gray-400", hex: "#9ca3af" },
  { name: "gray-500", var: "--sf-gray-500", hex: "#6b7280" },
  { name: "gray-600", var: "--sf-gray-600", hex: "#4b5563" },
  { name: "gray-700", var: "--sf-gray-700", hex: "#374151" },
  { name: "gray-800", var: "--sf-gray-800", hex: "#1f2937" },
  { name: "gray-900", var: "--sf-gray-900", hex: "#111827" },
  { name: "gray-950", var: "--sf-gray-950", hex: "#030712" },
  // accent
  { name: "accent", var: "--sf-accent", hex: "#6366f1" },
];

// ─── Icons ─────────────────────────────────────────────────────
export const icons: { library: string; names: string[]; count: number } = {
  library: "none",
  names: [],
  count: 0,
};

// ─── Semantic Tokens ────────────────────────────────────────────
export const semanticTokens: {
  category: string;
  tokens: { name: string; var: string; lightRef: string; darkRef: string }[];
}[] = [
  {
    category: "Background",
    tokens: [
      { name: "bg-primary", var: "--color-bg-primary", lightRef: "white", darkRef: "gray-950" },
      { name: "bg-secondary", var: "--color-bg-secondary", lightRef: "gray-50", darkRef: "gray-900" },
      { name: "bg-tertiary", var: "--color-bg-tertiary", lightRef: "gray-100", darkRef: "gray-800" },
    ],
  },
  {
    category: "Text",
    tokens: [
      { name: "text-primary", var: "--color-text-primary", lightRef: "gray-900", darkRef: "gray-50" },
      { name: "text-secondary", var: "--color-text-secondary", lightRef: "gray-600", darkRef: "gray-400" },
      { name: "text-tertiary", var: "--color-text-tertiary", lightRef: "gray-400", darkRef: "gray-500" },
    ],
  },
  {
    category: "Border",
    tokens: [
      { name: "border-primary", var: "--color-border-primary", lightRef: "gray-200", darkRef: "gray-700" },
      { name: "border-subtle", var: "--color-border-subtle", lightRef: "gray-100", darkRef: "gray-800" },
    ],
  },
  {
    category: "Surface",
    tokens: [
      { name: "surface-elevated", var: "--color-surface-elevated", lightRef: "white", darkRef: "gray-900" },
      { name: "surface-sunken", var: "--color-surface-sunken", lightRef: "gray-50", darkRef: "gray-800" },
    ],
  },
  {
    category: "Accent",
    tokens: [
      { name: "accent", var: "--color-accent", lightRef: "accent", darkRef: "accent" },
    ],
  },
];
`;
