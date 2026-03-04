import type { FeatureGridSectionData } from "@guataiba/isac-core";

export function renderFeatureGrid(s: FeatureGridSectionData): string {
  const items = s.items
    .map((item: { icon?: string; title: string; description: string }) => `          <div style={{ flex: "1 1 280px", padding: 24, backgroundColor: "var(--color-surface-primary)", borderRadius: "var(--radius-lg, 12px)", border: "1px solid var(--color-border-primary)" }}>
${item.icon ? `            <div style={{ fontSize: "24px", marginBottom: 12 }}>${item.icon}</div>` : ""}
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 8px" }}>${item.title}</h3>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.6 }}>${item.description}</p>
          </div>`)
    .join("\n");

  return `    {/* ${s.id}: FeatureGrid */}
    <section style={{ backgroundColor: "var(--color-${s.tokens?.bg ?? "bg-primary"})", padding: "64px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
${s.heading ? `        <h2 style={{ fontSize: "32px", fontWeight: 700, color: "var(--color-text-primary)", textAlign: "center", margin: "0 0 12px", fontFamily: "var(--font-display)" }}>${s.heading}</h2>` : ""}
${s.subheading ? `        <p style={{ fontSize: "16px", color: "var(--color-text-secondary)", textAlign: "center", margin: "0 0 40px", maxWidth: 600, marginInline: "auto" }}>${s.subheading}</p>` : ""}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
${items}
        </div>
      </div>
    </section>`;
}
