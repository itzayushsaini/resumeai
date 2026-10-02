import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        targetRole: { type: "string", required: false },
        experienceLevel: { type: "string", required: false },
        onboarded: { type: "boolean", required: false },
      },
    }),
  ],
});

export const { useSession, signIn, signUp, signOut } = authClient;

export type SessionUser = NonNullable<ReturnType<typeof useSession>["data"]>["user"];
