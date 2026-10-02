import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../env.js";

/**
 * Short-lived signed token that lets the headless browser load one resume's
 * print page without a user session.
 */
function sign(payload) {
  return createHmac("sha256", env.BETTER_AUTH_SECRET).update(`print:${payload}`).digest("base64url");
}

export function createPrintToken(resumeId, ttlMs = 60_000) {
  const expires = Date.now() + ttlMs;
  return `${expires}.${sign(`${resumeId}.${expires}`)}`;
}

export function verifyPrintToken(resumeId, token) {
  const [expiresRaw, signature] = token.split(".");
  const expires = Number(expiresRaw);
  if (!signature || !Number.isFinite(expires) || expires < Date.now()) return false;
  const expected = Buffer.from(sign(`${resumeId}.${expires}`));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
