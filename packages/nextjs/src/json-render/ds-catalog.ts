import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

// ── Design System Documentation Catalog ──────────────────────────
// Components for rendering the design system documentation page.
// These are NOT used for landing pages — they display extracted tokens.

export const dsCatalog = defineCatalog(schema, {
  components: {
    DSPage: {
      props: z.object({
        siteName: z.string(),
        domain: z.string(),
      }),
      slots: ["default"],
      description: "Root wrapper for the design system documentation page.",
    },

    DSHeader: {
      props: z.object({
        siteName: z.string(),
        domain: z.string(),
      }),
      description: "Design system page header with title and subtitle.",
    },

    DSBrandIdentity: {
      props: z.object({
        name: z.string(),
        tagline: z.string().nullable(),
        description: z.string().nullable(),
        logoUrl: z.string().nullable(),
        faviconUrl: z.string().nullable(),
      }),
      description: "Brand identity section showing logo, name, tagline.",
    },

    DSColorPalette: {
      props: z.object({
        title: z.string(),
        subtitle: z.string().nullable(),
        colors: z.array(z.object({
          name: z.string(),
          varName: z.string(),
          hex: z.string(),
        })),
      }),
      description: "Grid of color swatches showing primitive palette.",
    },

    DSSemanticTokens: {
      props: z.object({
        title: z.string(),
        subtitle: z.string().nullable(),
        groups: z.array(z.object({
          category: z.string(),
          tokens: z.array(z.object({
            name: z.string(),
            varName: z.string(),
            lightRef: z.string(),
            lightHex: z.string(),
            darkRef: z.string(),
            darkHex: z.string(),
          })),
        })),
      }),
      description: "Table of semantic tokens showing light/dark mode mappings.",
    },

    DSTypography: {
      props: z.object({
        title: z.string(),
        families: z.array(z.object({
          key: z.string(),
          stack: z.string(),
        })),
        sizes: z.array(z.object({
          label: z.string(),
          size: z.string(),
          sample: z.string(),
        })),
        weights: z.array(z.object({
          label: z.string(),
          weight: z.number(),
        })),
      }),
      description: "Typography section showing font families, sizes, and weights.",
    },

    DSSpacing: {
      props: z.object({
        title: z.string(),
        items: z.array(z.object({
          label: z.string(),
          px: z.string(),
        })),
      }),
      description: "Spacing scale visualization with bars.",
    },

    DSRadii: {
      props: z.object({
        title: z.string(),
        items: z.array(z.object({
          label: z.string(),
          value: z.string(),
        })),
      }),
      description: "Border radius showcase.",
    },

    DSShadows: {
      props: z.object({
        title: z.string(),
        items: z.array(z.object({
          label: z.string(),
          value: z.string(),
        })),
      }),
      description: "Shadow showcase with visual previews.",
    },

    DSComponents: {
      props: z.object({
        title: z.string(),
      }),
      description: "Component showcase with buttons, cards, badges, input, glass surface, and text hierarchy.",
    },

    DSIcons: {
      props: z.object({
        title: z.string(),
        library: z.string(),
        count: z.number(),
        names: z.array(z.string()),
      }),
      description: "Icon library section showing detected icons.",
    },

    DSExamplesHeader: {
      props: z.object({
        title: z.string(),
        subtitle: z.string(),
      }),
      description: "Divider heading introducing the layout examples section.",
    },

    DSHeroExample: {
      props: z.object({
        siteName: z.string(),
        tagline: z.string().nullable(),
      }),
      description: "Example Hero section using design system tokens.",
    },

    DSFeatureGridExample: {
      props: z.object({}),
      description: "Example Feature Grid section using design system tokens.",
    },

    DSPricingExample: {
      props: z.object({}),
      description: "Example Pricing Table section using design system tokens.",
    },

    DSTestimonialsExample: {
      props: z.object({}),
      description: "Example Testimonials section using design system tokens.",
    },

    DSCTAExample: {
      props: z.object({
        siteName: z.string(),
      }),
      description: "Example CTA section using design system tokens.",
    },

    DSFooter: {
      props: z.object({
        domain: z.string(),
      }),
      description: "Design system page footer.",
    },
  },

  actions: {},
});

export type DSCatalog = typeof dsCatalog;
