import { useMemo } from "react";
import { createExampleContent, resumeSettingsSchema } from "@resumeai/shared";
import { ResumeThumbnail } from "./render/document";
import { cx } from "@/lib/utils";

export function useExampleResume(template = "classic") {
  return useMemo(() => {
    const fonts = { classic: "source-serif", modern: "ibm-plex-sans", minimal: "carlito" };
    return {
      content: createExampleContent(),
      settings: resumeSettingsSchema.parse({
        template,
        font: fonts[template],
        accent: template === "modern" ? "#1f3a8a" : undefined,
      }),
    };
  }, [template]);
}

/** A real rendered resume page, used as a product visual. */
export function ResumeSheet({ template = "classic", width, className }) {
  const { content, settings } = useExampleResume(template);
  return (
    <div className={cx("resume-sheet", className)} style={{ width }}>
      <ResumeThumbnail content={content} settings={settings} width={width} />
    </div>
  );
}
