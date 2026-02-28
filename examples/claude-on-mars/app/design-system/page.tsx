import type { Metadata } from "next";
import { ThemeToggle } from "./components/theme-toggle";

export const metadata: Metadata = {
  title: "Design System — Slop Forks",
  description:
    "Design system tokens and components extracted from slopforks.com",
};

/* ───────── static tokens (non-color) ───────── */
const fonts = {
  serif: '"Source Serif 4", Georgia, "Times New Roman", serif',
  sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};
const fontSizes = {
  xs: "12px",
  sm: "13px",
  base: "14px",
  md: "16px",
  lg: "18px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "32px",
  "4xl": "40px",
  display: "72px",
};
const fontWeights = { regular: 400, medium: 500, semibold: 600, bold: 700 };
const radii = { sm: "4px", md: "6px", lg: "8px", xl: "12px", full: "9999px" };

/* ───────── primitive palette ───────── */
const primitives: { name: string; var: string; light: string; dark: string }[] = [
  { name: "white", var: "--sf-white", light: "#ffffff", dark: "#ffffff" },
  { name: "black", var: "--sf-black", light: "#000000", dark: "#000000" },
  { name: "cream", var: "--sf-cream", light: "#faf9f5", dark: "#faf9f5" },
  { name: "warm-50", var: "--sf-warm-50", light: "#f7f6f3", dark: "#f7f6f3" },
  { name: "warm-100", var: "--sf-warm-100", light: "#eeede8", dark: "#eeede8" },
  { name: "warm-200", var: "--sf-warm-200", light: "#dddcd6", dark: "#dddcd6" },
  { name: "warm-300", var: "--sf-warm-300", light: "#c4c3bb", dark: "#c4c3bb" },
  { name: "warm-400", var: "--sf-warm-400", light: "#9e9d96", dark: "#9e9d96" },
  { name: "warm-500", var: "--sf-warm-500", light: "#7a7972", dark: "#7a7972" },
  { name: "warm-600", var: "--sf-warm-600", light: "#5e5d57", dark: "#5e5d57" },
  { name: "warm-700", var: "--sf-warm-700", light: "#454540", dark: "#454540" },
  { name: "warm-800", var: "--sf-warm-800", light: "#2e2e2a", dark: "#2e2e2a" },
  { name: "warm-900", var: "--sf-warm-900", light: "#1f1f1b", dark: "#1f1f1b" },
  { name: "warm-950", var: "--sf-warm-950", light: "#191918", dark: "#191918" },
  { name: "accent", var: "--sf-accent", light: "oklch(0.637 0.137 26.5)", dark: "oklch(0.637 0.137 26.5)" },
  { name: "link", var: "--sf-link", light: "oklch(0.65 0.12 230)", dark: "oklch(0.65 0.12 230)" },
  { name: "highlight", var: "--sf-highlight", light: "oklch(0.769 0.128 70.08)", dark: "oklch(0.769 0.128 70.08)" },
  { name: "mars-rust", var: "--sf-mars-rust", light: "#c4603a", dark: "#c4603a" },
  { name: "mars-ochre", var: "--sf-mars-ochre", light: "#d4956b", dark: "#d4956b" },
];

