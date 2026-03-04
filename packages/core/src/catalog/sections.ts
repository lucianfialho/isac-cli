import { z } from "zod";

// ── Shared primitives ───────────────────────────────────────────

const TokenRef = z.string().describe("CSS custom property name, e.g. 'bg-primary'");

const ResponsiveHint = z.enum(["stack", "scroll", "hide", "collapse"]).optional()
  .describe("How this section adapts on mobile");

const Behavior = z.enum(["static", "sticky", "scroll-reveal", "parallax"]).default("static");

const AnimationSpec = z.object({
  id: z.string().optional(),
  type: z.string().optional(),
  trigger: z.enum(["load", "inView", "hover", "scroll"]).optional(),
  motionApi: z.string().optional().describe("motion.dev API call, e.g. animate('.hero', { opacity: 1 })"),
}).optional();

// ── Link item ───────────────────────────────────────────────────

const LinkItem = z.object({
  text: z.string(),
  url: z.string(),
});

// ── Section base ────────────────────────────────────────────────

const SectionBase = z.object({
  id: z.string().describe("Unique section identifier, e.g. 'hero-1'"),
  behavior: Behavior,
  tokens: z.record(z.string(), TokenRef).optional()
    .describe("Map of element role to token name"),
  responsive: ResponsiveHint,
  animation: AnimationSpec,
});

// ── Section types ───────────────────────────────────────────────

export const HeaderSection = SectionBase.extend({
  type: z.literal("Header"),
  logo: z.object({
    src: z.string().optional(),
    alt: z.string().optional(),
    text: z.string().optional(),
  }).optional(),
  nav: z.array(LinkItem).optional(),
  cta: LinkItem.optional(),
});

export const HeroSection = SectionBase.extend({
  type: z.literal("Hero"),
  headline: z.string(),
  subheadline: z.string().optional(),
  cta: LinkItem.optional(),
  secondaryCta: LinkItem.optional(),
  image: z.object({ src: z.string(), alt: z.string() }).optional(),
  badge: z.string().optional(),
});

export const FeatureGridSection = SectionBase.extend({
  type: z.literal("FeatureGrid"),
  heading: z.string().optional(),
  subheading: z.string().optional(),
  columns: z.number().int().min(1).max(6).default(3),
  items: z.array(z.object({
    icon: z.string().optional(),
    title: z.string(),
    description: z.string(),
  })),
});

export const StatsBarSection = SectionBase.extend({
  type: z.literal("StatsBar"),
  heading: z.string().optional(),
  items: z.array(z.object({
    value: z.string(),
    label: z.string(),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
  })),
});

export const DataTableSection = SectionBase.extend({
  type: z.literal("DataTable"),
  heading: z.string().optional(),
  caption: z.string().optional(),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

export const TestimonialsSection = SectionBase.extend({
  type: z.literal("Testimonials"),
  heading: z.string().optional(),
  items: z.array(z.object({
    quote: z.string(),
    author: z.string(),
    role: z.string().optional(),
    avatar: z.string().optional(),
  })),
});

export const PricingTableSection = SectionBase.extend({
  type: z.literal("PricingTable"),
  heading: z.string().optional(),
  subheading: z.string().optional(),
  plans: z.array(z.object({
    name: z.string(),
    price: z.string(),
    period: z.string().optional(),
    description: z.string().optional(),
    features: z.array(z.string()),
    cta: LinkItem.optional(),
    highlighted: z.boolean().optional(),
  })),
});

export const CTASection = SectionBase.extend({
  type: z.literal("CTA"),
  heading: z.string(),
  subheading: z.string().optional(),
  cta: LinkItem,
  secondaryCta: LinkItem.optional(),
});

export const FAQSection = SectionBase.extend({
  type: z.literal("FAQ"),
  heading: z.string().optional(),
  items: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })),
});

export const ContentBlockSection = SectionBase.extend({
  type: z.literal("ContentBlock"),
  heading: z.string().optional(),
  body: z.string().describe("Markdown or plain text content"),
  image: z.object({ src: z.string(), alt: z.string(), position: z.enum(["left", "right", "top", "bottom"]).optional() }).optional(),
});

export const LogoCloudSection = SectionBase.extend({
  type: z.literal("LogoCloud"),
  heading: z.string().optional(),
  logos: z.array(z.object({
    src: z.string(),
    alt: z.string(),
    url: z.string().optional(),
  })),
});

export const FooterSection = SectionBase.extend({
  type: z.literal("Footer"),
  copyright: z.string().optional(),
  columns: z.array(z.object({
    title: z.string(),
    links: z.array(LinkItem),
  })).optional(),
  social: z.array(z.object({
    platform: z.string(),
    url: z.string(),
    icon: z.string().optional(),
  })).optional(),
});

export const CustomHTMLSection = SectionBase.extend({
  type: z.literal("CustomHTML"),
  description: z.string().describe("Natural-language description of what this section should render"),
  htmlHint: z.string().optional().describe("Rough HTML structure hint"),
});

// ── Union of all section types ──────────────────────────────────

export const SectionSchema = z.discriminatedUnion("type", [
  HeaderSection,
  HeroSection,
  FeatureGridSection,
  StatsBarSection,
  DataTableSection,
  TestimonialsSection,
  PricingTableSection,
  CTASection,
  FAQSection,
  ContentBlockSection,
  LogoCloudSection,
  FooterSection,
  CustomHTMLSection,
]);

export type Section = z.infer<typeof SectionSchema>;

// ── Inferred types per section (for use without zod import) ─────

export type HeaderSectionData = z.infer<typeof HeaderSection>;
export type HeroSectionData = z.infer<typeof HeroSection>;
export type FeatureGridSectionData = z.infer<typeof FeatureGridSection>;
export type StatsBarSectionData = z.infer<typeof StatsBarSection>;
export type DataTableSectionData = z.infer<typeof DataTableSection>;
export type TestimonialsSectionData = z.infer<typeof TestimonialsSection>;
export type PricingTableSectionData = z.infer<typeof PricingTableSection>;
export type CTASectionData = z.infer<typeof CTASection>;
export type FAQSectionData = z.infer<typeof FAQSection>;
export type ContentBlockSectionData = z.infer<typeof ContentBlockSection>;
export type LogoCloudSectionData = z.infer<typeof LogoCloudSection>;
export type FooterSectionData = z.infer<typeof FooterSection>;
export type CustomHTMLSectionData = z.infer<typeof CustomHTMLSection>;

// ── Available section type names (for prompts) ──────────────────

export const SECTION_TYPES = [
  "Header", "Hero", "FeatureGrid", "StatsBar", "DataTable",
  "Testimonials", "PricingTable", "CTA", "FAQ", "ContentBlock",
  "LogoCloud", "Footer", "CustomHTML",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];
