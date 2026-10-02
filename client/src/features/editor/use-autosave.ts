import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ResumeDTO } from "@resumeai/shared";
import { errorMessage } from "@/lib/api";
import { resumeKeys, saveResume } from "@/features/resume/api";
import type { EditorStore } from "./store";

const DELAY = 700;

/**
 * Saves the editor's document shortly after the user stops typing.
 * Returns `flush()` for callers that need the latest version on the server
 * (for example, before exporting a PDF).
 */
export function useAutosave(store: EditorStore) {
  const queryClient = useQueryClient();
  const flushRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let inFlight: Promise<void> | null = null;

    const payload = () => {
      const s = store.getState();
      return { title: s.title.trim() || "Untitled resume", content: s.content, settings: s.settings };
    };

    async function flush(): Promise<void> {
      clearTimeout(timer);
      if (inFlight) await inFlight;
      const state = store.getState();
      if (state.revision === state.savedRevision) return;

      const revision = state.revision;
      state.markSaving();
      inFlight = saveResume(state.id, payload())
        .then((saved) => {
          store.getState().markSaved(revision);
          queryClient.setQueryData(resumeKeys.detail(saved.id), saved);
          queryClient.setQueryData<ResumeDTO[]>(resumeKeys.all, (list) =>
            list ? [saved, ...list.filter((r) => r.id !== saved.id)] : list,
          );
        })
        .catch((error) => store.getState().markError(errorMessage(error)))
        .finally(() => {
          inFlight = null;
        });
      await inFlight;

      const after = store.getState();
      if (after.status === "pending") schedule();
    }

    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(() => void flush(), DELAY);
    }

    const unsubscribe = store.subscribe((state, previous) => {
      if (state.revision !== previous.revision) schedule();
    });

    function onBeforeUnload(event: BeforeUnloadEvent) {
      const s = store.getState();
      if (s.revision === s.savedRevision) return;
      void saveResume(s.id, payload(), { keepalive: true }).catch(() => {});
      if (s.status === "error") event.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);

    flushRef.current = flush;
    return () => {
      unsubscribe();
      window.removeEventListener("beforeunload", onBeforeUnload);
      void flush();
    };
  }, [store, queryClient]);

  return flushRef;
}
