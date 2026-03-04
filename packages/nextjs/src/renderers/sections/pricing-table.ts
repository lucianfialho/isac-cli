import type { PricingTableSectionData } from "@guataiba/isac-core";

export function renderPricingTable(s: PricingTableSectionData): string {
  const plans = s.plans
    .map((plan: { name: string; price: string; period?: string; description?: string; features: string[]; cta?: { text: string; url: string }; highlighted?: boolean }) => {
      const features = plan.features
        .map((f: string) => `              <li style={{ padding: "6px 0", fontSize: "14px", color: "var(--color-text-secondary)" }}>${f}</li>`)
        .join("\n");

      const highlight = plan.highlighted
        ? `border: "2px solid var(--color-accent-primary)", `
        : `border: "1px solid var(--color-border-primary)", `;

      return `          <div style={{ flex: "1 1 280px", maxWidth: 360, padding: 32, backgroundColor: "var(--color-surface-primary)", borderRadius: "var(--radius-lg, 12px)", ${highlight}display: "flex", flexDirection: "column" }}>
${plan.highlighted ? `            <span style={{ display: "inline-block", backgroundColor: "var(--color-accent-primary)", color: "var(--color-accent-text)", padding: "2px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600, marginBottom: 12, alignSelf: "flex-start" }}>Popular</span>` : ""}
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 8px" }}>${plan.name}</h3>
${plan.description ? `            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: "0 0 16px" }}>${plan.description}</p>` : ""}
            <div style={{ fontSize: "36px", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 4px" }}>${plan.price}</div>
${plan.period ? `            <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: 24 }}>${plan.period}</div>` : ""}
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", flex: 1 }}>
${features}
            </ul>
${plan.cta ? `            <a href="${plan.cta.url}" style={{ display: "block", textAlign: "center", backgroundColor: ${plan.highlighted ? '"var(--color-accent-primary)"' : '"transparent"'}, color: ${plan.highlighted ? '"var(--color-accent-text)"' : '"var(--color-accent-primary)"'}, border: "1px solid var(--color-accent-primary)", padding: "10px 20px", borderRadius: "var(--radius-md, 8px)", textDecoration: "none", fontWeight: 600, fontSize: "14px" }}>${plan.cta.text}</a>` : ""}
          </div>`;
    })
    .join("\n");

  return `    {/* ${s.id}: PricingTable */}
    <section style={{ backgroundColor: "var(--color-${s.tokens?.bg ?? "bg-primary"})", padding: "64px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
${s.heading ? `        <h2 style={{ fontSize: "32px", fontWeight: 700, color: "var(--color-text-primary)", textAlign: "center", margin: "0 0 12px", fontFamily: "var(--font-display)" }}>${s.heading}</h2>` : ""}
${s.subheading ? `        <p style={{ fontSize: "16px", color: "var(--color-text-secondary)", textAlign: "center", margin: "0 0 40px" }}>${s.subheading}</p>` : ""}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center", alignItems: "stretch" }}>
${plans}
        </div>
      </div>
    </section>`;
}
