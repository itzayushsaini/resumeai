import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Section types                                                       */
/* ------------------------------------------------------------------ */

export const SECTION_TYPES = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "achievements",
  "languages",
  "volunteering",
  "custom",
];

/** True for sections whose content is a list of entries (not free text or skill groups). */
export function isEntrySection(type) {
  return type !== "summary" && type !== "skills";
}

/* ------------------------------------------------------------------ */
/* Schemas                                                             */
/* ------------------------------------------------------------------ */

const id = z.string().min(1).max(64);
const str = (max) => z.string().max(max).default("");

/** "" | "2022" | "2022-03" */
const monthValue = z
  .string()
  .regex(/^(\d{4}(-(0[1-9]|1[0-2]))?)?$/, "Use YYYY or YYYY-MM")
  .default("");

export const entrySchema = z.object({
  id,
  title: str(200),
  subtitle: str(200),
  location: str(120),
  startDate: monthValue,
  endDate: monthValue,
  current: z.boolean().default(false),
  link: str(300),
  meta: str(200),
  bullets: z.array(z.string().max(1000)).max(40).default([]),
});

export const skillGroupSchema = z.object({
  id,
  name: str(80),
  keywords: z.array(z.string().max(80)).max(60).default([]),
});

export const sectionSchema = z.object({
  id,
  type: z.enum(SECTION_TYPES),
  title: str(80),
  visible: z.boolean().default(true),
  text: str(4000),
  entries: z.array(entrySchema).max(50).default([]),
  groups: z.array(skillGroupSchema).max(20).default([]),
});

export const basicsSchema = z.object({
  name: str(120),
  headline: str(160),
  email: str(160),
  phone: str(60),
  location: str(120),
  website: str(200),
  linkedin: str(200),
  github: str(200),
});

export const resumeContentSchema = z.object({
  basics: basicsSchema,
  sections: z.array(sectionSchema).max(20),
});

/* ------------------------------------------------------------------ */
/* Design settings                                                     */
/* ------------------------------------------------------------------ */

export const TEMPLATE_IDS = ["classic", "modern", "minimal"];
export const FONT_IDS = ["source-serif", "eb-garamond", "ibm-plex-sans", "carlito", "instrument-sans"];
export const FONT_SIZES = ["sm", "md", "lg"];
export const SPACINGS = ["compact", "normal", "relaxed"];
export const MARGINS = ["narrow", "normal", "wide"];
export const PAPERS = ["letter", "a4"];

export const resumeSettingsSchema = z.object({
  template: z.enum(TEMPLATE_IDS).default("classic"),
  font: z.enum(FONT_IDS).default("source-serif"),
  accent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#1f3a8a"),
  fontSize: z.enum(FONT_SIZES).default("md"),
  spacing: z.enum(SPACINGS).default("normal"),
  margins: z.enum(MARGINS).default("normal"),
  paper: z.enum(PAPERS).default("letter"),
});

/** Body accepted by PATCH /api/resumes/:id — every field optional. */
export const resumeUpdateSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  content: resumeContentSchema.optional(),
  settings: resumeSettingsSchema.optional(),
  targetRole: z.string().max(120).optional(),
});

export const resumeCreateSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  starter: z.enum(["blank", "example"]).default("blank"),
  template: z.enum(TEMPLATE_IDS).optional(),
  targetRole: z.string().trim().max(120).optional(),
});
