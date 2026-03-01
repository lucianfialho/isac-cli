export const DESIGN_SYSTEM_PAGE_TEMPLATE = `import type { Metadata } from "next";
import { ThemeToggle } from "./components/theme-toggle";
import {
  siteInfo,
  fonts as fontStacks,
  fontSizes,
  fontWeights,
  radii,
  primitives,
  semanticTokens,
  spacing,
  shadows,
} from "./data";

export const metadata: Metadata = {
  title: \`Design System — \${siteInfo.name}\`,
  description: \`Design system tokens and components extracted from \${siteInfo.domain}\`,
};

/* ───────── font references via CSS custom properties ───────── */
const fonts = {
  sans: "var(--font-sans)",
  display: "var(--font-display, var(--font-sans))",
  mono: "var(--font-mono)",
};

/* ───────── helpers ───────── */

function resolveHex(ref: string): string {
  const found = primitives.find((p) => p.name === ref);
  return found ? found.hex : ref;
}

/* ───────── sub-components ───────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 64 }}>
      <h2
        style={{
          fontFamily: fonts.sans,
          fontSize: 24,
          fontWeight: 700,
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
        fontWeight: 600,
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

/* ───────── main page ───────── */

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
      {/* ──── HEADER ──── */}
      <header style={{ marginBottom: 64 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 8,
          }}
        >
          <h1
            style={{
              fontFamily: fonts.display,
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Design System
          </h1>
          <ThemeToggle />
        </div>
        <p style={{ fontSize: 16, color: "var(--color-text-secondary)" }}>
          Tokens and components extracted from{" "}
          <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
            {siteInfo.domain}
          </span>{" "}
          — with dark mode support
        </p>
      </header>

      {/* ──── PRIMITIVE PALETTE ──── */}
      <Section title="Primitive Palette">
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-secondary)",
            marginBottom: 24,
          }}
        >
          Raw color values. Never used directly in components — they feed the
          semantic tokens below.
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
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: 56,
                  background: p.hex,
                  borderBottom: "1px solid var(--color-border-primary)",
                }}
              />
              <div style={{ padding: "8px 10px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>
                  {p.name}
                </div>
                <code
                  style={{
                    fontSize: 10,
                    color: "var(--color-text-secondary)",
                    fontFamily: fonts.mono,
                  }}
                >
                  {p.var}
                </code>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--color-text-tertiary)",
                    fontFamily: fonts.mono,
                    marginTop: 2,
                  }}
                >
                  {p.hex}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ──── SEMANTIC TOKENS ──── */}
      <Section title="Semantic Tokens">
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-secondary)",
            marginBottom: 32,
          }}
        >
          Contextual aliases that map to primitives. These swap automatically
          between light and dark mode.
        </p>
        {semanticTokens.map((group) => (
          <div key={group.category} style={{ marginBottom: 40 }}>
            <SubHeading>{group.category}</SubHeading>
            <div
              style={{
                border: "1px solid var(--color-border-primary)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {/* table header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 56px 120px 56px 120px",
                  gap: 0,
                  padding: "8px 16px",
                  background: "var(--color-bg-secondary)",
                  borderBottom: "1px solid var(--color-border-primary)",
                  fontSize: 11,
                  fontWeight: 600,
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

              {/* token rows */}
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
                  <code
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: 12,
                      color: "var(--color-text-primary)",
                    }}
                  >
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
                  <div>
                    <code
                      style={{
                        fontFamily: fonts.mono,
                        fontSize: 11,
                        color: "var(--color-text-secondary)",
                        display: "block",
                      }}
                    >
                      {t.lightRef}
                    </code>
                    <code
                      style={{
                        fontFamily: fonts.mono,
                        fontSize: 10,
                        color: "var(--color-text-tertiary)",
                      }}
                    >
                      {resolveHex(t.lightRef)}
                    </code>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: resolveHex(t.darkRef),
                        border: "1px solid var(--color-border-primary)",
                      }}
                    />
                  </div>
                  <div>
                    <code
                      style={{
                        fontFamily: fonts.mono,
                        fontSize: 11,
                        color: "var(--color-text-secondary)",
                        display: "block",
                      }}
                    >
                      {t.darkRef}
                    </code>
                    <code
                      style={{
                        fontFamily: fonts.mono,
                        fontSize: 10,
                        color: "var(--color-text-tertiary)",
                      }}
                    >
                      {resolveHex(t.darkRef)}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>

      {/* ──── TYPOGRAPHY ──── */}
      <Section title="Typography">
        {/* Font Families */}
        <SubHeading>Font Families</SubHeading>
        <div style={{ marginBottom: 32 }}>
          {Object.entries(fontStacks).map(([key, stack]) => (
            <div
              key={key}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: "16px",
                borderBottom: "1px solid var(--color-border-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <code
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  --font-{key}
                </code>
                <code
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 11,
                    color: "var(--color-text-tertiary)",
                    background: "var(--color-bg-tertiary)",
                    padding: "2px 8px",
                    borderRadius: 4,
                    maxWidth: 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {stack}
                </code>
              </div>
              <span
                style={{
                  fontFamily: \`var(--font-\${key}, \${stack})\`,
                  fontSize: 20,
                }}
              >
                The quick brown fox jumps over the lazy dog
              </span>
            </div>
          ))}
        </div>

        {/* Font Sizes */}
        <SubHeading>Size Scale</SubHeading>
        <div style={{ marginBottom: 32 }}>
          {fontSizes.map((fs) => (
            <div
              key={fs.label}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 16,
                padding: "8px 0",
                borderBottom: "1px solid var(--color-border-subtle)",
              }}
            >
              <code
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                  minWidth: 80,
                }}
              >
                {fs.label}
              </code>
              <code
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 12,
                  color: "var(--color-text-tertiary)",
                  minWidth: 60,
                }}
              >
                {fs.size}
              </code>
              <span style={{ fontFamily: fonts.sans, fontSize: fs.size }}>
                {fs.sample}
              </span>
            </div>
          ))}
        </div>

        {/* Font Weights */}
        <SubHeading>Weights</SubHeading>
        <div style={{ marginBottom: 32 }}>
          {fontWeights.map((fw) => (
            <div
              key={fw.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "8px 0",
                borderBottom: "1px solid var(--color-border-subtle)",
              }}
            >
              <code
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                  minWidth: 100,
                }}
              >
                {fw.label}
              </code>
              <code
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 12,
                  color: "var(--color-text-tertiary)",
                  minWidth: 40,
                }}
              >
                {fw.weight}
              </code>
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 18,
                  fontWeight: fw.weight,
                }}
              >
                The quick brown fox jumps over the lazy dog
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ──── SPACING SCALE ──── */}
      {spacing.length > 0 && (
        <Section title="Spacing Scale">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {spacing.map((s) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <code
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 12,
                    color: "var(--color-text-secondary)",
                    minWidth: 48,
                    textAlign: "right",
                  }}
                >
                  {s.label}
                </code>
                <div
                  style={{
                    height: 16,
                    width: s.px,
                    background: "var(--color-accent)",
                    borderRadius: 4,
                    minWidth: 4,
                  }}
                />
                <code
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 11,
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  {s.px}
                </code>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ──── BORDER RADIUS ──── */}
      <Section title="Border Radius">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 16,
          }}
        >
          {radii.map((r) => (
            <div key={r.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  margin: "0 auto 8px",
                  background: "var(--color-accent)",
                  borderRadius: r.value,
                  opacity: 0.8,
                }}
              />
              <div style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</div>
              <code
                style={{
                  fontSize: 11,
                  color: "var(--color-text-secondary)",
                  fontFamily: fonts.mono,
                }}
              >
                {r.value}
              </code>
            </div>
          ))}
        </div>
      </Section>

      {/* ──── SHADOWS ──── */}
      {shadows.length > 0 && (
        <Section title="Shadows">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 20,
            }}
          >
            {shadows.map((s) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: 80,
                    background: "var(--color-bg-secondary)",
                    borderRadius: 12,
                    boxShadow: s.value,
                    border: "1px solid var(--color-border-subtle)",
                  }}
                />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</div>
                  <code
                    style={{
                      fontSize: 10,
                      color: "var(--color-text-tertiary)",
                      fontFamily: fonts.mono,
                    }}
                  >
                    {s.value}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ──── COMPONENTS ──── */}
      <Section title="Components">
        {/* Buttons */}
        <SubHeading>Buttons</SubHeading>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 32,
          }}
        >
          <button
            style={{
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: fonts.sans,
              background: "var(--color-accent)",
              color: "var(--sf-white)",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Primary
          </button>
          <button
            style={{
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: fonts.sans,
              background: "var(--color-bg-secondary)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border-primary)",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Secondary
          </button>
          <button
            style={{
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: fonts.sans,
              background: "transparent",
              color: "var(--color-accent)",
              border: "1px solid var(--color-accent)",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Outline
          </button>
          <button
            style={{
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: fonts.sans,
              background: "transparent",
              color: "var(--color-text-secondary)",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Ghost
          </button>
        </div>

        {/* Cards */}
        <SubHeading>Cards</SubHeading>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              padding: 24,
              background: "var(--color-surface-primary)",
              border: "1px solid var(--color-border-primary)",
              borderRadius: 12,
            }}
          >
            <h4
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Default Card
            </h4>
            <p
              style={{
                fontSize: 14,
                color: "var(--color-text-secondary)",
                lineHeight: 1.5,
              }}
            >
              A basic card component using surface and border tokens for
              consistent styling.
            </p>
          </div>
          <div
            style={{
              padding: 24,
              background: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            <h4
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Elevated Card
            </h4>
            <p
              style={{
                fontSize: 14,
                color: "var(--color-text-secondary)",
                lineHeight: 1.5,
              }}
            >
              A card with elevation using box-shadow for depth and visual
              hierarchy.
            </p>
          </div>
        </div>

        {/* Badges */}
        <SubHeading>Badges</SubHeading>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 32,
          }}
        >
          {["TypeScript", "JavaScript", "Python", "Rust", "Go"].map((lang) => (
            <span
              key={lang}
              style={{
                display: "inline-block",
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 500,
                fontFamily: fonts.sans,
                background: "var(--color-bg-tertiary)",
                color: "var(--color-text-secondary)",
                borderRadius: 9999,
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              {lang}
            </span>
          ))}
        </div>

        {/* Input */}
        <SubHeading>Input</SubHeading>
        <div style={{ maxWidth: 400, marginBottom: 32 }}>
          <div
            style={{
              height: 44,
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              background: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border-primary)",
              borderRadius: 8,
              fontSize: 14,
              color: "var(--color-text-tertiary)",
            }}
          >
            Search tokens...
          </div>
        </div>

        {/* Glass Surface */}
        <SubHeading>Glass Surface</SubHeading>
        <div
          style={{
            padding: 24,
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: 12,
            marginBottom: 32,
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            This surface uses a translucent background with backdrop blur for a
            frosted glass effect. Useful for sticky headers, floating panels, and
            overlays.
          </p>
        </div>

        {/* Text Hierarchy */}
        <SubHeading>Text Hierarchy</SubHeading>
        <div
          style={{
            padding: 24,
            background: "var(--color-bg-secondary)",
            borderRadius: 12,
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              fontFamily: fonts.display,
              marginBottom: 4,
              color: "var(--color-text-primary)",
            }}
          >
            Heading
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "var(--color-text-primary)",
              marginBottom: 4,
            }}
          >
            Subheading with medium weight
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
              marginBottom: 4,
            }}
          >
            Body text using secondary color for comfortable reading on any
            background.
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--color-text-tertiary)",
            }}
          >
            Caption text — tertiary color for supplementary information
          </div>
        </div>
      </Section>

      {/* ──── FOOTER ──── */}
      <footer
        style={{
          marginTop: 64,
          paddingTop: 24,
          borderTop: "1px solid var(--color-border-primary)",
          fontSize: 13,
          color: "var(--color-text-tertiary)",
          textAlign: "center",
        }}
      >
        Extracted from {siteInfo.domain} — Design System Documentation
      </footer>
    </div>
  );
}
`;
