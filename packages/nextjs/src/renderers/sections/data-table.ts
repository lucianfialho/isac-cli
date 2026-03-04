import type { DataTableSectionData } from "@guataiba/isac-core";

export function renderDataTable(s: DataTableSectionData): string {
  const headerCells = s.headers
    .map((h: string) => `              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid var(--color-border-primary)" }}>${h}</th>`)
    .join("\n");

  const rows = s.rows
    .map((row: string[]) => {
      const cells = row
        .map((cell: string) => `              <td style={{ padding: "12px 16px", fontSize: "14px", color: "var(--color-text-primary)", borderBottom: "1px solid var(--color-border-primary)" }}>${cell}</td>`)
        .join("\n");
      return `            <tr>\n${cells}\n            </tr>`;
    })
    .join("\n");

  return `    {/* ${s.id}: DataTable */}
    <section style={{ backgroundColor: "var(--color-${s.tokens?.bg ?? "bg-primary"})", padding: "64px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
${s.heading ? `        <h2 style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 24px", fontFamily: "var(--font-display)" }}>${s.heading}</h2>` : ""}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
${s.caption ? `            <caption style={{ textAlign: "left", fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: 12 }}>${s.caption}</caption>` : ""}
            <thead>
              <tr>
${headerCells}
              </tr>
            </thead>
            <tbody>
${rows}
            </tbody>
          </table>
        </div>
      </div>
    </section>`;
}
