import type { StatsBarSectionData } from "@guataiba/isac-core";

export function renderStatsBar(s: StatsBarSectionData): string {
  const items = s.items
    .map((item: { prefix?: string; value: string; suffix?: string; label: string }) => `          <div style={{ textAlign: "center", flex: "1 1 120px" }}>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "var(--color-accent-primary)", fontFamily: "var(--font-display)" }}>${item.prefix ?? ""}${item.value}${item.suffix ?? ""}</div>
            <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginTop: 4 }}>${item.label}</div>
          </div>`)
    .join("\n");

  return `    {/* ${s.id}: StatsBar */}
    <section style={{ backgroundColor: "var(--color-${s.tokens?.bg ?? "bg-secondary"})", padding: "48px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
${s.heading ? `        <h2 style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-text-primary)", textAlign: "center", margin: "0 0 32px", fontFamily: "var(--font-display)" }}>${s.heading}</h2>` : ""}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "center" }}>
${items}
        </div>
      </div>
    </section>`;
}
