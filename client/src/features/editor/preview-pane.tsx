import { useCallback, useDeferredValue, useState } from "react";
import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { PAGE_SIZE } from "@/features/resume/render/config";
import { ResumePages, Scaled, useElementWidth } from "@/features/resume/render/document";
import { useEditor } from "./store";

const STEPS = [0.5, 0.67, 0.8, 1, 1.25, 1.5];

export function PreviewPane() {
  const content = useEditor((s) => s.content);
  const settings = useEditor((s) => s.settings);
  // Keep typing responsive: the preview may lag a frame behind on big edits.
  const deferredContent = useDeferredValue(content);
  const deferredSettings = useDeferredValue(settings);

  const [scrollRef, width] = useElementWidth<HTMLDivElement>();
  const [zoom, setZoom] = useState<"fit" | number>("fit");
  const [pageCount, setPageCount] = useState(1);
  const page = PAGE_SIZE[settings.paper];

  const fit = width ? Math.min(1.2, Math.max(0.35, (width - 72) / page.width)) : 0.7;
  const scale = zoom === "fit" ? fit : zoom;

  const onLayout = useCallback(({ pageCount }: { pageCount: number }) => setPageCount(pageCount), []);

  const zoomIn = () => setZoom(STEPS.find((s) => s > scale + 0.01) ?? STEPS[STEPS.length - 1]!);
  const zoomOut = () => setZoom([...STEPS].reverse().find((s) => s < scale - 0.01) ?? STEPS[0]!);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-sunken">
      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-line bg-canvas/80 px-4 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2 text-[12.5px] text-ink-3">
          <span className="font-medium text-ink-2 tabular">
            {pageCount} {pageCount === 1 ? "page" : "pages"}
          </span>
          <span aria-hidden>·</span>
          <span>{page.label}</span>
          {pageCount > 2 ? (
            <Badge tone="warn" className="ml-1 hidden sm:inline-flex">
              Most recruiters expect one or two pages
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-0.5">
          <Tooltip content="Zoom out">
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={zoomOut} aria-label="Zoom out">
              <MinusIcon />
            </Button>
          </Tooltip>
          <Tooltip content="Fit to width">
            <button
              type="button"
              onClick={() => setZoom("fit")}
              className="h-7 min-w-[52px] rounded px-1.5 text-[12.5px] text-ink-2 tabular hover:bg-ink/5"
            >
              {zoom === "fit" ? "Fit" : `${Math.round(scale * 100)}%`}
            </button>
          </Tooltip>
          <Tooltip content="Zoom in">
            <Button variant="ghost" size="icon-sm" className="size-7" onClick={zoomIn} aria-label="Zoom in">
              <PlusIcon />
            </Button>
          </Tooltip>
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto scrollbar-thin">
        <div className="flex min-w-max justify-center px-9 py-9">
          <Scaled scale={scale} width={page.width}>
            <ResumePages
              content={deferredContent}
              settings={deferredSettings}
              placeholders
              pageGap={Math.round(28 / scale)}
              pageClassName="shadow-page"
              onLayout={onLayout}
            />
          </Scaled>
        </div>
      </div>
    </div>
  );
}
