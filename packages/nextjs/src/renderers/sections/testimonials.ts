import type { TestimonialsSectionData } from "@guataiba/isac-core";

export function renderTestimonials(s: TestimonialsSectionData): string {
  const items = s.items
    .map((item: { quote: string; author: string; role?: string; avatar?: string }) => `          <div style={{ flex: "1 1 320px", padding: 24, backgroundColor: "var(--color-surface-primary)", borderRadius: "var(--radius-lg, 12px)", border: "1px solid var(--color-border-primary)" }}>
            <p style={{ fontSize: "15px", color: "var(--color-text-primary)", lineHeight: 1.7, margin: "0 0 16px", fontStyle: "italic" }}>&ldquo;${item.quote}&rdquo;</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
${item.avatar ? `              <img src="${item.avatar}" alt="${item.author}" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />` : ""}
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)" }}>${item.author}</div>
${item.role ? `                <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>${item.role}</div>` : ""}
              </div>
            </div>
          </div>`)
    .join("\n");

  return `    {/* ${s.id}: Testimonials */}
    <section style={{ backgroundColor: "var(--color-${s.tokens?.bg ?? "bg-primary"})", padding: "64px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
${s.heading ? `        <h2 style={{ fontSize: "32px", fontWeight: 700, color: "var(--color-text-primary)", textAlign: "center", margin: "0 0 40px", fontFamily: "var(--font-display)" }}>${s.heading}</h2>` : ""}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
${items}
        </div>
      </div>
    </section>`;
}
