import type { Metadata } from "next";
import { ThemeToggle } from "./components/theme-toggle";

export const metadata: Metadata = {
  title: "Design System — /* PREENCHER: nome do site */",
  description:
    "Design system tokens and components extracted from /* PREENCHER: dominio */",
};

/* ───────── static tokens (non-color) ───────── */
const fonts = {
  serif: /* PREENCHER: font stack serif */ '"Georgia", serif',
  sans: /* PREENCHER: font stack sans */ 'ui-sans-serif, system-ui, sans-serif',
  mono: /* PREENCHER: font stack mono */ 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};
const fontSizes = {
  /* PREENCHER: escala de tamanhos extraida dos screenshots */
  xs: "12px",
  sm: "13px",
  base: "14px",
  md: "16px",
  display: "72px",
};
const fontWeights = {
  /* PREENCHER: pesos usados no site */
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};
const radii = {
  /* PREENCHER: border-radius extraidos */
  sm: "6px",
  md: "8px",
  pill: "9999px",
};

/* ───────── primitive palette ───────── */
/* PREENCHER: Adicionar todas as cores primitivas extraidas dos screenshots.
   Cada entrada deve ter: name (nome curto), var (CSS custom property --sf-*),
   light (valor hex/oklch no light mode), dark (valor hex/oklch no dark mode).
   Primitivos sao cores absolutas, nao referenciam outras variaveis. */
const primitives: { name: string; var: string; light: string; dark: string }[] = [
  { name: "white", var: "--sf-white", light: "#ffffff", dark: "#ffffff" },
  { name: "black", var: "--sf-black", light: "#000000", dark: "#000000" },
  /* PREENCHER: gray scale (50-950), accent colors, etc. */
];

/* ───────── semantic tokens ───────── */
/* PREENCHER: Agrupar tokens semanticos por categoria.
   Cada token mapeia para um primitivo (lightRef/darkRef = nome do primitivo).
   Categorias tipicas: Background, Text, Border, Surface, Accent. */
