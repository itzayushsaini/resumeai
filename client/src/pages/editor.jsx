import { useState } from "react";
import { Link, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { FullPageLoader } from "@/components/app/guards";
import { errorMessage } from "@/lib/api";
import { useResume } from "@/features/resume/api";
import { createEditorStore, EditorContext } from "@/features/editor/store";
import { useAutosave } from "@/features/editor/use-autosave";
import { EditorShell } from "@/features/editor/editor-shell";

function EditorRoot({ resume }) {
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
      <div className="message-page">
        <h1 className="message-title">Can't open this resume</h1>
        <p className="message-text">{error ? errorMessage(error) : "It may have been deleted."}</p>
        <div className="message-actions">
          <Button variant="primary" asChild>
            <Link to="/resumes">Back to resumes</Link>
          </Button>
        </div>
      </div>
    );
  }
  return <EditorRoot key={data.id} resume={data} />;
}
