import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { errorMessage } from "@/lib/api";
import { resumeKeys, saveResume } from "@/features/resume/api";

const DELAY = 700;

/**
 * Saves the editor's document shortly after the user stops typing.
 * Returns `flush()` for callers that need the latest version on the server
 * (for example, before exporting a PDF).
 */
export function useAutosave(store) {
  const queryClient = useQueryClient();
  const flushRef = useRef(async () => {});

  useEffect(() => {
    let timer;
    let inFlight = null;

    const payload = () => {
      const s = store.getState();
      return { title: s.title.trim() || "Untitled resume", content: s.content, settings: s.settings };
    };

    async function flush() {
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
          queryClient.setQueryData(resumeKeys.all, (list) =>
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

    function onBeforeUnload(event) {
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
