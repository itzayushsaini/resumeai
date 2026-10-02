import { PAGE_SIZE } from "./render/config";
import { ResumeThumbnail, useElementWidth } from "./render/document";

/** Thumbnail that fills the width of its container. */
export function FluidThumbnail({ content, settings }) {
  const [ref, width] = useElementWidth();
  const page = PAGE_SIZE[settings.paper];
  return (
    <div ref={ref} className="rz-thumb" style={{ width: "100%", aspectRatio: `${page.width} / ${page.height}` }}>
      {width > 0 ? <ResumeThumbnail content={content} settings={settings} width={width} /> : null}
    </div>
  );
}
