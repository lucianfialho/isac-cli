import type { HeroSectionData } from "@guataiba/isac-core";

export function renderHero(s: HeroSectionData): string {
  const badge = s.badge
    ? `        <span style={{ display: "inline-block", backgroundColor: "var(--color-surface-primary)", color: "var(--color-accent-primary)", padding: "4px 12px", borderRadius: "9999px", fontSize: "13px", fontWeight: 600, marginBottom: 16 }}>${s.badge}</span>`
    : "";

  const image = s.image
    ? `        <img src="${s.image.src}" alt="${s.image.alt}" style={{ maxWidth: "100%", borderRadius: "var(--radius-lg, 12px)" }} />`
    : "";

  const cta = s.cta
    ? `          <a href="${s.cta.url}" style={{ backgroundColor: "var(--color-accent-primary)", color: "var(--color-accent-text)", padding: "12px 24px", borderRadius: "var(--radius-md, 8px)", textDecoration: "none", fontSize: "16px", fontWeight: 600 }}>${s.cta.text}</a>`
    : "";

  const secondaryCta = s.secondaryCta
    ? `          <a href="${s.secondaryCta.url}" style={{ border: "1px solid var(--color-border-primary)", color: "var(--color-text-primary)", padding: "12px 24px", borderRadius: "var(--radius-md, 8px)", textDecoration: "none", fontSize: "16px", fontWeight: 500 }}>${s.secondaryCta.text}</a>`
    : "";

  return `    {/* ${s.id}: Hero */}
    <section style={{ backgroundColor: "var(--color-${s.tokens?.bg ?? "bg-primary"})", padding: "80px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
${badge}
        <h1 style={{ fontSize: "48px", fontWeight: 700, color: "var(--color-${s.tokens?.heading ?? "text-primary"})", margin: "0 0 16px", fontFamily: "var(--font-display)" }}>${s.headline}</h1>
${s.subheadline ? `        <p style={{ fontSize: "20px", color: "var(--color-${s.tokens?.body ?? "text-secondary"})", margin: "0 0 32px", maxWidth: 640, marginInline: "auto" }}>${s.subheadline}</p>` : ""}
${(cta || secondaryCta) ? `        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>\n${cta}\n${secondaryCta}\n        </div>` : ""}
${image}
      </div>
    </section>`;
}