/* ───────── semantic tokens ───────── */
const semanticTokens: {
  category: string;
  tokens: { name: string; var: string; lightRef: string; darkRef: string }[];
}[] = [
  {
    category: "Background",
    tokens: [
      { name: "bg-primary", var: "--color-bg-primary", lightRef: "cream", darkRef: "warm-950" },
      { name: "bg-secondary", var: "--color-bg-secondary", lightRef: "warm-50", darkRef: "warm-900" },
      { name: "bg-tertiary", var: "--color-bg-tertiary", lightRef: "warm-100", darkRef: "warm-800" },
      { name: "bg-glass", var: "--color-bg-glass", lightRef: "rgba(250,249,245,0.85)", darkRef: "rgba(25,25,24,0.85)" },
      { name: "bg-elevated-panel", var: "--color-bg-elevated-panel", lightRef: "warm-950", darkRef: "warm-900" },
    ],
  },
  {
    category: "Text",
    tokens: [
      { name: "text-primary", var: "--color-text-primary", lightRef: "warm-950", darkRef: "cream" },
      { name: "text-secondary", var: "--color-text-secondary", lightRef: "warm-500", darkRef: "warm-400" },
      { name: "text-tertiary", var: "--color-text-tertiary", lightRef: "warm-400", darkRef: "warm-600" },
      { name: "text-inverse", var: "--color-text-inverse", lightRef: "cream", darkRef: "warm-950" },
      { name: "text-link", var: "--color-text-link", lightRef: "link", darkRef: "link" },
      { name: "text-display", var: "--color-text-display", lightRef: "warm-950", darkRef: "cream" },
    ],
  },
  {
    category: "Border",
    tokens: [
      { name: "border-primary", var: "--color-border-primary", lightRef: "warm-200", darkRef: "warm-800" },
      { name: "border-secondary", var: "--color-border-secondary", lightRef: "warm-300", darkRef: "warm-700" },
      { name: "border-subtle", var: "--color-border-subtle", lightRef: "warm-100", darkRef: "warm-800" },
    ],
  },
  {
    category: "Surface",
    tokens: [
      { name: "surface-elevated", var: "--color-surface-elevated", lightRef: "white", darkRef: "warm-900" },
      { name: "surface-sunken", var: "--color-surface-sunken", lightRef: "warm-50", darkRef: "warm-950" },
      { name: "surface-overlay", var: "--color-surface-overlay", lightRef: "rgba(25,25,24,0.6)", darkRef: "rgba(25,25,24,0.8)" },
    ],
  },
  {
    category: "Accent",
    tokens: [
      { name: "accent", var: "--color-accent", lightRef: "accent", darkRef: "accent" },
      { name: "highlight", var: "--color-highlight", lightRef: "highlight", darkRef: "highlight" },
    ],
  },
];

/* ───────── helper: resolve primitive hex from ref name ───────── */
function resolveHex(ref: string): string {
  const found = primitives.find((p) => p.name === ref);
  return found ? found.light : ref;
}
function resolveHexDark(ref: string): string {
  const found = primitives.find((p) => p.name === ref);
  return found ? found.dark : ref;
}

