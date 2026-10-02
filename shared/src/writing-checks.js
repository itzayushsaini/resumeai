/**
 * Instant, rule-based writing checks. They run on every keystroke, cost
 * nothing, and each one points at the AI action that fixes it.
 */

const WEAK_STARTS = [
  "responsible for",
  "responsibilities included",
  "duties included",
  "in charge of",
  "tasked with",
  "involved in",
  "participated in",
  "worked on",
  "helped",
  "assisted",
  "handled",
];

/** Words recruiters now read as "a chatbot wrote this". */
export const AI_CLICHES = [
  "spearheaded",
  "spearheading",
  "leveraged",
  "leveraging",
  "utilized",
  "utilizing",
  "synergy",
  "synergies",
  "results-driven",
  "results-oriented",
  "dynamic",
  "passionate",
  "cutting-edge",
  "robust",
  "seamless",
  "seamlessly",
  "orchestrated",
  "championed",
  "pivotal",
  "meticulous",
  "meticulously",
  "delve",
  "fostered",
  "game-changing",
  "best-in-class",
  "world-class",
  "go-getter",
  "detail-oriented",
  "team player",
  "hard-working",
  "think outside the box",
  "proven track record",
];

const FILLER = ["various", "multiple tasks", "etc.", "and more", "day-to-day", "a number of", "successfully"];

const NUMBER_WORDS =
  /\b(one|two|three|four|five|six|seven|eight|nine|ten|dozen|hundred|thousand|million|billion|half|double|doubled|twice|tripled)\b/i;

const PASSIVE = /\b(was|were|been|being|is|are)\s+(\w+ed|built|made|done|given|shown|taken|written|led|run)\b/i;

function escape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findWord(text, words) {
  return words.find((word) => new RegExp(`(^|[^\\w-])${escape(word)}($|[^\\w-])`, "i").test(text));
}

export function hasNumber(text) {
  return /\d/.test(text) || NUMBER_WORDS.test(text);
}

/** Up to three issues for one bullet, most important first. */
export function checkBullet(text) {
  const value = text.trim();
  if (value.length < 12) return [];
  const lower = value.toLowerCase();
  const issues = [];

  const weak = WEAK_STARTS.find((phrase) => lower.startsWith(phrase));
  if (weak) {
    issues.push({
      kind: "weak-start",
      label: "Weak start",
      detail: `“${weak[0].toUpperCase()}${weak.slice(1)}” hides what you did. Start with an action verb.`,
      fix: "improve",
    });
  }

  const cliche = findWord(value, AI_CLICHES);
  if (cliche) {
    issues.push({
      kind: "ai-cliche",
      label: "Sounds AI-written",
      detail: `Recruiters skim past “${cliche}”. A plain verb reads as more credible.`,
      fix: "human",
    });
  }

  if (!hasNumber(value)) {
    issues.push({
      kind: "no-number",
      label: "No number",
      detail: "A number (%, money, users, hours saved) makes the result concrete.",
      fix: "metric",
    });
  }

  if (/\bI\b/.test(value) || /\b(my|me|we|our)\b/i.test(value)) {
    issues.push({
      kind: "first-person",
      label: "First person",
      detail: "Resume bullets drop “I”, “my” and “we”.",
      fix: "improve",
    });
  }

  if (PASSIVE.test(value)) {
    issues.push({
      kind: "passive",
      label: "Passive voice",
      detail: "Say who did it. “Built X” beats “X was built”.",
      fix: "improve",
    });
  }

  if (value.length > 190) {
    issues.push({
      kind: "too-long",
      label: "Long",
      detail: "Over two lines. Recruiters skim; one line per bullet works best.",
      fix: "shorten",
    });
  }

  const filler = findWord(value, FILLER);
  if (filler && issues.length < 3) {
    issues.push({
      kind: "filler",
      label: "Vague word",
      detail: `“${filler}” adds length without meaning.`,
      fix: "improve",
    });
  }

  return issues.slice(0, 3);
}
