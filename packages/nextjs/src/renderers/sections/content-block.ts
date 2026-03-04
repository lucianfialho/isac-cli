import type { ContentBlockSectionData } from "@guataiba/isac-core";

export function renderContentBlock(s: ContentBlockSectionData): string {
  const imageEl = s.image
    ? `        <img src="${s.image.src}" alt="${s.image.alt}" style={{ maxWidth: "100%", borderRadius: "var(--radius-lg, 12px)" }} />`
    : "";

  const pos = s.image?.position ?? "right";
  const isHorizontal = pos === "left" || pos === "right";

  if (isHorizontal && s.image) {
    const textBlock = `        <div style={{ flex: 1 }}>
${s.heading ? `          <h2 style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 16px", fontFamily: "var(--font-display)" }}>${s.heading}</h2>` : ""}
          <div style={{ fontSize: "16px", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>${s.body}</div>
        </div>`;
    const imgBlock = `        <div style={{ flex: 1 }}>\n${imageEl}\n        </div>`;

    return `    {/* ${s.id}: ContentBlock */}
    <section style={{ backgroundColor: "var(--color-${s.tokens?.bg ?? "bg-primary"})", padding: "64px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", flexWrap: "wrap", gap: 40, alignItems: "center" }}>
${pos === "left" ? `${imgBlock}\n${textBlock}` : `${textBlock}\n${imgBlock}`}
      </div>
    </section>`;
  }

  return `    {/* ${s.id}: ContentBlock */}
    <section style={{ backgroundColor: "var(--color-${s.tokens?.bg ?? "bg-primary"})", padding: "64px 0" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
${pos === "top" && imageEl ? `${imageEl}\n` : ""}
${s.heading ? `        <h2 style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 16px", fontFamily: "var(--font-display)" }}>${s.heading}</h2>` : ""}
        <div style={{ fontSize: "16px", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>${s.body}</div>
${pos === "bottom" && imageEl ? `\n${imageEl}` : ""}
      </div>
    </section>`;
}
