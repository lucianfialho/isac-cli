import React from "react";
import { defineRegistry } from "@json-render/react";
import { dsCatalog } from "./ds-catalog.js";

const fonts = {
  sans: "var(--font-sans)",
  display: "var(--font-display, var(--font-sans))",
  mono: "var(--font-mono)",
};

function SectionWrapper({ title, children }: { title: string; children?: React.ReactNode }) {
  return React.createElement("section", { style: { marginBottom: 64 } },
    React.createElement("h2", {
      style: { fontFamily: fonts.sans, fontSize: 24, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid var(--color-border-primary)" },
    }, title),
    children,
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return React.createElement("h3", {
    style: { fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 16 },
  }, children);
}

export const { registry: dsRegistry } = defineRegistry(dsCatalog, {
  components: {
    DSPage: ({ props, children }) => {
      return React.createElement("div", {
        style: { maxWidth: 960, margin: "0 auto", padding: "48px 24px", fontFamily: fonts.sans, color: "var(--color-text-primary)" },
      }, children);
    },

    DSHeader: ({ props }) => {
      return React.createElement("header", { style: { marginBottom: 32 } },
        React.createElement("h1", {
          style: { fontFamily: fonts.display, fontSize: 48, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 },
        }, "Design System"),
        React.createElement("p", { style: { fontSize: 16, color: "var(--color-text-secondary)" } },
          "Tokens and components extracted from ",
          React.createElement("span", { style: { fontWeight: 600, color: "var(--color-text-primary)" } }, props.domain),
          " — with dark mode support",
        ),
      );
    },

    DSTabs: ({ props, children }) => {
      const [active, setActive] = React.useState(props.defaultTab ?? 0);
      const panels = React.Children.toArray(children);
      return React.createElement("div", null,
        React.createElement("nav", {
          style: { display: "flex", gap: 0, borderBottom: "1px solid var(--color-border-primary)", marginBottom: 40, overflowX: "auto" as const, WebkitOverflowScrolling: "touch" as const },
        },
          ...props.tabs.map((label: string, i: number) =>
            React.createElement("button", {
              key: label,
              onClick: () => setActive(i),
              style: {
                padding: "12px 20px", fontSize: 14, fontWeight: active === i ? 600 : 400, fontFamily: fonts.sans,
                color: active === i ? "var(--color-accent)" : "var(--color-text-secondary)",
                background: "transparent", border: "none", borderBottom: active === i ? "2px solid var(--color-accent)" : "2px solid transparent",
                cursor: "pointer", whiteSpace: "nowrap" as const, transition: "color 0.15s, border-color 0.15s",
                marginBottom: -1,
              },
            }, label),
          ),
        ),
        panels[active] ?? null,
      );
    },

    DSTabPanel: ({ props, children }) => {
      return React.createElement("div", null, children);
    },

    DSBrandIdentity: ({ props }) => {
      if (!props.logoUrl && !props.tagline && !props.description) return null;
      return React.createElement(SectionWrapper, { title: "Brand Identity" },
        React.createElement("div", {
          style: { display: "flex", flexDirection: "column" as const, gap: 20, padding: 32, background: "var(--color-bg-secondary)", borderRadius: 12, border: "1px solid var(--color-border-primary)" },
        },
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 20 } },
            props.logoUrl ? React.createElement("img", { src: props.logoUrl, alt: `${props.name} logo`, style: { height: 48, maxWidth: 200, objectFit: "contain" as const } }) : null,
            React.createElement("div", null,
              React.createElement("h3", { style: { fontFamily: fonts.display, fontSize: 28, fontWeight: 700, margin: 0, color: "var(--color-text-primary)" } }, props.name),
              props.tagline ? React.createElement("p", { style: { fontSize: 16, color: "var(--color-text-secondary)", margin: "4px 0 0" } }, props.tagline) : null,
            ),
          ),
          props.description ? React.createElement("p", { style: { fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0, maxWidth: 640 } }, props.description) : null,
          props.faviconUrl ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
            React.createElement("img", { src: props.faviconUrl, alt: "Favicon", style: { width: 24, height: 24 } }),
            React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 11, color: "var(--color-text-tertiary)" } }, props.faviconUrl),
          ) : null,
        ),
      );
    },

    DSColorPalette: ({ props }) => {
      return React.createElement(SectionWrapper, { title: props.title },
        props.subtitle ? React.createElement("p", { style: { fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 24 } }, props.subtitle) : null,
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 } },
          ...props.colors.map((c) =>
            React.createElement("div", { key: c.name, style: { border: "1px solid var(--color-border-primary)", borderRadius: 8, overflow: "hidden" } },
              React.createElement("div", { style: { height: 56, background: c.hex, borderBottom: "1px solid var(--color-border-primary)" } }),
              React.createElement("div", { style: { padding: "8px 10px" } },
                React.createElement("div", { style: { fontSize: 12, fontWeight: 600, marginBottom: 2 } }, c.name),
                React.createElement("code", { style: { fontSize: 10, color: "var(--color-text-secondary)", fontFamily: fonts.mono } }, c.varName),
                React.createElement("div", { style: { fontSize: 10, color: "var(--color-text-tertiary)", fontFamily: fonts.mono, marginTop: 2 } }, c.hex),
              ),
            ),
          ),
        ),
      );
    },

    DSSemanticTokens: ({ props }) => {
      return React.createElement(SectionWrapper, { title: props.title },
        props.subtitle ? React.createElement("p", { style: { fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 32 } }, props.subtitle) : null,
        ...props.groups.map((group) =>
          React.createElement("div", { key: group.category, style: { marginBottom: 40 } },
            React.createElement(SubHeading, null, group.category),
            React.createElement("div", { style: { border: "1px solid var(--color-border-primary)", borderRadius: 8, overflow: "hidden" } },
              React.createElement("div", {
                style: { display: "grid", gridTemplateColumns: "1fr 56px 120px 56px 120px", gap: 0, padding: "8px 16px", background: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border-primary)", fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.05em" },
              },
                React.createElement("span", null, "Token"),
                React.createElement("span", { style: { textAlign: "center" as const } }, "Light"),
                React.createElement("span", null, "Reference"),
                React.createElement("span", { style: { textAlign: "center" as const } }, "Dark"),
                React.createElement("span", null, "Reference"),
              ),
              ...group.tokens.map((t) =>
                React.createElement("div", {
                  key: t.name,
                  style: { display: "grid", gridTemplateColumns: "1fr 56px 120px 56px 120px", gap: 0, padding: "10px 16px", borderBottom: "1px solid var(--color-border-subtle)", alignItems: "center", fontSize: 13 },
                },
                  React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 12, color: "var(--color-text-primary)" } }, t.varName),
                  React.createElement("div", { style: { display: "flex", justifyContent: "center" } },
                    React.createElement("div", { style: { width: 32, height: 32, borderRadius: 6, background: t.lightHex, border: "1px solid var(--color-border-primary)" } }),
                  ),
                  React.createElement("div", null,
                    React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 11, color: "var(--color-text-secondary)", display: "block" } }, t.lightRef),
                    React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 10, color: "var(--color-text-tertiary)" } }, t.lightHex),
                  ),
                  React.createElement("div", { style: { display: "flex", justifyContent: "center" } },
                    React.createElement("div", { style: { width: 32, height: 32, borderRadius: 6, background: t.darkHex, border: "1px solid var(--color-border-primary)" } }),
                  ),
                  React.createElement("div", null,
                    React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 11, color: "var(--color-text-secondary)", display: "block" } }, t.darkRef),
                    React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 10, color: "var(--color-text-tertiary)" } }, t.darkHex),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    },

    DSTypography: ({ props }) => {
      return React.createElement(SectionWrapper, { title: props.title },
        React.createElement(SubHeading, null, "Font Families"),
        React.createElement("div", { style: { marginBottom: 32 } },
          ...props.families.map((f) =>
            React.createElement("div", { key: f.key, style: { display: "flex", flexDirection: "column" as const, gap: 8, padding: 16, borderBottom: "1px solid var(--color-border-subtle)" } },
              React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)" } }, `--font-${f.key}`),
                React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 11, color: "var(--color-text-tertiary)", background: "var(--color-bg-tertiary)", padding: "2px 8px", borderRadius: 4, maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const } }, f.stack),
              ),
              React.createElement("span", { style: { fontFamily: `var(--font-${f.key}, ${f.stack})`, fontSize: 20 } }, "The quick brown fox jumps over the lazy dog"),
            ),
          ),
        ),
        React.createElement(SubHeading, null, "Size Scale"),
        React.createElement("div", { style: { marginBottom: 32 } },
          ...props.sizes.map((fs) =>
            React.createElement("div", { key: fs.label, style: { display: "flex", alignItems: "baseline", gap: 16, padding: "8px 0", borderBottom: "1px solid var(--color-border-subtle)" } },
              React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 13, color: "var(--color-text-secondary)", minWidth: 80 } }, fs.label),
              React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 12, color: "var(--color-text-tertiary)", minWidth: 60 } }, fs.size),
              React.createElement("span", { style: { fontFamily: fonts.sans, fontSize: fs.size } }, fs.sample),
            ),
          ),
        ),
        React.createElement(SubHeading, null, "Weights"),
        React.createElement("div", { style: { marginBottom: 32 } },
          ...props.weights.map((fw) =>
            React.createElement("div", { key: fw.label, style: { display: "flex", alignItems: "center", gap: 16, padding: "8px 0", borderBottom: "1px solid var(--color-border-subtle)" } },
              React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 13, color: "var(--color-text-secondary)", minWidth: 100 } }, fw.label),
              React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 12, color: "var(--color-text-tertiary)", minWidth: 40 } }, String(fw.weight)),
              React.createElement("span", { style: { fontFamily: fonts.sans, fontSize: 18, fontWeight: fw.weight } }, "The quick brown fox jumps over the lazy dog"),
            ),
          ),
        ),
      );
    },

    DSSpacing: ({ props }) => {
      if (props.items.length === 0) return null;
      return React.createElement(SectionWrapper, { title: props.title },
        React.createElement("div", { style: { display: "flex", flexDirection: "column" as const, gap: 6 } },
          ...props.items.map((s) =>
            React.createElement("div", { key: s.label, style: { display: "flex", alignItems: "center", gap: 16 } },
              React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 12, color: "var(--color-text-secondary)", minWidth: 48, textAlign: "right" as const } }, s.label),
              React.createElement("div", { style: { height: 16, width: s.px, background: "var(--color-accent)", borderRadius: 4, minWidth: 4 } }),
              React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 11, color: "var(--color-text-tertiary)" } }, s.px),
            ),
          ),
        ),
      );
    },

    DSRadii: ({ props }) => {
      return React.createElement(SectionWrapper, { title: props.title },
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16 } },
          ...props.items.map((r) =>
            React.createElement("div", { key: r.label, style: { textAlign: "center" as const } },
              React.createElement("div", { style: { width: 80, height: 80, margin: "0 auto 8px", background: "var(--color-accent)", borderRadius: r.value, opacity: 0.8 } }),
              React.createElement("div", { style: { fontSize: 13, fontWeight: 600 } }, r.label),
              React.createElement("code", { style: { fontSize: 11, color: "var(--color-text-secondary)", fontFamily: fonts.mono } }, r.value),
            ),
          ),
        ),
      );
    },

    DSShadows: ({ props }) => {
      if (props.items.length === 0) return null;
      return React.createElement(SectionWrapper, { title: props.title },
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 } },
          ...props.items.map((s) =>
            React.createElement("div", { key: s.label, style: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 12 } },
              React.createElement("div", { style: { width: "100%", height: 80, background: "var(--color-bg-secondary)", borderRadius: 12, boxShadow: s.value, border: "1px solid var(--color-border-subtle)" } }),
              React.createElement("div", { style: { textAlign: "center" as const } },
                React.createElement("div", { style: { fontSize: 13, fontWeight: 600 } }, s.label),
                React.createElement("code", { style: { fontSize: 10, color: "var(--color-text-tertiary)", fontFamily: fonts.mono } }, s.value),
              ),
            ),
          ),
        ),
      );
    },

    DSBackgrounds: ({ props }) => {
      return React.createElement(SectionWrapper, { title: props.title },
        // Page background
        React.createElement(SubHeading, null, "Page Background"),
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 16, marginBottom: 32, padding: 16, border: "1px solid var(--color-border-primary)", borderRadius: 8 } },
          React.createElement("div", { style: { width: 64, height: 64, borderRadius: 8, background: props.pageBackground, border: "1px solid var(--color-border-primary)", flexShrink: 0 } }),
          React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 14, fontWeight: 600, marginBottom: 4 } }, "Page Background"),
            React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 12, color: "var(--color-text-secondary)" } }, props.pageBackground),
          ),
        ),
        // Section backgrounds
        React.createElement(SubHeading, null, "Section Backgrounds"),
        props.sections.length === 0
          ? React.createElement("p", { style: { fontSize: 14, color: "var(--color-text-tertiary)", fontStyle: "italic" as const } }, "No distinct section backgrounds detected.")
          : React.createElement("div", { style: { display: "flex", flexDirection: "column" as const, gap: 16 } },
              ...props.sections.map((sec, i) => {
                const bgStyle: Record<string, string> = {};
                if (sec.bgGradient) {
                  bgStyle.background = sec.bgGradient;
                } else if (sec.bgColor) {
                  bgStyle.background = sec.bgColor;
                }
                if (sec.bgImage && !sec.bgGradient) {
                  bgStyle.backgroundImage = sec.bgImage;
                  bgStyle.backgroundSize = "cover";
                  bgStyle.backgroundPosition = "center";
                }

                return React.createElement("div", {
                  key: `${sec.label}-${i}`,
                  style: { border: "1px solid var(--color-border-primary)", borderRadius: 12, overflow: "hidden" },
                },
                  // Preview bar
                  React.createElement("div", {
                    style: {
                      height: 80,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative" as const,
                      ...bgStyle,
                    },
                  },
                    sec.textColor
                      ? React.createElement("span", { style: { fontSize: 16, fontWeight: 600, fontFamily: fonts.display, color: sec.textColor, position: "relative" as const, zIndex: 1 } }, sec.label)
                      : React.createElement("span", { style: { fontSize: 16, fontWeight: 600, fontFamily: fonts.display, color: "var(--color-text-primary)", position: "relative" as const, zIndex: 1 } }, sec.label),
                    sec.hasOverlay ? React.createElement("div", { style: { position: "absolute" as const, top: 0, right: 8, fontSize: 10, color: "var(--color-text-tertiary)", padding: "4px 8px", background: "var(--color-bg-primary)", borderRadius: "0 0 4px 4px", opacity: 0.8 } }, "overlay") : null,
                  ),
                  // Details
                  React.createElement("div", { style: { padding: "12px 16px", display: "flex", flexWrap: "wrap" as const, gap: 16, fontSize: 12 } },
                    sec.bgColor ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
                      React.createElement("div", { style: { width: 16, height: 16, borderRadius: 4, background: sec.bgColor, border: "1px solid var(--color-border-subtle)", flexShrink: 0 } }),
                      React.createElement("code", { style: { fontFamily: fonts.mono, color: "var(--color-text-secondary)" } }, sec.bgColor),
                    ) : null,
                    sec.bgGradient ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
                      React.createElement("div", { style: { width: 32, height: 16, borderRadius: 4, background: sec.bgGradient, border: "1px solid var(--color-border-subtle)", flexShrink: 0 } }),
                      React.createElement("code", { style: { fontFamily: fonts.mono, color: "var(--color-text-secondary)", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, display: "block" } }, "gradient"),
                    ) : null,
                    sec.textColor ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
                      React.createElement("span", { style: { fontSize: 11, color: "var(--color-text-tertiary)" } }, "text:"),
                      React.createElement("div", { style: { width: 16, height: 16, borderRadius: 4, background: sec.textColor, border: "1px solid var(--color-border-subtle)", flexShrink: 0 } }),
                      React.createElement("code", { style: { fontFamily: fonts.mono, color: "var(--color-text-secondary)" } }, sec.textColor),
                    ) : null,
                    sec.bgImage ? React.createElement("span", { style: { fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: fonts.mono, padding: "2px 8px", background: "var(--color-bg-tertiary)", borderRadius: 4 } }, "has background-image") : null,
                    sec.hasOverlay ? React.createElement("span", { style: { fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: fonts.mono, padding: "2px 8px", background: "var(--color-bg-tertiary)", borderRadius: 4 } }, "has overlay") : null,
                  ),
                );
              }),
            ),
      );
    },

    DSComponents: ({ props }) => {
      return React.createElement(SectionWrapper, { title: props.title },
        // Buttons
        React.createElement(SubHeading, null, "Buttons"),
        React.createElement("div", { style: { display: "flex", flexWrap: "wrap" as const, gap: 12, marginBottom: 32 } },
          React.createElement("button", { style: { padding: "10px 24px", fontSize: 14, fontWeight: 600, fontFamily: fonts.sans, background: "var(--color-accent)", color: "var(--sf-white)", border: "none", borderRadius: 8, cursor: "pointer" } }, "Primary"),
          React.createElement("button", { style: { padding: "10px 24px", fontSize: 14, fontWeight: 600, fontFamily: fonts.sans, background: "var(--color-bg-secondary)", color: "var(--color-text-primary)", border: "1px solid var(--color-border-primary)", borderRadius: 8, cursor: "pointer" } }, "Secondary"),
          React.createElement("button", { style: { padding: "10px 24px", fontSize: 14, fontWeight: 600, fontFamily: fonts.sans, background: "transparent", color: "var(--color-accent)", border: "1px solid var(--color-accent)", borderRadius: 8, cursor: "pointer" } }, "Outline"),
          React.createElement("button", { style: { padding: "10px 24px", fontSize: 14, fontWeight: 600, fontFamily: fonts.sans, background: "transparent", color: "var(--color-text-secondary)", border: "none", borderRadius: 8, cursor: "pointer", textDecoration: "underline" } }, "Ghost"),
        ),
        // Cards
        React.createElement(SubHeading, null, "Cards"),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 32 } },
          React.createElement("div", { style: { padding: 24, background: "var(--color-bg-primary)", border: "1px solid var(--color-border-primary)", borderRadius: 12 } },
            React.createElement("h4", { style: { fontSize: 16, fontWeight: 600, marginBottom: 8 } }, "Default Card"),
            React.createElement("p", { style: { fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.5 } }, "A basic card component using surface and border tokens for consistent styling."),
          ),
          React.createElement("div", { style: { padding: 24, background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-subtle)", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" } },
            React.createElement("h4", { style: { fontSize: 16, fontWeight: 600, marginBottom: 8 } }, "Elevated Card"),
            React.createElement("p", { style: { fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.5 } }, "A card with elevation using box-shadow for depth and visual hierarchy."),
          ),
        ),
        // Badges
        React.createElement(SubHeading, null, "Badges"),
        React.createElement("div", { style: { display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 32 } },
          ...["TypeScript", "JavaScript", "Python", "Rust", "Go"].map((lang) =>
            React.createElement("span", { key: lang, style: { display: "inline-block", padding: "4px 12px", fontSize: 12, fontWeight: 500, fontFamily: fonts.sans, background: "var(--color-bg-tertiary)", color: "var(--color-text-secondary)", borderRadius: 9999, border: "1px solid var(--color-border-subtle)" } }, lang),
          ),
        ),
        // Input
        React.createElement(SubHeading, null, "Input"),
        React.createElement("div", { style: { maxWidth: 400, marginBottom: 32 } },
          React.createElement("div", { style: { height: 44, padding: "0 16px", display: "flex", alignItems: "center", background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-primary)", borderRadius: 8, fontSize: 14, color: "var(--color-text-tertiary)" } }, "Search tokens..."),
        ),
        // Text Hierarchy
        React.createElement(SubHeading, null, "Text Hierarchy"),
        React.createElement("div", { style: { padding: 24, background: "var(--color-bg-secondary)", borderRadius: 12, border: "1px solid var(--color-border-subtle)" } },
          React.createElement("div", { style: { fontSize: 24, fontWeight: 700, fontFamily: fonts.display, marginBottom: 4, color: "var(--color-text-primary)" } }, "Heading"),
          React.createElement("div", { style: { fontSize: 16, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 4 } }, "Subheading with medium weight"),
          React.createElement("div", { style: { fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 4 } }, "Body text using secondary color for comfortable reading on any background."),
          React.createElement("div", { style: { fontSize: 12, color: "var(--color-text-tertiary)" } }, "Caption text — tertiary color for supplementary information"),
        ),
      );
    },

    DSIcons: ({ props }) => {
      if (props.count === 0) return null;
      return React.createElement(SectionWrapper, { title: props.title },
        React.createElement("div", { style: { marginBottom: 16, display: "flex", alignItems: "center", gap: 12 } },
          React.createElement("span", { style: { display: "inline-block", padding: "4px 12px", fontSize: 12, fontWeight: 600, fontFamily: fonts.mono, background: "var(--color-bg-tertiary)", color: "var(--color-text-secondary)", borderRadius: 6, border: "1px solid var(--color-border-subtle)" } }, props.library),
          React.createElement("span", { style: { fontSize: 13, color: "var(--color-text-tertiary)" } }, `${props.count} icon elements detected`),
        ),
        props.names.length > 0 ? React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 } },
          ...props.names.map((name) =>
            React.createElement("div", { key: name, style: { padding: "8px 12px", fontSize: 12, fontFamily: fonts.mono, color: "var(--color-text-primary)", background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-subtle)", borderRadius: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const } }, name),
          ),
        ) : null,
      );
    },

    DSExamplesHeader: ({ props }) => {
      return React.createElement("div", { style: { marginTop: 80, marginBottom: 48, textAlign: "center" as const } },
        React.createElement("div", { style: { width: 48, height: 2, background: "var(--color-accent)", margin: "0 auto 24px", borderRadius: 1 } }),
        React.createElement("h2", { style: { fontFamily: fonts.display, fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12, color: "var(--color-text-primary)" } }, props.title),
        React.createElement("p", { style: { fontSize: 16, color: "var(--color-text-secondary)", maxWidth: 560, margin: "0 auto" } }, props.subtitle),
      );
    },

    DSHeroExample: ({ props }) => {
      return React.createElement("section", {
        style: { padding: "80px 40px", background: "var(--color-bg-secondary)", borderRadius: 16, border: "1px solid var(--color-border-primary)", marginBottom: 32, textAlign: "center" as const, position: "relative" as const, overflow: "hidden" },
      },
        React.createElement("div", { style: { position: "absolute" as const, top: -80, right: -80, width: 200, height: 200, borderRadius: "50%", background: "var(--color-accent)", opacity: 0.06 } }),
        React.createElement("div", { style: { position: "absolute" as const, bottom: -60, left: -60, width: 160, height: 160, borderRadius: "50%", background: "var(--color-accent)", opacity: 0.04 } }),
        React.createElement("div", { style: { position: "relative" as const, zIndex: 1 } },
          React.createElement("span", { style: { display: "inline-block", padding: "6px 16px", fontSize: 12, fontWeight: 600, fontFamily: fonts.mono, background: "var(--color-bg-tertiary)", color: "var(--color-accent)", borderRadius: 9999, border: "1px solid var(--color-border-subtle)", marginBottom: 24 } }, "Hero Section"),
          React.createElement("h1", { style: { fontFamily: fonts.display, fontSize: 48, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 16, color: "var(--color-text-primary)", maxWidth: 640, margin: "0 auto 16px" } },
            `Build something amazing with ${props.siteName}`,
          ),
          React.createElement("p", { style: { fontSize: 18, color: "var(--color-text-secondary)", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 32px" } },
            props.tagline || "The modern platform for teams who ship fast. Start building today with our design system.",
          ),
          React.createElement("div", { style: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const } },
            React.createElement("button", { style: { padding: "12px 32px", fontSize: 15, fontWeight: 600, fontFamily: fonts.sans, background: "var(--color-accent)", color: "var(--sf-white)", border: "none", borderRadius: 8, cursor: "pointer" } }, "Get Started"),
            React.createElement("button", { style: { padding: "12px 32px", fontSize: 15, fontWeight: 600, fontFamily: fonts.sans, background: "transparent", color: "var(--color-text-primary)", border: "1px solid var(--color-border-primary)", borderRadius: 8, cursor: "pointer" } }, "Learn More"),
          ),
        ),
      );
    },

    DSFeatureGridExample: ({ props }) => {
      const features = [
        { title: "Lightning Fast", desc: "Optimized for speed with instant page loads and smooth transitions." },
        { title: "Fully Responsive", desc: "Looks great on every device, from mobile to ultra-wide displays." },
        { title: "Dark Mode Ready", desc: "Built-in dark mode support with semantic token switching." },
        { title: "Type Safe", desc: "End-to-end type safety with TypeScript and validated schemas." },
        { title: "Accessible", desc: "WCAG 2.1 compliant with keyboard navigation and screen reader support." },
        { title: "Customizable", desc: "Extend and override any token to match your brand identity." },
      ];
      return React.createElement("section", { style: { marginBottom: 32 } },
        React.createElement("div", { style: { textAlign: "center" as const, marginBottom: 40 } },
          React.createElement("span", { style: { display: "inline-block", padding: "6px 16px", fontSize: 12, fontWeight: 600, fontFamily: fonts.mono, background: "var(--color-bg-tertiary)", color: "var(--color-accent)", borderRadius: 9999, border: "1px solid var(--color-border-subtle)", marginBottom: 16 } }, "Feature Grid"),
          React.createElement("h2", { style: { fontFamily: fonts.display, fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-text-primary)", marginBottom: 8 } }, "Everything you need"),
          React.createElement("p", { style: { fontSize: 16, color: "var(--color-text-secondary)" } }, "A complete toolkit for building production-ready interfaces."),
        ),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 } },
          ...features.map((f) =>
            React.createElement("div", { key: f.title, style: { padding: 24, background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-primary)", borderRadius: 12 } },
              React.createElement("div", { style: { width: 40, height: 40, borderRadius: 10, background: "var(--color-accent)", opacity: 0.1, marginBottom: 16 } }),
              React.createElement("h3", { style: { fontSize: 16, fontWeight: 600, fontFamily: fonts.sans, color: "var(--color-text-primary)", marginBottom: 8 } }, f.title),
              React.createElement("p", { style: { fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 } }, f.desc),
            ),
          ),
        ),
      );
    },

    DSPricingExample: ({ props }) => {
      const plans = [
        { name: "Starter", price: "$0", period: "/month", desc: "For personal projects", features: ["5 projects", "Basic analytics", "Community support"], cta: "Start Free", highlighted: false },
        { name: "Pro", price: "$29", period: "/month", desc: "For growing teams", features: ["Unlimited projects", "Advanced analytics", "Priority support", "Custom domains", "Team collaboration"], cta: "Get Started", highlighted: true },
        { name: "Enterprise", price: "Custom", period: "", desc: "For large organizations", features: ["Everything in Pro", "SSO & SAML", "Dedicated support", "SLA guarantee", "Custom integrations"], cta: "Contact Sales", highlighted: false },
      ];
      return React.createElement("section", { style: { marginBottom: 32 } },
        React.createElement("div", { style: { textAlign: "center" as const, marginBottom: 40 } },
          React.createElement("span", { style: { display: "inline-block", padding: "6px 16px", fontSize: 12, fontWeight: 600, fontFamily: fonts.mono, background: "var(--color-bg-tertiary)", color: "var(--color-accent)", borderRadius: 9999, border: "1px solid var(--color-border-subtle)", marginBottom: 16 } }, "Pricing Table"),
          React.createElement("h2", { style: { fontFamily: fonts.display, fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-text-primary)", marginBottom: 8 } }, "Simple, transparent pricing"),
          React.createElement("p", { style: { fontSize: 16, color: "var(--color-text-secondary)" } }, "Choose the plan that fits your needs."),
        ),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, alignItems: "start" } },
          ...plans.map((p) =>
            React.createElement("div", {
              key: p.name,
              style: {
                padding: 32, borderRadius: 16, border: p.highlighted ? "2px solid var(--color-accent)" : "1px solid var(--color-border-primary)",
                background: p.highlighted ? "var(--color-bg-secondary)" : "var(--color-bg-primary)",
                boxShadow: p.highlighted ? "0 8px 32px rgba(0,0,0,0.08)" : "none",
                position: "relative" as const,
              },
            },
              p.highlighted ? React.createElement("span", { style: { position: "absolute" as const, top: -12, left: "50%", transform: "translateX(-50%)", padding: "4px 16px", fontSize: 11, fontWeight: 700, fontFamily: fonts.sans, background: "var(--color-accent)", color: "var(--sf-white)", borderRadius: 9999, textTransform: "uppercase" as const, letterSpacing: "0.05em" } }, "Popular") : null,
              React.createElement("h3", { style: { fontSize: 18, fontWeight: 600, fontFamily: fonts.sans, color: "var(--color-text-primary)", marginBottom: 4 } }, p.name),
              React.createElement("p", { style: { fontSize: 13, color: "var(--color-text-tertiary)", marginBottom: 16 } }, p.desc),
              React.createElement("div", { style: { marginBottom: 24 } },
                React.createElement("span", { style: { fontSize: 40, fontWeight: 700, fontFamily: fonts.display, color: "var(--color-text-primary)", letterSpacing: "-0.02em" } }, p.price),
                React.createElement("span", { style: { fontSize: 14, color: "var(--color-text-tertiary)" } }, p.period),
              ),
              React.createElement("ul", { style: { listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column" as const, gap: 10 } },
                ...p.features.map((feat) =>
                  React.createElement("li", { key: feat, style: { fontSize: 14, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 8 } },
                    React.createElement("span", { style: { width: 16, height: 16, borderRadius: 8, background: "var(--color-accent)", opacity: 0.15, flexShrink: 0 } }),
                    feat,
                  ),
                ),
              ),
              React.createElement("button", {
                style: {
                  width: "100%", padding: "12px 24px", fontSize: 14, fontWeight: 600, fontFamily: fonts.sans, borderRadius: 8, cursor: "pointer", border: "none",
                  background: p.highlighted ? "var(--color-accent)" : "var(--color-bg-tertiary)",
                  color: p.highlighted ? "var(--sf-white)" : "var(--color-text-primary)",
                },
              }, p.cta),
            ),
          ),
        ),
      );
    },

    DSTestimonialsExample: ({ props }) => {
      const testimonials = [
        { name: "Sarah Chen", role: "Engineering Lead", text: "The design system saved us weeks of work. Every component just works out of the box." },
        { name: "Marcus Rodriguez", role: "Product Designer", text: "Perfect color tokens and typography scale. Dark mode was effortless to implement." },
        { name: "Alex Kim", role: "Frontend Developer", text: "Type-safe tokens and consistent spacing made our codebase so much cleaner." },
      ];
      return React.createElement("section", { style: { marginBottom: 32 } },
        React.createElement("div", { style: { textAlign: "center" as const, marginBottom: 40 } },
          React.createElement("span", { style: { display: "inline-block", padding: "6px 16px", fontSize: 12, fontWeight: 600, fontFamily: fonts.mono, background: "var(--color-bg-tertiary)", color: "var(--color-accent)", borderRadius: 9999, border: "1px solid var(--color-border-subtle)", marginBottom: 16 } }, "Testimonials"),
          React.createElement("h2", { style: { fontFamily: fonts.display, fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-text-primary)", marginBottom: 8 } }, "Loved by teams"),
        ),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 } },
          ...testimonials.map((t) =>
            React.createElement("div", { key: t.name, style: { padding: 28, background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-primary)", borderRadius: 12 } },
              React.createElement("p", { style: { fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.7, margin: "0 0 20px", fontStyle: "italic" as const } }, `"${t.text}"`),
              React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
                React.createElement("div", { style: { width: 36, height: 36, borderRadius: 18, background: "var(--color-accent)", opacity: 0.15 } }),
                React.createElement("div", null,
                  React.createElement("div", { style: { fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" } }, t.name),
                  React.createElement("div", { style: { fontSize: 12, color: "var(--color-text-tertiary)" } }, t.role),
                ),
              ),
            ),
          ),
        ),
      );
    },

    DSCTAExample: ({ props }) => {
      return React.createElement("section", {
        style: { padding: "64px 40px", background: "var(--color-bg-secondary)", borderRadius: 16, border: "1px solid var(--color-border-primary)", textAlign: "center" as const, marginBottom: 32, position: "relative" as const, overflow: "hidden" },
      },
        React.createElement("div", { style: { position: "absolute" as const, inset: 0, background: "linear-gradient(135deg, var(--color-accent), transparent)", opacity: 0.03 } }),
        React.createElement("div", { style: { position: "relative" as const, zIndex: 1 } },
          React.createElement("span", { style: { display: "inline-block", padding: "6px 16px", fontSize: 12, fontWeight: 600, fontFamily: fonts.mono, background: "var(--color-bg-tertiary)", color: "var(--color-accent)", borderRadius: 9999, border: "1px solid var(--color-border-subtle)", marginBottom: 20 } }, "CTA Section"),
          React.createElement("h2", { style: { fontFamily: fonts.display, fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-text-primary)", marginBottom: 12 } }, `Ready to build with ${props.siteName}?`),
          React.createElement("p", { style: { fontSize: 16, color: "var(--color-text-secondary)", maxWidth: 440, margin: "0 auto 28px", lineHeight: 1.6 } },
            "Start using the design system today. Ship faster, stay consistent.",
          ),
          React.createElement("div", { style: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const } },
            React.createElement("button", { style: { padding: "12px 32px", fontSize: 15, fontWeight: 600, fontFamily: fonts.sans, background: "var(--color-accent)", color: "var(--sf-white)", border: "none", borderRadius: 8, cursor: "pointer" } }, "Get Started Free"),
            React.createElement("button", { style: { padding: "12px 32px", fontSize: 15, fontWeight: 600, fontFamily: fonts.sans, background: "transparent", color: "var(--color-text-primary)", border: "1px solid var(--color-border-primary)", borderRadius: 8, cursor: "pointer" } }, "View Documentation"),
          ),
        ),
      );
    },

    DSFooter: ({ props }) => {
      return React.createElement("footer", {
        style: { marginTop: 64, paddingTop: 24, borderTop: "1px solid var(--color-border-primary)", fontSize: 13, color: "var(--color-text-tertiary)", textAlign: "center" as const },
      }, `Extracted from ${props.domain} — Design System Documentation`);
    },
  },
});
