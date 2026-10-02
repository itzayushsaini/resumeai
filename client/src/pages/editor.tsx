import { useState } from "react";
import { Link, useParams } from "react-router";
import type { ResumeDTO } from "@resumeai/shared";
import { Button } from "@/components/ui/button";
import { FullPageLoader } from "@/components/app/guards";
import { errorMessage } from "@/lib/api";
import { useResume } from "@/features/resume/api";
import { createEditorStore, EditorContext } from "@/features/editor/store";
import { useAutosave } from "@/features/editor/use-autosave";
import { EditorShell } from "@/features/editor/editor-shell";

function EditorRoot({ resume }: { resume: ResumeDTO }) {
  const [store] = useState(() => createEditorStore(resume));
  const flushRef = useAutosave(store);
  return (
    <EditorContext.Provider value={store}>
      <EditorShell flushRef={flushRef} />
    </EditorContext.Provider>
  );
}

export default function EditorPage() {
  const { id = "" } = useParams();
  const { data, isPending, error } = useResume(id);

  if (isPending) return <FullPageLoader />;
  if (error || !data) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-[34px]">Can't open this resume</h1>
        <p className="mt-2 text-ink-2">{error ? errorMessage(error) : "It may have been deleted."}</p>
        <Button variant="primary" className="mt-6" asChild>
          <Link to="/resumes">Back to resumes</Link>
        </Button>
      </div>
    );
  }
  return <EditorRoot key={data.id} resume={data} />;
}
