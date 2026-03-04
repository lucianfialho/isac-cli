import type { LogoCloudSectionData } from "@guataiba/isac-core";

export function renderLogoCloud(s: LogoCloudSectionData): string {
  const logos = s.logos
    .map((logo: { src: string; alt: string; url?: string }) => {
      const img = `<img src="${logo.src}" alt="${logo.alt}" style={{ height: 32, opacity: 0.7, filter: "grayscale(100%)", transition: "opacity 0.2s, filter 0.2s" }} />`;
      return logo.url
        ? `          <a href="${logo.url}" style={{ display: "flex", alignItems: "center" }}>${img}</a>`
        : `          <div style={{ display: "flex", alignItems: "center" }}>${img}</div>`;
    })
    .join("\n");

  return `    {/* ${s.id}: LogoCloud */}
    <section style={{ backgroundColor: "var(--color-${s.tokens?.bg ?? "bg-primary"})", padding: "48px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
${s.heading ? `        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", textAlign: "center", margin: "0 0 24px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>${s.heading}</p>` : ""}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "center", alignItems: "center" }}>
${logos}
        </div>
      </div>
    </section>`;
}
