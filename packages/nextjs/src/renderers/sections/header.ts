import type { HeaderSectionData } from "@guataiba/isac-core";

export function renderHeader(s: HeaderSectionData): string {
  const navItems = (s.nav ?? [])
    .map((n: { text: string; url: string }) => `          <a href="${n.url}" style={{ color: "var(--color-text-primary)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>${n.text}</a>`)
    .join("\n");

  const cta = s.cta
    ? `          <a href="${s.cta.url}" style={{ backgroundColor: "var(--color-accent-primary)", color: "var(--color-accent-text)", padding: "8px 16px", borderRadius: "var(--radius-md, 8px)", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>${s.cta.text}</a>`
    : "";

  const logoContent = s.logo?.src
    ? `<img src="${s.logo.src}" alt="${s.logo.alt ?? s.logo.text ?? "Logo"}" style={{ height: 32 }} />`
    : `<span style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-primary)" }}>${s.logo?.text ?? ""}</span>`;

  return `    {/* ${s.id}: Header */}
    <header style={{ position: "${s.behavior === "sticky" ? "sticky" : "relative"}", top: 0, zIndex: 50, backgroundColor: "var(--color-${s.tokens?.bg ?? "bg-primary"})", borderBottom: "1px solid var(--color-border-primary)", padding: "16px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          ${logoContent}
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
${navItems}
${cta}
        </nav>
      </div>
    </header>`;
}
