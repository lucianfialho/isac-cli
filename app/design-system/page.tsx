import type { Metadata } from "next";
import { ThemeToggle } from "./components/theme-toggle";

export const metadata: Metadata = {
  title: "Design System — Slop Forks",
  description:
    "Design system tokens and components extracted from slopforks.com",
};

/* ───────── static tokens (non-color) ───────── */
const fonts = {
  serif: '"Source Serif 4", Georgia, serif',
  sans: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};
const fontSizes = { xs: "12px", sm: "13px", base: "14px", md: "16px", display: "72px" };
const fontWeights = { regular: 400, medium: 500, semibold: 600, bold: 700 };
const radii = { sm: "6px", md: "8px", pill: "9999px" };

/* ───────── primitive palette ───────── */
const primitives: { name: string; var: string; light: string; dark: string }[] = [
  { name: "white", var: "--sf-white", light: "#ffffff", dark: "#ffffff" },
  { name: "black", var: "--sf-black", light: "#000000", dark: "#000000" },
  { name: "gray-50", var: "--sf-gray-50", light: "#fafafa", dark: "#fafafa" },
  { name: "gray-100", var: "--sf-gray-100", light: "#f5f5f5", dark: "#f5f5f5" },
  { name: "gray-200", var: "--sf-gray-200", light: "#e5e5e5", dark: "#e5e5e5" },
  { name: "gray-300", var: "--sf-gray-300", light: "#d4d4d4", dark: "#d4d4d4" },
  { name: "gray-400", var: "--sf-gray-400", light: "#a3a3a3", dark: "#a3a3a3" },
  { name: "gray-500", var: "--sf-gray-500", light: "#737373", dark: "#737373" },
  { name: "gray-600", var: "--sf-gray-600", light: "#525252", dark: "#525252" },
  { name: "gray-700", var: "--sf-gray-700", light: "#404040", dark: "#404040" },
  { name: "gray-800", var: "--sf-gray-800", light: "#262626", dark: "#262626" },
  { name: "gray-900", var: "--sf-gray-900", light: "#171717", dark: "#171717" },
  { name: "gray-950", var: "--sf-gray-950", light: "#0a0a0a", dark: "#0a0a0a" },
  { name: "amber", var: "--sf-amber", light: "oklch(0.769 0.188 70.08)", dark: "oklch(0.769 0.188 70.08)" },
];

