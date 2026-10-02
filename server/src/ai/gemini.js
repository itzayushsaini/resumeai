import { createHash } from "node:crypto";
import { ApiError, GoogleGenAI, ThinkingLevel } from "@google/genai";
import { z } from "zod";
import { env } from "../env.js";
import { HttpError } from "../lib/http-error.js";

/**
 * One place to change models. Defaults are ones the free tier serves
 * (gemini-3.8-flash returned "quota exceeded" on a free key in 2026-10).
 * Override with GEMINI_MODEL_SMART / GEMINI_MODEL_FAST.
 */
export const MODELS = {
  /** Rewrites, summaries, analysis. */
  smart: env.GEMINI_MODEL_SMART ?? "gemini-3.6-flash",
  /** Autocomplete and other latency-sensitive calls. */
  fast: env.GEMINI_MODEL_FAST ?? "gemini-3.5-flash-lite",
};

const THINKING = {
  minimal: ThinkingLevel.MINIMAL,
  low: ThinkingLevel.LOW,
  medium: ThinkingLevel.MEDIUM,
};

let client = null;

function getClient() {
  if (!env.GEMINI_API_KEY) {
    throw new HttpError(503, "AI isn't set up on this server yet. Add GEMINI_API_KEY to the environment.");
  }
  client ??= new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  return client;
}

/** Gemini accepts a subset of JSON Schema; drop the bits it doesn't need. */
function toGeminiSchema(schema) {
  const json = z.toJSONSchema(schema, { target: "draft-2020-12", io: "output" });
  delete json.$schema;
  return json;
}

function aiError(error) {
  if (error instanceof HttpError) return error;
  if (error instanceof ApiError) {
    if (error.status === 429) return new HttpError(429, "The AI is getting a lot of requests. Try again in a minute.");
    if (error.status === 503) return new HttpError(503, "Google's AI is busy right now. Try again in a moment.");
    if (error.status === 400 && /api key/i.test(error.message)) {
      return new HttpError(503, "The Gemini API key on the server isn't valid.");
    }
    if (error.status === 403) return new HttpError(503, "The Gemini API key doesn't have access to this model.");
    console.error("Gemini error", error.status, error.message);
    return new HttpError(502, "The AI service had a problem. Try again.");
  }
  if (error instanceof Error && error.name === "AbortError") {
    return new HttpError(504, "The AI took too long to answer. Try again.");
  }
  console.error("AI call failed", error);
  return new HttpError(502, "The AI service had a problem. Try again.");
}

/* ------------------------------------------------------------------ */
/* Small in-memory cache: identical requests don't spend quota twice.  */
/* ------------------------------------------------------------------ */

const CACHE_LIMIT = 500;
const CACHE_TTL = 60 * 60 * 1000;
const cache = new Map();

function cacheKey(parts) {
  return createHash("sha256").update(JSON.stringify(parts)).digest("base64url");
}

function fromCache(key) {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at > CACHE_TTL) {
    cache.delete(key);
    return undefined;
  }
  // Refresh recency.
  cache.delete(key);
  cache.set(key, hit);
  return hit.value;
}

function toCache(key, value) {
  cache.set(key, { at: Date.now(), value });
  if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value);
}

/* ------------------------------------------------------------------ */

/** Overloaded or rate-limited: worth retrying, or trying the other model. */
function isTransient(error) {
  return error instanceof ApiError && [429, 500, 503].includes(error.status);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callModel(modelId, { schema, system, prompt, thinking, temperature, timeoutMs }) {
  const response = await getClient().models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      systemInstruction: system,
      responseMimeType: "application/json",
      responseJsonSchema: toGeminiSchema(schema),
      temperature,
      thinkingConfig: { thinkingLevel: THINKING[thinking] },
      abortSignal: AbortSignal.timeout(timeoutMs),
    },
  });

  let data;
  try {
    data = JSON.parse(response.text ?? "");
  } catch {
    throw new HttpError(502, "The AI sent back an unreadable answer. Try again.");
  }
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new HttpError(502, "The AI sent back an incomplete answer. Try again.");
  return parsed.data;
}

/**
 * Calls Gemini with a JSON schema and validates the reply against it.
 * Busy or rate-limited models are retried once, then the fast model is tried.
 */
export async function generateJson({
  schema,
  system,
  prompt,
  model = "smart",
  thinking = "low",
  temperature = 0.6,
  timeoutMs = 25_000,
  cacheable = true,
}) {
  const key = cacheKey([MODELS[model], system, prompt]);
  if (cacheable) {
    const hit = fromCache(key);
    if (hit) return hit;
  }

  const attempts = [MODELS[model], MODELS[model]];
  if (model !== "fast" && MODELS.fast !== MODELS[model]) attempts.push(MODELS.fast);

  let lastError;
  for (const [i, modelId] of attempts.entries()) {
    try {
      const data = await callModel(modelId, { schema, system, prompt, thinking, temperature, timeoutMs });
      if (cacheable) toCache(key, data);
      return data;
    } catch (error) {
      lastError = error;
      if (!isTransient(error)) break;
      if (i < attempts.length - 1) await sleep(i === 0 ? 700 : 200);
    }
  }
  throw aiError(lastError);
}