/* ───────── helpers ───────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 64 }}>
      <h2
        style={{
          fontFamily: fonts.sans,
          fontSize: 24,
          fontWeight: fontWeights.bold,
          color: "var(--color-text-primary)",
          marginBottom: 24,
          paddingBottom: 12,
          borderBottom: "1px solid var(--color-border-primary)",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: 14,
        fontWeight: fontWeights.semibold,
        color: "var(--color-text-secondary)",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: 16,
      }}
    >
      {children}
    </h3>
  );
}

function TokenRow({ name, value, preview }: { name: string; value: string; preview?: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "10px 0",
        borderBottom: "1px solid var(--color-border-subtle)",
        fontFamily: fonts.sans,
        fontSize: 14,
      }}
    >
      <code style={{ fontFamily: fonts.mono, fontSize: 13, color: "var(--color-text-secondary)", minWidth: 160 }}>
        {name}
      </code>
      <code
        style={{
          fontFamily: fonts.mono,
          fontSize: 13,
          background: "var(--color-bg-tertiary)",
          padding: "2px 8px",
          borderRadius: 4,
          flex: 1,
        }}
      >
        {value}
      </code>
      {preview && <div style={{ flexShrink: 0 }}>{preview}</div>}
    </div>
  );
}

/* ───────── sample data ───────── */
const sampleProjects = [
  { rank: 1, name: "OpenCode", description: "Open-source, provider-agnostic AI coding agent — Claude Code reimagined", original: "claude-code", language: "TypeScript", stars: "112.0k" },
  { rank: 2, name: "Void", description: "The open-source Cursor alternative — VS Code fork with AI agents and checkpoints", original: "vscode", language: "TypeScript", stars: "28.3k" },
  { rank: 3, name: "Roo Code", description: "Fork of Cline with multi-agent modes — Code, Architect, Debug, Ask", original: "cline", language: "TypeScript", stars: "22.4k" },
  { rank: 4, name: "bolt.diy", description: "Community fork of bolt.new — use any LLM to build full-stack apps", original: "bolt.new", language: "TypeScript", stars: "19.1k" },
  { rank: 5, name: "Kilo Code", description: "Fork of Roo Code (which forked Cline) — the slop fork of a slop fork", original: "Roo-Code", language: "TypeScript", stars: "16.0k" },
  { rank: 6, name: "Melty", description: "VS Code fork where every chat is a git commit — writing half its own code", original: "vscode", language: "TypeScript", stars: "5.4k" },
  { rank: 7, name: "vinext", description: "Next.js API surface reimplemented on Vite — built in one week with Claude Code", original: "next.js", language: "TypeScript", stars: "4.4k" },
  { rank: 8, name: "Every Code", description: "Fork of OpenAI Codex CLI — adds multi-agent orchestration across providers", original: "codex", language: "Rust", stars: "3.5k" },
  { rank: 9, name: "just-bash", description: "Bash reimplemented in TypeScript — sandboxed shell for AI agents with 60+ commands", original: "bash", language: "TypeScript", stars: "1.4k" },
  { rank: 10, name: "LLM Gateway", description: "Open-source OpenRouter alternative — unified API for every LLM provider", original: "openrouter", language: "TypeScript", stars: "917" },
  { rank: 11, name: "Ghostree", description: "Ghostty fork with native worktrees — Codex kept trying to PR upstream", original: "ghostty", language: "Zig", stars: "61" },
];

