import "./editor.css";
import "@/features/ai/ai.css";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeftIcon, CheckIcon, DownloadSimpleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip } from "@/components/ui/tooltip";
import { errorMessage } from "@/lib/api";
import { cx } from "@/lib/utils";
import { downloadResumePdf } from "@/features/resume/api";
import { useEditor, useEditorStore } from "./store";
import { ContentPanel } from "./content-panel";
import { DesignPanel } from "./design-panel";
import { PreviewPane } from "./preview-pane";

function SaveIndicator({ flushRef }) {
  const status = useEditor((s) => s.status);
  const error = useEditor((s) => s.error);

  if (status === "error") {
    return (
      <Tooltip content={error ?? "Couldn't save"}>
        <button type="button" onClick={() => void flushRef.current()} className="save-error">
          <WarningCircleIcon weight="fill" />
          Not saved · Retry
        </button>
      </Tooltip>
    );
  }

  const saving = status === "saving" || status === "pending";
  return (
    <span className="save-status" aria-live="polite">
      {saving ? <Spinner size="sm" /> : <CheckIcon weight="bold" />}
      {saving ? "Saving…" : "Saved"}
    </span>
  );
}

function Topbar({ flushRef, view, onViewChange }) {
  const store = useEditorStore();
  const id = useEditor((s) => s.id);
  const title = useEditor((s) => s.title);
  const setTitle = useEditor((s) => s.setTitle);
  const [downloading, setDownloading] = useState(false);

  async function download() {
    setDownloading(true);
    try {
      await flushRef.current();
      if (store.getState().status === "error")
        throw new Error("Your latest changes aren't saved yet. Retry saving first.");
      await downloadResumePdf(id);
      toast.success("PDF downloaded");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <header className="editor-top">
      <Tooltip content="All resumes" side="bottom">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/resumes" aria-label="Back to resumes">
            <ArrowLeftIcon />
          </Link>
        </Button>
      </Tooltip>
      <div className="editor-top-sep" />
      <input
        value={title}
        maxLength={120}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => !title.trim() && setTitle("Untitled resume")}
        className="editor-title"
        aria-label="Resume name"
      />
      <SaveIndicator flushRef={flushRef} />
      <div className="editor-top-spacer" />
      <Segmented
        className="view-toggle"
        size="sm"
        value={view}
        onChange={onViewChange}
        aria-label="View"
        options={[
          { value: "edit", label: "Edit" },
          { value: "preview", label: "Preview" },
        ]}
      />
      <Button variant="primary" onClick={download} loading={downloading}>
        <DownloadSimpleIcon weight="bold" />
        <span className="hide-sm">Download PDF</span>
      </Button>
    </header>
  );
}

export function EditorShell({ flushRef }) {
  const [tab, setTab] = useState("content");
  const [view, setView] = useState("edit");
  const title = useEditor((s) => s.title);

  useEffect(() => {
    document.title = `${title || "Untitled resume"} · ResumeAI`;
    return () => {
      document.title = "ResumeAI";
    };
  }, [title]);

  useEffect(() => {
    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void flushRef.current().then(() => toast.success("Saved", { duration: 1200 }));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flushRef]);

  return (
    <div className="editor">
      <Topbar flushRef={flushRef} view={view} onViewChange={setView} />
      <div className="editor-body">
        <aside className={cx("editor-panel", view !== "edit" && "is-hidden")}>
          <div className="editor-panel-tabs">
            <Segmented
              block
              value={tab}
              onChange={setTab}
              aria-label="Panel"
              options={[
                { value: "content", label: "Content" },
                { value: "design", label: "Design" },
              ]}
            />
          </div>
          <div className="editor-panel-scroll scroll-thin">
            {tab === "content" ? <ContentPanel /> : <DesignPanel />}
          </div>
        </aside>
        <div className={cx("editor-preview", view !== "preview" && "is-hidden")}>
          <PreviewPane />
        </div>
      </div>
    </div>
  );
}
