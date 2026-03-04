import type { PagePlan, Section } from "@guataiba/isac-core";
import { renderHeader } from "./sections/header.js";
import { renderHero } from "./sections/hero.js";
import { renderFeatureGrid } from "./sections/feature-grid.js";
import { renderStatsBar } from "./sections/stats-bar.js";
import { renderDataTable } from "./sections/data-table.js";
import { renderTestimonials } from "./sections/testimonials.js";
import { renderPricingTable } from "./sections/pricing-table.js";
import { renderCTA } from "./sections/cta.js";
import { renderFAQ } from "./sections/faq.js";
import { renderContentBlock } from "./sections/content-block.js";
import { renderLogoCloud } from "./sections/logo-cloud.js";
import { renderFooter } from "./sections/footer.js";
import { renderCustomHTML } from "./sections/custom-html.js";

/**
 * Render a single section to JSX string.
 */
function renderSection(section: Section): string {
  switch (section.type) {
    case "Header": return renderHeader(section);
    case "Hero": return renderHero(section);
    case "FeatureGrid": return renderFeatureGrid(section);
    case "StatsBar": return renderStatsBar(section);
    case "DataTable": return renderDataTable(section);
    case "Testimonials": return renderTestimonials(section);
    case "PricingTable": return renderPricingTable(section);
    case "CTA": return renderCTA(section);
    case "FAQ": return renderFAQ(section);
    case "ContentBlock": return renderContentBlock(section);
    case "LogoCloud": return renderLogoCloud(section);
    case "Footer": return renderFooter(section);
    case "CustomHTML": return renderCustomHTML(section);
    default: return `    {/* Unknown section type */}`;
  }
}

/**
 * Render a complete page.tsx from a validated PagePlan.
 * Returns the full file content as a string.
 */
export function renderPageFromPlan(plan: PagePlan): string {
  const sections = plan.sections.map(renderSection).join("\n\n");

  // Check if ThemeToggle is referenced in reusable components
  const hasThemeToggle = plan.reusableComponents?.some(c =>
    c.name.toLowerCase().includes("themetoggle") || c.name.toLowerCase().includes("theme-toggle"),
  );

  const imports = [
    `import type { Metadata } from "next";`,
  ];

  if (hasThemeToggle) {
    imports.push(`import ThemeToggle from "./design-system/components/theme-toggle";`);
  }

  const title = plan.metadata.title.replace(/"/g, '\\"');
  const description = (plan.metadata.description ?? "").replace(/"/g, '\\"');

  return `${imports.join("\n")}

export const metadata: Metadata = {
  title: "${title}",
  description: "${description}",
};

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}>
${sections}
    </div>
  );
}
`;
}
