import { AI_CLICHES, SECTION_META } from "@resumeai/shared";

/**
 * Rules every writing prompt shares. The first one is the product's promise:
 * the AI never adds facts the person didn't give us.
 */
export const WRITER_SYSTEM = `You are a senior resume writer who used to be a technical recruiter. You edit resume text so it is clear, specific and easy to skim.

Rules you never break:
1. Never invent facts. Do not add numbers, percentages, money, team sizes, user counts, tools, technologies, companies, titles or outcomes that are not in the input. Don't add a purpose or result the person didn't state, and don't swap in new nouns (call a "booking form" a booking form, not a "checkout"). If a number would make the text much stronger and none was given, leave it out and ask for it in "question".
2. Keep the person's meaning. You may rephrase, reorder, tighten and pick stronger plain verbs. Never inflate seniority or scope.
3. Sound like a confident person, not a chatbot. Never use these words: ${AI_CLICHES.join(", ")}. Also avoid "responsible for", "helped to", "worked on", "various" and "successfully". Prefer plain strong verbs: built, cut, led, shipped, grew, fixed, designed, ran, wrote, launched, reduced, raised, automated, migrated, taught.
4. Resume style: no "I", "my", "we" or "our"; no full stop at the end; start with a verb in past tense, or present tense for a current role; aim for one line (under about 160 characters).
5. Input may be written in Hindi, Hinglish or any mix of languages. Your output is always natural professional English.
6. Use the job title, company and target role only as background. Don't paste them into the text unless they were already there.`;

export function describeContext(context) {
  const lines = [];
  if (context.sectionType) lines.push(`Section: ${SECTION_META[context.sectionType].label}`);
  const where = [context.title, context.organization].filter(Boolean).join(" at ");
  if (where) lines.push(`Entry: ${where}${context.current ? " (current, so use present tense)" : ""}`);
  if (context.targetRole) {
    lines.push(
      `Target job: ${context.targetRole}${context.experienceLevel ? ` (${context.experienceLevel} level)` : ""}`,
    );
  }
  const siblings = (context.otherBullets ?? []).map((b) => b.trim()).filter(Boolean);
  if (siblings.length) {
    lines.push("Other bullets in this entry (match their tone, don't repeat their opening verbs):");
    for (const bullet of siblings.slice(0, 8)) lines.push(`- ${bullet}`);
  }
  return lines.join("\n");
}

const TASKS = {
  improve:
    "Rewrite the bullet so it leads with what the person did and ends with the result or impact. Give 2 options that differ in emphasis.",
  shorten: "Make the bullet fit on one line (under 120 characters) while keeping the result. Give 2 options.",
  human:
    "The bullet sounds machine-written or full of buzzwords. Rewrite it the way a confident person would say it plainly. Give 2 options.",
  metricAsk:
    'Work out the single number that would make this bullet most convincing (scale, speed, money, percentage, time saved). Return no options. Put one short, specific question in "question" that asks the person for it, e.g. "Roughly how many people used the dashboard each week?"',
  metricUse:
    "The person answered your question about this bullet with the answer below. Rewrite the bullet using that number exactly as they gave it (keep words like 'about' or 'roughly' if they used them). Give 2 options.",
};

export function bulletPrompt(input) {
  const task = input.action === "metric" ? (input.answer ? TASKS.metricUse : TASKS.metricAsk) : TASKS[input.action];
  const parts = [`Bullet:\n"${input.text}"`, describeContext(input.context), `Task: ${task}`];
  if (input.answer) parts.push(`Their answer: "${input.answer}"`);
  if (input.avoid.length) {
    parts.push(`Don't repeat these earlier suggestions:\n${input.avoid.map((a) => `- ${a}`).join("\n")}`);
  }
  if (input.action !== "metric") {
    parts.push(
      'If the bullet has no number and one would clearly help, also ask for it in "question". Otherwise set "question" to "".',
    );
  }
  return parts.filter(Boolean).join("\n\n");
}

export function notesPrompt(notes, context) {
  return [
    `The person described this part of their work in their own words. It may be informal, in Hindi, Hinglish or English:\n"""\n${notes}\n"""`,
    describeContext(context),
    'Task: Write 2 to 4 resume bullets in English from these notes. Use only facts from the notes; one idea per bullet. If a result or scale is implied but no number is given, write the bullet without a number and add a short question asking for it to "questions" (at most 2). If nothing is missing, "questions" is an empty list.',
  ]
    .filter(Boolean)
    .join("\n\n");
}

export const SUMMARY_SYSTEM = `${WRITER_SYSTEM}

For summaries only: write 2 to 3 sentences (about 250 to 450 characters). Lead with the role and years of experience if they can be worked out from the resume, then the strongest result, then what the person is best at. No "I". Use only facts in the resume.`;

export function summaryPrompt(input) {
  return [
    `Resume:\n"""\n${input.resumeText}\n"""`,
    input.current ? `Their current summary:\n"${input.current}"` : "",
    input.targetRole
      ? `Target job: ${input.targetRole}${input.experienceLevel ? ` (${input.experienceLevel} level)` : ""}`
      : "",
    'Task: Write 3 different summaries for this resume, labelled "Impact first", "Skills first" and "Short and direct". Each must be supported by the resume.',
  ]
    .filter(Boolean)
    .join("\n\n");
}

export const SKILLS_SYSTEM = `You are a technical recruiter reviewing a resume's skills section. You are precise and never pad lists.`;

export function skillsPrompt(input) {
  return [
    `Resume:\n"""\n${input.resumeText}\n"""`,
    `Skills already listed: ${input.existing.length ? input.existing.join(", ") : "(none)"}`,
    input.targetRole ? `Target job: ${input.targetRole}` : "",
    `Task:
1. "fromResume": skills, tools or technologies the resume text clearly shows the person used (in experience, projects or education) but that are missing from the skills list. Quote the evidence. At most 10. Never include anything already listed, even with different capitalisation or spelling.
2. "forRole": skills commonly required for the target job that do not appear anywhere in the resume. At most 8, most important first. These are suggestions to consider, not facts about the person.
Use the standard spelling of each skill (e.g. "PostgreSQL", "Node.js").`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export const COMPLETE_SYSTEM = `You autocomplete resume bullets while someone types. You only suggest the next few words. Never invent numbers or facts; if the natural next words would be a number the person hasn't given, stop before it. Plain verbs, no buzzwords, no full stop at the end.`;

export function completePrompt(text, context) {
  return [
    describeContext(context),
    `Bullet so far:\n"${text}"`,
    'Task: Continue it with 3 to 14 words that finish the thought. Return only the new text in "completion", starting with a space if the existing text doesn\'t end in one. If the bullet already reads as finished, return an empty string.',
  ]
    .filter(Boolean)
    .join("\n\n");
}
