import type { FooterSectionData } from "@guataiba/isac-core";

export function renderFooter(s: FooterSectionData): string {
  const columns = (s.columns ?? [])
    .map((col: { title: string; links: { text: string; url: string }[] }) => {
      const links = col.links
        .map((l: { text: string; url: string }) => `              <a href="${l.url}" style={{ display: "block", fontSize: "14px", color: "var(--color-text-secondary)", textDecoration: "none", padding: "4px 0" }}>${l.text}</a>`)
        .join("\n");
      return `          <div style={{ flex: "1 1 160px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>${col.title}</h4>
${links}
          </div>`;
    })
    .join("\n");

  const social = (s.social ?? [])
    .map((item: { platform: string; url: string; icon?: string }) => `          <a href="${item.url}" style={{ color: "var(--color-text-secondary)", textDecoration: "none", fontSize: "14px" }}>${item.icon ?? item.platform}</a>`)
    .join("\n");

  return `    {/* ${s.id}: Footer */}
    <footer style={{ backgroundColor: "var(--color-${s.tokens?.bg ?? "bg-secondary"})", borderTop: "1px solid var(--color-border-primary)", padding: "48px 0 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
${columns ? `        <div style={{ display: "flex", flexWrap: "wrap", gap: 32, marginBottom: 32 }}>\n${columns}\n        </div>` : ""}
${social ? `        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>\n${social}\n        </div>` : ""}
${s.copyright ? `        <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: 0 }}>${s.copyright}</p>` : ""}
      </div>
    </footer>`;
}