/* ───────── semantic tokens ───────── */
const semanticTokens: {
  category: string;
  tokens: { name: string; var: string; lightRef: string; darkRef: string }[];
}[] = [
  {
    category: "Background",
    tokens: [
      { name: "bg-primary", var: "--color-bg-primary", lightRef: "white", darkRef: "gray-950" },
      { name: "bg-secondary", var: "--color-bg-secondary", lightRef: "gray-50", darkRef: "gray-900" },
      { name: "bg-tertiary", var: "--color-bg-tertiary", lightRef: "gray-100", darkRef: "gray-800" },
      { name: "bg-glass", var: "--color-bg-glass", lightRef: "rgba(255,255,255,0.8)", darkRef: "rgba(10,10,10,0.8)" },
    ],
  },
  {
    category: "Text",
    tokens: [
      { name: "text-primary", var: "--color-text-primary", lightRef: "gray-900", darkRef: "gray-100" },
      { name: "text-secondary", var: "--color-text-secondary", lightRef: "gray-500", darkRef: "gray-400" },
      { name: "text-tertiary", var: "--color-text-tertiary", lightRef: "gray-400", darkRef: "gray-600" },
      { name: "text-inverse", var: "--color-text-inverse", lightRef: "white", darkRef: "gray-950" },
    ],
  },
  {
    category: "Border",
    tokens: [
      { name: "border-primary", var: "--color-border-primary", lightRef: "gray-200", darkRef: "gray-800" },
      { name: "border-secondary", var: "--color-border-secondary", lightRef: "gray-300", darkRef: "gray-700" },
      { name: "border-subtle", var: "--color-border-subtle", lightRef: "gray-100", darkRef: "gray-800" },
    ],
  },
  {
    category: "Surface",
    tokens: [
      { name: "surface-elevated", var: "--color-surface-elevated", lightRef: "white", darkRef: "gray-900" },
      { name: "surface-sunken", var: "--color-surface-sunken", lightRef: "gray-50", darkRef: "gray-950" },
    ],
  },
  {
    category: "Accent",
    tokens: [
      { name: "accent", var: "--color-accent", lightRef: "amber", darkRef: "amber" },
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
      {/* Header */}
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
          <TokenRow name="serif" value={fonts.serif} preview={<span style={{ fontFamily: fonts.serif, fontSize: 18 }}>slop forks</span>} />
          <TokenRow name="sans" value="ui-sans-serif, system-ui, sans-serif…" preview={<span style={{ fontFamily: fonts.sans, fontSize: 18 }}>slop forks</span>} />
          <TokenRow name="mono" value="ui-monospace, SFMono-Regular…" preview={<span style={{ fontFamily: fonts.mono, fontSize: 18 }}>slop forks</span>} />
        </div>

        <div style={{ marginBottom: 32 }}>
          <SubHeading>Font Sizes</SubHeading>
          {Object.entries(fontSizes).map(([name, size]) => (
            <TokenRow
              key={name}
              name={name}
              value={size}
              preview={
                <span style={{ fontSize: name === "display" ? 36 : parseInt(size), fontFamily: name === "display" ? fonts.serif : fonts.sans, fontWeight: fontWeights.bold }}>
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
              preview={<span style={{ fontWeight: weight, fontSize: 16, fontFamily: fonts.sans }}>The quick brown fox</span>}
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
            <span style={{ fontFamily: fonts.serif, fontSize: 72, fontWeight: fontWeights.bold, lineHeight: 1, letterSpacing: "-0.02em" }}>
              slop forks
            </span>
            <span style={{ fontFamily: fonts.sans, fontSize: 14, color: "var(--color-text-secondary)" }}>[släp-fȯrks]</span>
            <span style={{ fontFamily: fonts.sans, fontSize: 13, fontStyle: "italic", color: "var(--color-text-secondary)" }}>noun, plural</span>
          </div>
        </div>
      </Section>

      {/* ═══ BORDER RADIUS ═══ */}
      <Section title="Border Radius">
        <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
          {Object.entries(radii).map(([name, value]) => (
            <div key={name} style={{ textAlign: "center" }}>
              <div style={{ width: 80, height: 80, border: "2px solid var(--color-text-primary)", borderRadius: value, marginBottom: 8 }} />
              <div style={{ fontSize: 13, fontWeight: fontWeights.semibold }}>{name}</div>
              <code style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: fonts.mono }}>{value}</code>
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
            <span style={{ fontFamily: fonts.serif, fontWeight: fontWeights.bold, fontSize: 16 }}>slop forks</span>
            <button
              style={{
                fontFamily: fonts.sans,
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
                fontFamily: fonts.sans,
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
                fontFamily: fonts.sans,
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
            <span style={{ textDecoration: "underline", fontWeight: fontWeights.semibold, cursor: "pointer" }}>Project Link ↗</span>
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
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  padding: "4px 12px",
                  borderRadius: radii.pill,
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
                <span style={{ color: "var(--color-accent)", fontSize: 16 }}>★</span>
                {count}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ LEADERBOARD TABLE ═══ */}
      <Section title="Leaderboard Table">
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 24 }}>
          Main data table. Uses semantic tokens for all colors — automatically adapts to dark mode.
        </p>
        <div style={{ border: "1px solid var(--color-border-primary)", borderRadius: radii.md, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: fonts.sans, fontSize: 14 }}>
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
                    <span style={{ fontSize: 13, padding: "4px 12px", borderRadius: radii.pill, border: "1px solid var(--color-border-primary)", background: "var(--color-bg-secondary)" }}>
                      {p.language}
                    </span>
                  </td>
                  <td style={{ padding: 16, textAlign: "right", fontFamily: fonts.mono, fontWeight: fontWeights.semibold }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <span style={{ color: "var(--color-accent)", fontSize: 16 }}>★</span>
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
              fontFamily: fonts.sans,
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

      {/* ═══ HERO ═══ */}
      <Section title="Hero / Definition Block">
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>
          Dictionary-style hero with serif display heading, phonetic pronunciation, and numbered definitions.
        </p>
        <div style={{ padding: "48px 32px", border: "1px solid var(--color-border-primary)", borderRadius: radii.md }}>
          <h1 style={{ fontFamily: fonts.serif, fontSize: 72, fontWeight: fontWeights.bold, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 8 }}>
            slop forks
          </h1>
          <div style={{ fontFamily: fonts.sans, fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 2 }}>[släp-fȯrks]</div>
          <div style={{ fontFamily: fonts.sans, fontSize: 13, fontStyle: "italic", color: "var(--color-text-secondary)", marginBottom: 24 }}>noun, plural</div>
          <hr style={{ border: "none", borderTop: "1px solid var(--color-border-primary)", marginBottom: 24 }} />
          <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 16, fontSize: 16, lineHeight: 1.6 }}>
            <li>A fork of an open-source repository, built primarily with AI, that attempts to improve upon, extend, or reimagine the original project.</li>
            <li>When someone else does it, it&apos;s &ldquo;crafting with AI.&rdquo; When you do it, it&apos;s slop.</li>
          </ol>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 24 }}>
            Term coined by <span style={{ textDecoration: "underline" }}>Malte Ubl</span>, creator of{" "}
            <span style={{ textDecoration: "underline" }}>just-bash</span>, in Feb 2026.
          </p>
        </div>
      </Section>
    </div>
  );
}
