import { useMemo } from "react";
import { createExampleContent, resumeSettingsSchema, type TemplateId } from "@resumeai/shared";
import { ResumeThumbnail } from "./render/document";
import { cn } from "@/lib/utils";

export function useExampleResume(template: TemplateId = "classic") {
  return useMemo(() => {
    const fonts = { classic: "source-serif", modern: "ibm-plex-sans", minimal: "carlito" } as const;
    return {
      content: createExampleContent(),
      settings: resumeSettingsSchema.parse({ template, font: fonts[template], accent: template === "modern" ? "#1f3a8a" : undefined }),
    };
  }, [template]);
}

/** A real rendered resume page, used as a product visual. */
export function ResumeSheet({
  template = "classic",
  width,
  className,
}: {
  template?: TemplateId;
  width: number;
  className?: string;
}) {
  const { content, settings } = useExampleResume(template);
  return (
    <div className={cn("overflow-hidden rounded-[3px] bg-white shadow-page ring-1 ring-black/5", className)} style={{ width }}>
      <ResumeThumbnail content={content} settings={settings} width={width} />
    </div>
  );
}
