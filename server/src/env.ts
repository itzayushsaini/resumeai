import { existsSync } from "node:fs";
import { z } from "zod";

if (existsSync(".env")) process.loadEnvFile(".env");

/** Treat empty strings in .env as "not set". */
const optional = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_URL: z.url().default("http://localhost:5173"),
  BETTER_AUTH_URL: z.url().default("http://localhost:5173"),
  MONGODB_URI: z
    .string()
    .trim()
    .min(1, "is empty. Paste your MongoDB Atlas connection string into server/.env"),
  BETTER_AUTH_SECRET: z.string().min(32, "must be at least 32 characters"),
  GEMINI_API_KEY: optional,
  GOOGLE_CLIENT_ID: optional,
  GOOGLE_CLIENT_SECRET: optional,
  LINKEDIN_CLIENT_ID: optional,
  LINKEDIN_CLIENT_SECRET: optional,
  CHROME_PATH: optional,
});

// API_PORT wins in development so tools that set PORT for the client dev server don't collide.
// In production, hosts set PORT and the API serves the client itself.
const parsed = schema.safeParse({ ...process.env, PORT: process.env.API_PORT ?? process.env.PORT });

if (!parsed.success) {
  console.error("\n  Server config problem in server/.env:\n");
  for (const issue of parsed.error.issues) {
    console.error(`   • ${issue.path.join(".")} ${issue.message}`);
  }
  console.error("");
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
