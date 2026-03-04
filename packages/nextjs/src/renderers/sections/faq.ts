import type { FAQSectionData } from "@guataiba/isac-core";

export function renderFAQ(s: FAQSectionData): string {
  const items = s.items
    .map((item: { question: string; answer: string }) => `          <details style={{ borderBottom: "1px solid var(--color-border-primary)", padding: "16px 0" }}>
            <summary style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-primary)", cursor: "pointer", listStyle: "none" }}>${item.question}</summary>
            <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", lineHeight: 1.7, margin: "12px 0 0", paddingLeft: 0 }}>${item.answer}</p>
          </details>`)
    .join("\n");

  return `    {/* ${s.id}: FAQ */}
    <section style={{ backgroundColor: "var(--color-${s.tokens?.bg ?? "bg-primary"})", padding: "64px 0" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
${s.heading ? `        <h2 style={{ fontSize: "32px", fontWeight: 700, color: "var(--color-text-primary)", textAlign: "center", margin: "0 0 40px", fontFamily: "var(--font-display)" }}>${s.heading}</h2>` : ""}
        <div>
${items}
        </div>
      </div>
    </section>`;
}
