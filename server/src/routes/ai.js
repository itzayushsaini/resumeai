import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  bulletAssistRequestSchema,
  bulletAssistResponseSchema,
  completeRequestSchema,
  completeResponseSchema,
  notesRequestSchema,
  notesResponseSchema,
  skillsRequestSchema,
  skillsResponseSchema,
  summaryRequestSchema,
  summaryResponseSchema,
} from "@resumeai/shared";
import { currentUser } from "../middleware/require-auth.js";
import { generateJson } from "../ai/gemini.js";
import {
  bulletPrompt,
  COMPLETE_SYSTEM,
  completePrompt,
  notesPrompt,
  SKILLS_SYSTEM,
  skillsPrompt,
  SUMMARY_SYSTEM,
  summaryPrompt,
  WRITER_SYSTEM,
} from "../ai/prompts.js";

export const aiRouter = Router();

/** Limits per signed-in user, so one person can't drain the shared quota. */
const perUser = (limit) =>
  rateLimit({
    windowMs: 60_000,
    limit,
    keyGenerator: (req) => currentUser(req).id,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "You're going a bit fast for the AI. Give it a few seconds." },
  });

aiRouter.post("/bullet", perUser(30), async (req, res) => {
  const input = bulletAssistRequestSchema.parse(req.body);
  const result = await generateJson({
    schema: bulletAssistResponseSchema,
    system: WRITER_SYSTEM,
    prompt: bulletPrompt(input),
    // "Try again" should produce something new.
    cacheable: input.avoid.length === 0,
    temperature: input.avoid.length ? 0.9 : 0.6,
  });
  // Drop suggestions that just repeat the original.
  const original = input.text.trim().toLowerCase();
  res.json({
    options: result.options.filter((o) => o.text.trim() && o.text.trim().toLowerCase() !== original),
    question: result.question.trim(),
  });
});

aiRouter.post("/notes", perUser(15), async (req, res) => {
  const input = notesRequestSchema.parse(req.body);
  const result = await generateJson({
    schema: notesResponseSchema,
    system: WRITER_SYSTEM,
    prompt: notesPrompt(input.notes, input.context),
  });
  res.json({
    bullets: result.bullets.map((b) => b.trim()).filter(Boolean),
    questions: result.questions.map((q) => q.trim()).filter(Boolean),
  });
});

aiRouter.post("/summary", perUser(10), async (req, res) => {
  const input = summaryRequestSchema.parse(req.body);
  const result = await generateJson({
    schema: summaryResponseSchema,
    system: SUMMARY_SYSTEM,
    prompt: summaryPrompt(input),
    temperature: 0.8,
  });
  res.json(result);
});

aiRouter.post("/skills", perUser(10), async (req, res) => {
  const input = skillsRequestSchema.parse(req.body);
  const result = await generateJson({
    schema: skillsResponseSchema,
    system: SKILLS_SYSTEM,
    prompt: skillsPrompt(input),
    temperature: 0.3,
  });
  // The model is told not to repeat existing skills; enforce it anyway.
  const have = new Set(input.existing.map((s) => s.trim().toLowerCase()));
  const seen = new Set();
  const fresh = (items) =>
    items.filter((item) => {
      const key = item.skill.trim().toLowerCase();
      if (!key || have.has(key) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  res.json({ fromResume: fresh(result.fromResume), forRole: fresh(result.forRole) });
});

aiRouter.post("/complete", perUser(40), async (req, res) => {
  const input = completeRequestSchema.parse(req.body);
  const result = await generateJson({
    schema: completeResponseSchema,
    system: COMPLETE_SYSTEM,
    prompt: completePrompt(input.text, input.context),
    model: "fast",
    thinking: "minimal",
    temperature: 0.4,
    timeoutMs: 8_000,
  });
  let completion = result.completion.replace(/\s+$/, "").replace(/\.$/, "");
  if (completion && !/\s$/.test(input.text) && !/^\s/.test(completion)) completion = ` ${completion}`;
  res.json({ completion: completion.slice(0, 160) });
});
