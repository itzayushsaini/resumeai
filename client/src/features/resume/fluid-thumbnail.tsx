import type { ResumeContent, ResumeSettings } from "@resumeai/shared";
import { PAGE_SIZE } from "./render/config";
import { ResumeThumbnail, useElementWidth } from "./render/document";

/** Thumbnail that fills the width of its container. */
export function FluidThumbnail({ content, settings }: { content: ResumeContent; settings: ResumeSettings }) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const page = PAGE_SIZE[settings.paper];
  return (
    <div ref={ref} className="w-full bg-white" style={{ aspectRatio: `${page.width} / ${page.height}` }}>
      {width > 0 ? <ResumeThumbnail content={content} settings={settings} width={width} /> : null}
    </div>
  );
}
