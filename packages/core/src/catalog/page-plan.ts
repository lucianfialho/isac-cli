import { z } from "zod";
import { SectionSchema } from "./sections.js";

// ── Page Plan Schema ────────────────────────────────────────────

export const PagePlanSchema = z.object({
  metadata: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),

  sections: z.array(SectionSchema).min(1)
    .describe("Ordered list of page sections, top to bottom"),

  reusableComponents: z.array(z.object({
    name: z.string(),
    note: z.string().optional().describe("e.g. 'already exists — copy from design-system/components/'"),
  })).optional(),

  externalLinks: z.array(z.object({
    text: z.string(),
    url: z.string(),
  })).optional(),

  dependencies: z.array(z.string()).optional()
    .describe("npm packages needed beyond the base project"),
});

export type PagePlan = z.infer<typeof PagePlanSchema>;