const semanticTokens: {
  category: string;
  tokens: { name: string; var: string; lightRef: string; darkRef: string }[];
}[] = [
  {
    category: "Background",
    tokens: [
      /* PREENCHER: bg-primary, bg-secondary, bg-tertiary, bg-glass, etc. */
      { name: "bg-primary", var: "--color-bg-primary", lightRef: "white", darkRef: "/* PREENCHER */" },
    ],
  },
  {
    category: "Text",
    tokens: [
      /* PREENCHER: text-primary, text-secondary, text-tertiary, text-inverse */
    ],
  },
  {
    category: "Border",
    tokens: [
      /* PREENCHER: border-primary, border-secondary, border-subtle */
    ],
  },
  {
    category: "Surface",
    tokens: [
      /* PREENCHER: surface-elevated, surface-sunken */
    ],
  },
  {
    category: "Accent",
    tokens: [
      /* PREENCHER: accent color(s) */
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
/* PREENCHER: Extrair dados reais dos screenshots para popular a tabela.
   Cada item deve ter os campos relevantes para o leaderboard do site. */
const sampleProjects = [
  { rank: 1, name: "/* PREENCHER */", description: "/* PREENCHER */", original: "/* PREENCHER */", language: "/* PREENCHER */", stars: "/* PREENCHER */" },
  { rank: 2, name: "/* PREENCHER */", description: "/* PREENCHER */", original: "/* PREENCHER */", language: "/* PREENCHER */", stars: "/* PREENCHER */" },
  { rank: 3, name: "/* PREENCHER */", description: "/* PREENCHER */", original: "/* PREENCHER */", language: "/* PREENCHER */", stars: "/* PREENCHER */" },
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
            {/* PREENCHER: dominio do site */}
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
          {/* PREENCHER: ajustar preview text para o nome/contexto do site */}
          <TokenRow name="serif" value={fonts.serif} preview={<span style={{ fontFamily: fonts.serif, fontSize: 18 }}>preview text</span>} />
          <TokenRow name="sans" value="ui-sans-serif, system-ui, sans-serif…" preview={<span style={{ fontFamily: fonts.sans, fontSize: 18 }}>preview text</span>} />
          <TokenRow name="mono" value="ui-monospace, SFMono-Regular…" preview={<span style={{ fontFamily: fonts.mono, fontSize: 18 }}>preview text</span>} />
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
            {/* PREENCHER: ajustar textos de exemplo para refletir o site */}
            <span style={{ fontFamily: fonts.serif, fontSize: 72, fontWeight: fontWeights.bold, lineHeight: 1, letterSpacing: "-0.02em" }}>
              {/* PREENCHER: display heading */}
            </span>
            <span style={{ fontFamily: fonts.sans, fontSize: 14, color: "var(--color-text-secondary)" }}>
              {/* PREENCHER: subtitle/phonetic */}
            </span>
            <span style={{ fontFamily: fonts.sans, fontSize: 13, fontStyle: "italic", color: "var(--color-text-secondary)" }}>
              {/* PREENCHER: tipo gramatical */}
            </span>
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
            {/* PREENCHER: logo/nome do site */}
            <span style={{ fontFamily: fonts.serif, fontWeight: fontWeights.bold, fontSize: 16 }}>site name</span>
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
              {/* PREENCHER: texto do CTA */}
              Action
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ marginBottom: 48 }}>
          <h3 style={{ fontSize: 16, fontWeight: fontWeights.semibold, marginBottom: 12 }}>Button</h3>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>
            {/* PREENCHER: descricao do estilo de botao */}
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
              {/* PREENCHER */}
              Primary Button
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
              {/* PREENCHER */}
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
              {/* PREENCHER */}
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
            {/* PREENCHER: linguagens extraidas dos screenshots */}
            {["TypeScript", "Rust", "Python"].map((lang) => (
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

        {/* Fork Badge — se aplicavel ao site */}
        <div style={{ marginBottom: 48 }}>
          <h3 style={{ fontSize: 16, fontWeight: fontWeights.semibold, marginBottom: 12 }}>Fork Badge</h3>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>
            Shows the original repository with a fork icon.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            {/* PREENCHER: nomes de repos originais */}
            {["repo-a", "repo-b", "repo-c"].map((repo) => (
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
            {/* PREENCHER: valores de star count */}
            {["10.0k", "5.2k", "917", "61"].map((count) => (
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
          {/* PREENCHER: ajustar colunas conforme dados do site */}
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
            {/* PREENCHER: texto do CTA */}
            <div style={{ fontWeight: fontWeights.bold, fontSize: 16, marginBottom: 4 }}>CTA headline</div>
            <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
              CTA description text goes here.
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
            {/* PREENCHER */}
            Action Button
          </button>
        </div>
      </Section>

      {/* ═══ HERO / DEFINITION BLOCK ═══ */}
      <Section title="Hero / Definition Block">
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>
          Dictionary-style hero with serif display heading, phonetic pronunciation, and numbered definitions.
        </p>
        <div style={{ padding: "48px 32px", border: "1px solid var(--color-border-primary)", borderRadius: radii.md }}>
          {/* PREENCHER: titulo display, fonetica, definicoes */}
          <h1 style={{ fontFamily: fonts.serif, fontSize: 72, fontWeight: fontWeights.bold, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 8 }}>
            {/* PREENCHER: display heading */}
          </h1>
          <div style={{ fontFamily: fonts.sans, fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 2 }}>
            {/* PREENCHER: phonetic */}
          </div>
          <div style={{ fontFamily: fonts.sans, fontSize: 13, fontStyle: "italic", color: "var(--color-text-secondary)", marginBottom: 24 }}>
            {/* PREENCHER: parte do discurso */}
          </div>
          <hr style={{ border: "none", borderTop: "1px solid var(--color-border-primary)", marginBottom: 24 }} />
          <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 16, fontSize: 16, lineHeight: 1.6 }}>
            {/* PREENCHER: definicoes */}
            <li>First definition goes here.</li>
            <li>Second definition goes here.</li>
          </ol>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 24 }}>
            {/* PREENCHER: creditos/atribuicao */}
          </p>
        </div>
      </Section>
    </div>
  );
}
