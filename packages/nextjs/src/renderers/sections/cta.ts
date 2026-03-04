import type { CTASectionData } from "@guataiba/isac-core";

export function renderCTA(s: CTASectionData): string {
  const secondaryCta = s.secondaryCta
    ? `          <a href="${s.secondaryCta.url}" style={{ border: "1px solid var(--color-border-primary)", color: "var(--color-text-primary)", padding: "12px 24px", borderRadius: "var(--radius-md, 8px)", textDecoration: "none", fontSize: "16px", fontWeight: 500 }}>${s.secondaryCta.text}</a>`
    : "";

  return `    {/* ${s.id}: CTA */}
    <section style={{ backgroundColor: "var(--color-${s.tokens?.bg ?? "bg-secondary"})", padding: "64px 0" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "32px", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 12px", fontFamily: "var(--font-display)" }}>${s.heading}</h2>
${s.subheading ? `        <p style={{ fontSize: "16px", color: "var(--color-text-secondary)", margin: "0 0 32px" }}>${s.subheading}</p>` : ""}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="${s.cta.url}" style={{ backgroundColor: "var(--color-accent-primary)", color: "var(--color-accent-text)", padding: "12px 24px", borderRadius: "var(--radius-md, 8px)", textDecoration: "none", fontSize: "16px", fontWeight: 600 }}>${s.cta.text}</a>
${secondaryCta}
        </div>
      </div>
    </section>`;
}
