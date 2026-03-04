import type { CustomHTMLSectionData } from "@guataiba/isac-core";

export function renderCustomHTML(s: CustomHTMLSectionData): string {
  return `    {/* ${s.id}: CustomHTML — ${s.description} */}
    <section style={{ backgroundColor: "var(--color-${s.tokens?.bg ?? "bg-primary"})", padding: "64px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
${s.htmlHint ? `        ${s.htmlHint}` : `        <div style={{ padding: 32, backgroundColor: "var(--color-surface-primary)", borderRadius: "var(--radius-lg, 12px)", border: "1px dashed var(--color-border-primary)", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>${s.description}</p>
        </div>`}
      </div>
    </section>`;
}
