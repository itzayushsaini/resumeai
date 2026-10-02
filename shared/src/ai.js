import { z } from "zod";
import { SECTION_TYPES } from "./resume.js";
import { SECTION_META, formatEntryDates } from "./sections.js";

/* ------------------------------------------------------------------ */
/* Requests (validated on the server)                                  */
/* ------------------------------------------------------------------ */

const shortText = (max) => z.string().trim().max(max).default("");

export const writingContextSchema = z.object({
  sectionType: z.enum(SECTION_TYPES).optional(),
  /** Job title, degree or project name the bullet belongs to. */
  title: shortText(200),
  /** Company, school or organization. */
  organization: shortText(200),
  current: z.boolean().default(false),
  targetRole: shortText(120),
  experienceLevel: shortText(40),
  /** Sibling bullets, for tone and to avoid repeating verbs. */
  otherBullets: z.array(z.string().max(1000)).max(15).default([]),
});

export const AI_BULLET_ACTIONS = ["improve", "metric", "shorten", "human"];

export const bulletAssistRequestSchema = z.object({
  action: z.enum(AI_BULLET_ACTIONS),
  text: z.string().trim().min(3).max(1000),
  /** The person's answer to a previous follow-up question. */
  answer: z.string().trim().max(300).optional(),
  /** Earlier suggestions, so "Try again" returns something new. */
  avoid: z.array(z.string().max(1000)).max(6).default([]),
  context: writingContextSchema,
});

export const notesRequestSchema = z.object({
  notes: z.string().trim().min(5).max(2000),
  context: writingContextSchema,
});

export const summaryRequestSchema = z.object({
  resumeText: z.string().trim().min(20).max(15000),
  current: z.string().max(4000).default(""),
  targetRole: shortText(120),
  experienceLevel: shortText(40),
});

export const skillsRequestSchema = z.object({
  resumeText: z.string().trim().min(20).max(15000),
  existing: z.array(z.string().max(80)).max(200).default([]),
  targetRole: shortText(120),
});

export const completeRequestSchema = z.object({
  text: z.string().min(10).max(600),
  context: writingContextSchema,
});

/* ------------------------------------------------------------------ */
/* Responses (also sent to Gemini as JSON Schema)                      */
/* ------------------------------------------------------------------ */

export const bulletAssistResponseSchema = z.object({
  options: z
    .array(
      z.object({
        text: z.string().describe("The rewritten bullet"),
        why: z.string().describe("What changed, in 12 words or fewer"),
      }),
    )
    .max(3),
  question: z.string().describe("One short question asking for a missing number, or an empty string if none is needed"),
});

export const notesResponseSchema = z.object({
  bullets: z.array(z.string()).max(6),
  questions: z.array(z.string()).max(3),
});

export const summaryResponseSchema = z.object({
  options: z
    .array(
      z.object({
        label: z.string().describe("Two-word name for the style, e.g. Impact first"),
        text: z.string(),
      }),
    )
    .max(3),
});

export const skillsResponseSchema = z.object({
  fromResume: z
    .array(
      z.object({
        skill: z.string(),
        evidence: z.string().describe("Up to 8 words quoted from the resume that show this skill"),
      }),
    )
    .max(12),
  forRole: z
    .array(
      z.object({
        skill: z.string(),
        why: z.string().describe("Why the target role asks for it, in 10 words or fewer"),
      }),
    )
    .max(10),
});

export const completeResponseSchema = z.object({
  completion: z.string(),
});

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Plain-text version of a resume for prompts. */
export function resumeToText(content) {
  const lines = [];
  const b = content.basics;
  if (b.name) lines.push(b.name);
  if (b.headline) lines.push(b.headline);

  for (const section of content.sections) {
    if (!section.visible) continue;
    const meta = SECTION_META[section.type];
    const body = [];
    if (section.type === "summary" && section.text.trim()) body.push(section.text.trim());
    if (section.type === "skills") {
      for (const group of section.groups) {
        if (group.keywords.length) body.push(`${group.name ? `${group.name}: ` : ""}${group.keywords.join(", ")}`);
      }
    }
    for (const entry of section.entries) {
      const head = [entry.title, entry.subtitle].filter(Boolean).join(" — ");
      const dates = formatEntryDates(entry, meta.dates);
      if (head || dates) body.push([head, dates].filter(Boolean).join(" | "));
      for (const bullet of entry.bullets) if (bullet.trim()) body.push(`- ${bullet.trim()}`);
    }
    if (body.length) lines.push("", (section.title || meta.defaultTitle).toUpperCase(), ...body);
  }
  return lines.join("\n").slice(0, 15000);
}
