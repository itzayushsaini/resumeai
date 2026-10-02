// Quick end-to-end check of the Gemini setup: `node --import tsx scripts/ai-smoke.ts` from server/.
import { bulletAssistResponseSchema, completeResponseSchema, notesResponseSchema } from "@resumeai/shared";
import { generateJson } from "../src/ai/gemini.js";
import { bulletPrompt, COMPLETE_SYSTEM, completePrompt, notesPrompt, WRITER_SYSTEM } from "../src/ai/prompts.js";

const context = {
  sectionType: "experience",
  title: "Frontend Engineer",
  organization: "Fernway Health",
  current: false,
  targetRole: "Frontend Developer",
  experienceLevel: "mid",
  otherBullets: [],
};

async function time(label, run) {
  const start = Date.now();
  try {
    const result = await run();
    console.log(`\n${label} (${Date.now() - start} ms)`);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.log(`\n${label} FAILED (${Date.now() - start} ms):`, error instanceof Error ? error.message : error);
  }
}

await time("improve", () =>
  generateJson({
    schema: bulletAssistResponseSchema,
    system: WRITER_SYSTEM,
    prompt: bulletPrompt({
      action: "improve",
      text: "Responsible for spearheading the redesign of the booking form",
      avoid: [],
      context,
    }),
    cacheable: false,
  }),
);

await time("metric (ask)", () =>
  generateJson({
    schema: bulletAssistResponseSchema,
    system: WRITER_SYSTEM,
    prompt: bulletPrompt({
      action: "metric",
      text: "Redesigned the booking form so fewer patients dropped off",
      avoid: [],
      context,
    }),
    cacheable: false,
  }),
);

await time("notes (Hinglish)", () =>
  generateJson({
    schema: notesResponseSchema,
    system: WRITER_SYSTEM,
    prompt: notesPrompt(
      "maine booking wala form dobara banaya, pehle log beech mein chhod dete the, ab kam log chhodte hai. design team ke saath kaam kiya aur testing bhi add ki",
      context,
    ),
    cacheable: false,
  }),
);

await time("complete (fast model)", () =>
  generateJson({
    schema: completeResponseSchema,
    system: COMPLETE_SYSTEM,
    prompt: completePrompt("Built a patient scheduling app in React and GraphQL that", context),
    model: "fast",
    thinking: "minimal",
    cacheable: false,
  }),
);
