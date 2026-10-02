import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import type { Db } from "mongodb";
import { env } from "./env";
import { Resume } from "./models/resume";

function socialProviders() {
  const providers: Record<string, { clientId: string; clientSecret: string }> = {};
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.google = { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET };
  }
  if (env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET) {
    providers.linkedin = { clientId: env.LINKEDIN_CLIENT_ID, clientSecret: env.LINKEDIN_CLIENT_SECRET };
  }
  return providers;
}

export const enabledSocialProviders = Object.keys(socialProviders());

export function createAuth(db: Db) {
  return betterAuth({
    appName: "ResumeAI",
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.CLIENT_URL],
    database: mongodbAdapter(db),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
    },
    socialProviders: socialProviders(),
    session: {
      // Avoid a database read on every request; sessions are re-checked every 5 minutes.
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    user: {
      additionalFields: {
        targetRole: { type: "string", required: false, defaultValue: "", input: true },
        experienceLevel: { type: "string", required: false, defaultValue: "", input: true },
        onboarded: { type: "boolean", required: false, defaultValue: false, input: true },
      },
      deleteUser: {
        enabled: true,
        beforeDelete: async (user) => {
          await Resume.deleteMany({ userId: user.id });
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type SessionUser = Auth["$Infer"]["Session"]["user"];

let instance: Auth | null = null;

export function setAuth(auth: Auth) {
  instance = auth;
}

export function getAuth(): Auth {
  if (!instance) throw new Error("Auth used before the database connected");
  return instance;
}