/* ───────── page ───────── */
export default function DesignSystemPage() {
  return (
    <div
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "48px 24px",
        fontFamily: fonts.sans,
        color: "var(--color-text-primary)",
      }}
    >
      {/* ═══ HEADER ═══ */}
      <header style={{ marginBottom: 64 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <h1
            style={{
              fontFamily: fonts.serif,
              fontSize: 48,
              fontWeight: fontWeights.bold,
              letterSpacing: "-0.02em",
            }}
          >
            Design System
          </h1>
          <ThemeToggle />
        </div>
        <p style={{ fontSize: 16, color: "var(--color-text-secondary)" }}>
          Tokens and components extracted from{" "}
          <span style={{ fontWeight: fontWeights.semibold, color: "var(--color-text-primary)" }}>
            slopforks.com
          </span>{" "}
          — with dark mode support
        </p>
      </header>

      {/* ═══ PRIMITIVE PALETTE ═══ */}
      <Section title="Primitive Palette">
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 24 }}>
          Raw color values. These are never used directly in components — they feed the semantic tokens below.
          Anthropic uses a warm neutral palette, not pure cool grays.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          {primitives.map((p) => (
            <div
              key={p.name}
              style={{
                border: "1px solid var(--color-border-primary)",
                borderRadius: radii.md,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: 56,
                  background: p.light,
                  borderBottom: "1px solid var(--color-border-primary)",
                }}
              />
              <div style={{ padding: "8px 10px" }}>
                <div style={{ fontSize: 12, fontWeight: fontWeights.semibold, marginBottom: 2 }}>
                  {p.name}
                </div>
                <code style={{ fontSize: 10, color: "var(--color-text-secondary)", fontFamily: fonts.mono }}>
                  {p.var}
                </code>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ SEMANTIC TOKENS ═══ */}
      <Section title="Semantic Tokens">
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 32 }}>
          Contextual aliases that map to primitives. These swap automatically between light and dark mode.
        </p>

        {semanticTokens.map((group) => (
          <div key={group.category} style={{ marginBottom: 40 }}>
            <SubHeading>{group.category}</SubHeading>
            <div
              style={{
                border: "1px solid var(--color-border-primary)",
                borderRadius: radii.md,
                overflow: "hidden",
              }}
            >
              {/* Table header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 56px 120px 56px 120px",
                  gap: 0,
                  padding: "8px 16px",
                  background: "var(--color-bg-secondary)",
                  borderBottom: "1px solid var(--color-border-primary)",
                  fontSize: 11,
                  fontWeight: fontWeights.semibold,
                  color: "var(--color-text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <span>Token</span>
                <span style={{ textAlign: "center" }}>Light</span>
                <span>Reference</span>
                <span style={{ textAlign: "center" }}>Dark</span>
                <span>Reference</span>
              </div>

              {/* Rows */}
              {group.tokens.map((t) => (
                <div
                  key={t.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 56px 120px 56px 120px",
                    gap: 0,
                    padding: "10px 16px",
                    borderBottom: "1px solid var(--color-border-subtle)",
                    alignItems: "center",
                    fontSize: 13,
                  }}
                >
                  <code style={{ fontFamily: fonts.mono, fontSize: 12, color: "var(--color-text-primary)" }}>
                    {t.var}
                  </code>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: resolveHex(t.lightRef),
                        border: "1px solid var(--color-border-primary)",
                      }}
                    />
                  </div>
                  <code style={{ fontFamily: fonts.mono, fontSize: 11, color: "var(--color-text-secondary)" }}>
                    {t.lightRef}
                  </code>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: resolveHexDark(t.darkRef),
                        border: "1px solid var(--color-border-primary)",
                      }}
                    />
                  </div>
                  <code style={{ fontFamily: fonts.mono, fontSize: 11, color: "var(--color-text-secondary)" }}>
                    {t.darkRef}
                  </code>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>

      {/* ═══ TYPOGRAPHY ═══ */}
      <Section title="Typography">
        <div style={{ marginBottom: 32 }}>
          <SubHeading>Font Families</SubHeading>
          <TokenRow name="display (serif)" value={fonts.serif} preview={<span style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>slop forks</span>} />
          <TokenRow name="body (sans)" value={fonts.sans} preview={<span style={{ fontFamily: "var(--font-body)", fontSize: 18 }}>slop forks</span>} />
          <TokenRow name="mono" value={fonts.mono} preview={<span style={{ fontFamily: "var(--font-mono)", fontSize: 18 }}>slop forks</span>} />
        </div>

        <div style={{ marginBottom: 32 }}>
          <SubHeading>Font Sizes</SubHeading>
          {Object.entries(fontSizes).map(([name, size]) => (
            <TokenRow
              key={name}
              name={name}
              value={size}
              preview={
                <span style={{ fontSize: name === "display" ? 36 : parseInt(size), fontFamily: name === "display" ? "var(--font-display)" : "var(--font-body)", fontWeight: fontWeights.bold }}>
                  Aa
                </span>
              }
            />
          ))}
        </div>

        <div style={{ marginBottom: 32 }}>
          <SubHeading>Font Weights</SubHeading>
          {Object.entries(fontWeights).map(([name, weight]) => (
            <TokenRow
              key={name}
              name={name}
              value={String(weight)}
              preview={<span style={{ fontWeight: weight, fontSize: 16, fontFamily: "var(--font-body)" }}>The quick brown fox</span>}
            />
          ))}
        </div>

        <div>
          <SubHeading>Type Scale (in context)</SubHeading>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              padding: 24,
              border: "1px solid var(--color-border-primary)",
              borderRadius: radii.md,
            }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontSize: 72, fontWeight: fontWeights.bold, lineHeight: 1, letterSpacing: "-0.02em" }}>
              slop forks
            </span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-secondary)" }}>
              [sl&auml;p-f&ocirc;rks]
            </span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontStyle: "italic", color: "var(--color-text-secondary)" }}>
              noun, plural
            </span>
          </div>
        </div>
      </Section>

      {/* ═══ BORDER RADIUS ═══ */}
      <Section title="Border Radius">
        <div style={{ display: "flex", gap: 24, alignItems: "flex-end", flexWrap: "wrap" }}>
          {Object.entries(radii).map(([name, value]) => (
            <div key={name} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  border: "2px solid var(--color-text-primary)",
                  borderRadius: value,
                  marginBottom: 8,
                }}
              />
              <div style={{ fontSize: 13, fontWeight: fontWeights.semibold }}>{name}</div>
              <code style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: fonts.mono }}>{value}</code>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ SPACING ═══ */}
      <Section title="Spacing">
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 24 }}>
          Consistent spacing scale used throughout the site. Based on a 4px grid.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { name: "xs", value: "4px" },
            { name: "sm", value: "8px" },
            { name: "md", value: "16px" },
            { name: "lg", value: "24px" },
            { name: "xl", value: "32px" },
            { name: "2xl", value: "48px" },
            { name: "3xl", value: "64px" },
            { name: "4xl", value: "80px" },
          ].map((s) => (
            <div
              key={s.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "6px 0",
                borderBottom: "1px solid var(--color-border-subtle)",
              }}
            >
              <code style={{ fontFamily: fonts.mono, fontSize: 13, color: "var(--color-text-secondary)", minWidth: 80 }}>
                {s.name}
              </code>
              <code
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 13,
                  background: "var(--color-bg-tertiary)",
                  padding: "2px 8px",
                  borderRadius: 4,
                  minWidth: 60,
                }}
              >
                {s.value}
              </code>
              <div
                style={{
                  width: parseInt(s.value),
                  height: 16,
                  background: "var(--color-accent)",
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ SHADOWS ═══ */}
      <Section title="Shadows">
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 24 }}>
          Three elevation levels. Shadows invert to darker values in dark mode for contrast.
        </p>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          {[
            { name: "sm", value: "var(--shadow-sm)" },
            { name: "md", value: "var(--shadow-md)" },
            { name: "lg", value: "var(--shadow-lg)" },
          ].map((s) => (
            <div key={s.name} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 120,
                  height: 80,
                  background: "var(--color-surface-elevated)",
                  borderRadius: radii.lg,
                  boxShadow: s.value,
                  marginBottom: 12,
                }}
              />
              <div style={{ fontSize: 13, fontWeight: fontWeights.semibold }}>{s.name}</div>
              <code style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: fonts.mono }}>
                --shadow-{s.name}
              </code>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ COMPONENTS ═══ */}
      <Section title="Components">
        {/* Sticky Header */}
        <div style={{ marginBottom: 48 }}>
          <h3 style={{ fontSize: 16, fontWeight: fontWeights.semibold, marginBottom: 12 }}>Sticky Header</h3>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>
            Appears on scroll. Glass-morphism background with blur.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 24px",
              background: "var(--color-bg-glass)",
              backdropFilter: "blur(8px)",
              border: "1px solid var(--color-border-primary)",
              borderRadius: radii.md,
            }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontWeight: fontWeights.bold, fontSize: 16 }}>slop forks</span>
            <button
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: fontWeights.medium,
                padding: "6px 16px",
                border: "1px solid var(--color-border-secondary)",
                borderRadius: radii.sm,
                background: "var(--color-surface-elevated)",
                color: "var(--color-text-primary)",
                cursor: "pointer",
              }}
            >
              Submit Slop
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ marginBottom: 48 }}>
          <h3 style={{ fontSize: 16, fontWeight: fontWeights.semibold, marginBottom: 12 }}>Button</h3>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>
            Outlined style. Border with subtle radius. Used for CTAs.
          </p>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: fontWeights.medium,
                padding: "8px 20px",
                border: "1px solid var(--color-border-secondary)",
                borderRadius: radii.sm,
                background: "var(--color-surface-elevated)",
                color: "var(--color-text-primary)",
                cursor: "pointer",
              }}
            >
              Submit Slop
            </button>
            <button
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: fontWeights.medium,
                padding: "6px 16px",
                border: "1px solid var(--color-border-secondary)",
                borderRadius: radii.sm,
                background: "var(--color-surface-elevated)",
                color: "var(--color-text-primary)",
                cursor: "pointer",
              }}
            >
              Small Button
            </button>
          </div>
        </div>

        {/* Links */}
        <div style={{ marginBottom: 48 }}>
          <h3 style={{ fontSize: 16, fontWeight: fontWeights.semibold, marginBottom: 12 }}>Links</h3>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>
            Underlined by default. Used inline in text and in table cells.
          </p>
          <div style={{ display: "flex", gap: 24, fontSize: 14 }}>
            <span style={{ textDecoration: "underline", cursor: "pointer" }}>Inline Link</span>
            <span style={{ textDecoration: "underline", fontWeight: fontWeights.semibold, cursor: "pointer" }}>
              Project Link ↗
            </span>
          </div>
        </div>

        {/* Language Badge */}
        <div style={{ marginBottom: 48 }}>
          <h3 style={{ fontSize: 16, fontWeight: fontWeights.semibold, marginBottom: 12 }}>Language Badge</h3>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>
            Pill-shaped badge showing the programming language.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            {["TypeScript", "Rust", "Zig"].map((lang) => (
              <span
                key={lang}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  padding: "4px 12px",
                  borderRadius: radii.full,
                  border: "1px solid var(--color-border-primary)",
                  background: "var(--color-bg-secondary)",
                  color: "var(--color-text-primary)",
                }}
              >
                {lang}
              </span>
            ))}
          </div>
        </div>

        {/* Fork Badge */}
        <div style={{ marginBottom: 48 }}>
          <h3 style={{ fontSize: 16, fontWeight: fontWeights.semibold, marginBottom: 12 }}>Fork Badge</h3>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>
            Shows the original repository with a fork icon.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            {["claude-code", "vscode", "cline"].map((repo) => (
              <span
                key={repo}
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 0-1.5 0v.878H6.75v-.878a2.25 2.25 0 1 0-1.5 0ZM8 10.25a.75.75 0 0 1 .75.75v2.25a2.25 2.25 0 1 0-1.5 0V11a.75.75 0 0 1 .75-.75Z" />
                </svg>
                {repo}
              </span>
            ))}
          </div>
        </div>

        {/* Star Count */}
        <div style={{ marginBottom: 48 }}>
          <h3 style={{ fontSize: 16, fontWeight: fontWeights.semibold, marginBottom: 12 }}>Star Count</h3>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>
            Gold star icon with formatted count. Accent color stays consistent across themes.
          </p>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {["112.0k", "28.3k", "917", "61"].map((count) => (
              <span key={count} style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: fonts.mono, fontSize: 14, fontWeight: fontWeights.semibold }}>
                <span style={{ color: "var(--color-accent)", fontSize: 16 }}>&#9733;</span>
                {count}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ LEADERBOARD TABLE ═══ */}
      <Section title="Leaderboard Table">
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 24 }}>
          Main data table. Rounded corners, subtle borders, hover states on rows. Ranked by GitHub stars.
        </p>
        <div style={{ border: "1px solid var(--color-border-primary)", borderRadius: radii.md, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-body)", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border-primary)", background: "var(--color-bg-secondary)" }}>
                {["#", "Project", "Original", "Language", "Stars"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      textAlign: i === 4 ? "right" : "left",
                      padding: "12px 16px",
                      fontWeight: fontWeights.semibold,
                      fontSize: 13,
                      color: "var(--color-text-secondary)",
                      ...(i === 0 ? { width: 48 } : {}),
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleProjects.map((p) => (
                <tr key={p.rank} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                  <td style={{ padding: 16, color: "var(--color-text-secondary)", fontWeight: fontWeights.medium }}>{p.rank}</td>
                  <td style={{ padding: 16 }}>
                    <div>
                      <span style={{ fontWeight: fontWeights.semibold, textDecoration: "underline" }}>{p.name} ↗</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>{p.description}</div>
                  </td>
                  <td style={{ padding: 16 }}>
                    <span style={{ fontFamily: fonts.mono, fontSize: 13, color: "var(--color-text-secondary)", textDecoration: "underline", display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 0-1.5 0v.878H6.75v-.878a2.25 2.25 0 1 0-1.5 0ZM8 10.25a.75.75 0 0 1 .75.75v2.25a2.25 2.25 0 1 0-1.5 0V11a.75.75 0 0 1 .75-.75Z" />
                      </svg>
                      {p.original}
                    </span>
                  </td>
                  <td style={{ padding: 16 }}>
                    <span style={{ fontSize: 13, padding: "4px 12px", borderRadius: radii.full, border: "1px solid var(--color-border-primary)", background: "var(--color-bg-secondary)" }}>
                      {p.language}
                    </span>
                  </td>
                  <td style={{ padding: 16, textAlign: "right", fontFamily: fonts.mono, fontWeight: fontWeights.semibold }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <span style={{ color: "var(--color-accent)", fontSize: 16 }}>&#9733;</span>
                      {p.stars}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ═══ CTA BANNER ═══ */}
      <Section title="CTA Banner">
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>
          Bottom call-to-action. Subtle bordered card with inline button.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 32px",
            border: "1px solid var(--color-border-primary)",
            borderRadius: radii.md,
            background: "var(--color-bg-secondary)",
          }}
        >
          <div>
            <div style={{ fontWeight: fontWeights.bold, fontSize: 16, marginBottom: 4 }}>Have your own slop?</div>
            <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
              If you&apos;ve forked a repo and rebuilt it with AI, we want to see it.
            </div>
          </div>
          <button
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: fontWeights.medium,
              padding: "8px 20px",
              border: "1px solid var(--color-border-secondary)",
              borderRadius: radii.sm,
              background: "var(--color-surface-elevated)",
              color: "var(--color-text-primary)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Submit Slop
          </button>
        </div>
      </Section>

      {/* ═══ HERO / DEFINITION BLOCK ═══ */}
      <Section title="Hero / Definition Block">
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>
          Dictionary-style hero with serif display heading, phonetic pronunciation, and numbered definitions.
        </p>
        <div style={{ padding: "48px 32px", border: "1px solid var(--color-border-primary)", borderRadius: radii.md }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 72, fontWeight: fontWeights.bold, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 8 }}>
            slop forks
          </h1>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 2 }}>
            [sl&auml;p-f&ocirc;rks]
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontStyle: "italic", color: "var(--color-text-secondary)", marginBottom: 24 }}>
            noun, plural
          </div>
          <hr style={{ border: "none", borderTop: "1px solid var(--color-border-primary)", marginBottom: 24 }} />
          <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 16, fontSize: 16, lineHeight: 1.6 }}>
            <li>A fork of an open-source repository, built primarily with AI, that attempts to improve upon, extend, or reimagine the original project.</li>
            <li>When someone else does it, it&apos;s &ldquo;crafting with AI.&rdquo; When you do it, it&apos;s slop.</li>
          </ol>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 24 }}>
            Term coined by <span style={{ textDecoration: "underline" }}>Malte Ubl</span>, creator of{" "}
            <span style={{ textDecoration: "underline" }}>just-bash</span>, in Feb 2026. Inspired by{" "}
            <span style={{ textDecoration: "underline" }}>southpolesteve</span>&apos;s prolific slopping.
          </p>
        </div>
      </Section>
    </div>
  );
}
