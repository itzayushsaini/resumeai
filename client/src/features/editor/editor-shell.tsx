import { useEffect, useState, type RefObject } from "react";
import { Link } from "react-router";
import { ArrowLeftIcon, CheckIcon, DownloadSimpleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip } from "@/components/ui/tooltip";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { downloadResumePdf } from "@/features/resume/api";
import { useEditor, useEditorStore } from "./store";
import { ContentPanel } from "./content-panel";
import { DesignPanel } from "./design-panel";
import { PreviewPane } from "./preview-pane";

type Flush = RefObject<() => Promise<void>>;

function SaveIndicator({ flushRef }: { flushRef: Flush }) {
  const status = useEditor((s) => s.status);
  const error = useEditor((s) => s.error);

  if (status === "error") {
    return (
      <Tooltip content={error ?? "Couldn't save"}>
        <button
          type="button"
          onClick={() => void flushRef.current()}
          className="inline-flex h-7 items-center gap-1.5 rounded-md bg-bad-soft px-2 text-[12.5px] font-medium text-bad"
        >
          <WarningCircleIcon weight="fill" className="size-3.5" />
          Not saved · Retry
        </button>
      </Tooltip>
    );
  }

  const saving = status === "saving" || status === "pending";
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-3" aria-live="polite">
      {saving ? <Spinner className="size-3" /> : <CheckIcon weight="bold" className="size-3" />}
      {saving ? "Saving…" : "Saved"}
    </span>
  );
}

function Topbar({
  flushRef,
  view,
  onViewChange,
}: {
  flushRef: Flush;
  view: "edit" | "preview";
  onViewChange: (view: "edit" | "preview") => void;
}) {
  const store = useEditorStore();
  const id = useEditor((s) => s.id);
  const title = useEditor((s) => s.title);
  const setTitle = useEditor((s) => s.setTitle);
  const [downloading, setDownloading] = useState(false);

  async function download() {
    setDownloading(true);
    try {
      await flushRef.current();
      if (store.getState().status === "error") throw new Error("Your latest changes aren't saved yet. Retry saving first.");
      await downloadResumePdf(id);
      toast.success("PDF downloaded");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface px-2 sm:px-3">
      <Tooltip content="All resumes" side="bottom">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/resumes" aria-label="Back to resumes">
            <ArrowLeftIcon />
          </Link>
        </Button>
      </Tooltip>
      <div className="h-5 w-px bg-line" />
      <input
        value={title}
        maxLength={120}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => !title.trim() && setTitle("Untitled resume")}
        className="h-8 w-[min(320px,40vw)] min-w-0 truncate rounded-md bg-transparent px-2 text-[14.5px] font-semibold text-ink outline-none transition-[background-color,box-shadow] hover:bg-ink/[0.04] focus:bg-surface focus:shadow-[inset_0_0_0_1px_var(--brand),0_0_0_3px_color-mix(in_oklab,var(--brand)_15%,transparent)]"
        aria-label="Resume name"
      />
      <div className="hidden sm:block">
        <SaveIndicator flushRef={flushRef} />
      </div>
      <div className="flex-1" />
      <Segmented
        className="lg:hidden"
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
        <span className="hidden sm:inline">Download PDF</span>
      </Button>
    </header>
  );
}

export function EditorShell({ flushRef }: { flushRef: Flush }) {
  const [tab, setTab] = useState<"content" | "design">("content");
  const [view, setView] = useState<"edit" | "preview">("edit");
  const title = useEditor((s) => s.title);

  useEffect(() => {
    document.title = `${title || "Untitled resume"} · ResumeAI`;
    return () => {
      document.title = "ResumeAI";
    };
  }, [title]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void flushRef.current().then(() => toast.success("Saved", { duration: 1200 }));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flushRef]);

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <Topbar flushRef={flushRef} view={view} onViewChange={setView} />
      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "min-h-0 w-full flex-col border-r border-line bg-canvas lg:flex lg:w-[460px] lg:shrink-0 xl:w-[500px]",
            view === "edit" ? "flex" : "hidden",
          )}
        >
          <div className="shrink-0 border-b border-line px-4 py-2.5">
            <Segmented
              className="flex w-full"
              value={tab}
              onChange={setTab}
              aria-label="Panel"
              options={[
                { value: "content", label: "Content" },
                { value: "design", label: "Design" },
              ]}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
            {tab === "content" ? <ContentPanel /> : <DesignPanel />}
          </div>
        </aside>
        <div className={cn("min-w-0 flex-1 flex-col lg:flex", view === "preview" ? "flex" : "hidden")}>
          <PreviewPane />
        </div>
      </div>
    </div>
  );
}
