import "./resume.css";
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { ResumeContent, ResumeSettings } from "@resumeai/shared";
import { cn } from "@/lib/utils";
import { buildBlocks } from "./blocks";
import { documentStyle, getMetrics } from "./config";

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

/**
 * Greedy page filling. A block that would overflow starts a new page, and a
 * block marked keepWithNext only stays if the block after it fits too.
 * The gap above a block is dropped when it starts a page.
 */
export function paginate(heights: number[], gaps: number[], keep: boolean[], pageHeight: number): number[][] {
  const pages: number[][] = [[]];
  let used = 0;
  let i = 0;

  while (i < heights.length) {
    const page = pages[pages.length - 1]!;
    const atTop = page.length === 0;

    let end = i;
    while (keep[end] && end + 1 < heights.length) end++;
    let chain = 0;
    for (let j = i; j <= end; j++) chain += heights[j]! - (j === i && atTop ? gaps[j]! : 0);

    if (!atTop && used + chain > pageHeight + 0.5) {
      pages.push([]);
      used = 0;
      continue;
    }

    page.push(i);
    used += heights[i]! - (atTop ? gaps[i]! : 0);
    i++;
  }

  return pages;
}

function sameLayout(a: number[][] | null, b: number[][]) {
  if (!a || a.length !== b.length) return false;
  return a.every((page, i) => page.length === b[i]!.length && page.every((v, j) => v === b[i]![j]));
}

/** Bumps whenever web fonts finish loading, so layout is re-measured. */
function useFontsVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let alive = true;
    const bump = () => alive && setVersion((v) => v + 1);
    void document.fonts.ready.then(bump);
    document.fonts.addEventListener("loadingdone", bump);
    return () => {
      alive = false;
      document.fonts.removeEventListener("loadingdone", bump);
    };
  }, []);
  return version;
}

/* ------------------------------------------------------------------ */
/* Paginated document                                                  */
/* ------------------------------------------------------------------ */

interface ResumePagesProps {
  content: ResumeContent;
  settings: ResumeSettings;
  /** Show grey hints for empty fields (editor only). */
  placeholders?: boolean;
  /** Space between pages, in document pixels. */
  pageGap?: number;
  pageClassName?: string;
  /** Adds page-break rules for printing. */
  print?: boolean;
  onLayout?: (info: { pageCount: number; fontsLoaded: boolean }) => void;
}

export function ResumePages({
  content,
  settings,
  placeholders = false,
  pageGap = 0,
  pageClassName,
  print = false,
  onLayout,
}: ResumePagesProps) {
  const metrics = useMemo(() => getMetrics(settings), [settings]);
  const blocks = useMemo(() => buildBlocks(content, settings, { placeholders }), [content, settings, placeholders]);
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number[][] | null>(null);
  const fontsVersion = useFontsVersion();

  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root) return;
    const children = Array.from(root.children) as HTMLElement[];
    // Undo any CSS transform scaling applied by a parent preview.
    const scale = root.getBoundingClientRect().width / root.offsetWidth || 1;
    const heights = children.map((child) => child.getBoundingClientRect().height / scale);
    const next = paginate(
      heights,
      blocks.map((b) => metrics.gaps[b.gap]),
      blocks.map((b) => b.keepWithNext),
      metrics.contentHeight,
    );
    setPages((prev) => (sameLayout(prev, next) ? prev : next));
  }, [blocks, metrics, fontsVersion]);

  const pageCount = pages?.length ?? 1;
  useEffect(() => {
    if (pages) onLayout?.({ pageCount, fontsLoaded: fontsVersion > 0 });
  }, [pages, pageCount, fontsVersion, onLayout]);

  const layout = pages ?? [blocks.map((_, i) => i)];
  const style = documentStyle(settings, metrics);

  return (
    <div className={cn("rz", `rz--${settings.template}`)} style={{ ...style, width: metrics.pageWidth }}>
      <div style={{ display: "flex", flexDirection: "column", gap: pageGap }}>
        {layout.map((indexes, p) => (
          <div
            key={p}
            className={cn("rz-page", pageClassName)}
            data-page={p + 1}
            style={{
              width: metrics.pageWidth,
              height: metrics.pageHeight,
              padding: metrics.margin,
              breakAfter: print && p < layout.length - 1 ? "page" : undefined,
            }}
          >
            {indexes.map((i, k) => {
              const block = blocks[i];
              if (!block) return null;
              return (
                <div key={block.key} className="rz-block" style={{ paddingTop: k === 0 ? 0 : metrics.gaps[block.gap] }}>
                  {block.node}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div ref={measureRef} className="rz-measure" style={{ width: metrics.contentWidth }} aria-hidden>
        {blocks.map((block) => (
          <div key={block.key} className="rz-block" style={{ paddingTop: metrics.gaps[block.gap] }}>
            {block.node}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scaling helpers                                                     */
/* ------------------------------------------------------------------ */

export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Scales fixed-size content and reserves the scaled space in the layout. */
export function Scaled({ scale, width, children, className }: { scale: number; width: number; children: ReactNode; className?: string }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    setHeight(el.offsetHeight);
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={className} style={{ width: width * scale, height: height * scale }}>
      <div ref={innerRef} style={{ width, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Thumbnail (first page only, no measuring)                           */
/* ------------------------------------------------------------------ */

interface ThumbnailProps {
  content: ResumeContent;
  settings: ResumeSettings;
  width: number;
  className?: string;
  style?: CSSProperties;
}

export const ResumeThumbnail = memo(function ResumeThumbnail({ content, settings, width, className, style }: ThumbnailProps) {
  const metrics = useMemo(() => getMetrics(settings), [settings]);
  const blocks = useMemo(() => buildBlocks(content, settings, { links: false }), [content, settings]);
  const scale = width / metrics.pageWidth;

  return (
    <div
      className={cn("overflow-hidden bg-white", className)}
      style={{ width, height: metrics.pageHeight * scale, ...style }}
      aria-hidden
    >
      <div
        className={cn("rz", `rz--${settings.template}`)}
        style={{
          ...documentStyle(settings, metrics),
          width: metrics.pageWidth,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div className="rz-page" style={{ width: metrics.pageWidth, height: metrics.pageHeight, padding: metrics.margin }}>
          {blocks.map((block, k) => (
            <div key={block.key} className="rz-block" style={{ paddingTop: k === 0 ? 0 : metrics.gaps[block.gap] }}>
              {block.node}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
