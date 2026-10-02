import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useAppConfig } from "@/lib/config";

/** True when the server has a Gemini key configured. */
export function useAiEnabled() {
  const { data } = useAppConfig();
  return Boolean(data?.aiEnabled);
}

const post = (path) => (body, init) => api(`/ai/${path}`, { method: "POST", body, ...init });

export const ai = {
  /** { action, text, answer?, avoid?, context } → { options: [{ text, why }], question } */
  bullet: post("bullet"),
  /** { notes, context } → { bullets, questions } */
  notes: post("notes"),
  /** { resumeText, current, targetRole, experienceLevel } → { options: [{ label, text }] } */
  summary: post("summary"),
  /** { resumeText, existing, targetRole } → { fromResume: [{ skill, evidence }], forRole: [{ skill, why }] } */
  skills: post("skills"),
  /** { text, context } → { completion } */
  complete: post("complete"),
};

/** Target role and level from the profile; sent with every writing request. */
export function useProfileContext() {
  const { data } = useSession();
  return {
    targetRole: data?.user.targetRole ?? "",
    experienceLevel: data?.user.experienceLevel ?? "",
  };
}

/** Per-browser AI preferences. */
export const useAiPrefs = create(
  persist(
    (set) => ({
      autocomplete: true,
      setAutocomplete: (autocomplete) => set({ autocomplete }),
    }),
    { name: "ai-prefs" },
  ),
);
