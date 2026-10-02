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

  const [scrollRef, width] = useElementWidth();
  const [zoom, setZoom] = useState("fit");
  const [pageCount, setPageCount] = useState(1);
  const page = PAGE_SIZE[settings.paper];

  const fit = width ? Math.min(1.2, Math.max(0.35, (width - 72) / page.width)) : 0.7;
  const scale = zoom === "fit" ? fit : zoom;

  const onLayout = useCallback(({ pageCount }) => setPageCount(pageCount), []);
  const zoomIn = () => setZoom(STEPS.find((s) => s > scale + 0.01) ?? STEPS[STEPS.length - 1]);
  const zoomOut = () => setZoom([...STEPS].reverse().find((s) => s < scale - 0.01) ?? STEPS[0]);

  return (
    <div className="preview">
      <div className="preview-bar">
        <div className="preview-info">
          <strong className="tabular">
            {pageCount} {pageCount === 1 ? "page" : "pages"}
          </strong>
          <span aria-hidden>·</span>
          <span>{page.label}</span>
          {pageCount > 2 ? (
            <Badge tone="warn" className="preview-warning">
              Most recruiters expect one or two pages
            </Badge>
          ) : null}
        </div>
        <div className="zoom">
          <Tooltip content="Zoom out">
            <Button variant="ghost" size="icon-xs" onClick={zoomOut} aria-label="Zoom out">
              <MinusIcon />
            </Button>
          </Tooltip>
          <Tooltip content="Fit to width">
            <button type="button" onClick={() => setZoom("fit")} className="zoom-value">
              {zoom === "fit" ? "Fit" : `${Math.round(scale * 100)}%`}
            </button>
          </Tooltip>
          <Tooltip content="Zoom in">
            <Button variant="ghost" size="icon-xs" onClick={zoomIn} aria-label="Zoom in">
              <PlusIcon />
            </Button>
          </Tooltip>
        </div>
      </div>

      <div ref={scrollRef} className="preview-scroll scroll-thin">
        <div className="preview-stage">
          <Scaled scale={scale} width={page.width}>
            <ResumePages
              content={deferredContent}
              settings={deferredSettings}
              placeholders
              pageGap={Math.round(28 / scale)}
              pageClassName="is-preview"
              onLayout={onLayout}
            />
          </Scaled>
        </div>
      </div>
    </div>
  );
}
