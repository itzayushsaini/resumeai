import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import type { ResumeDTO } from "@resumeai/shared";
import { api, errorMessage } from "@/lib/api";
import { FONTS, PAGE_SIZE } from "@/features/resume/render/config";
import { ResumePages } from "@/features/resume/render/document";

declare global {
  interface Window {
    __RESUME_READY__?: boolean;
    __RESUME_ERROR__?: string;
  }
}

/**
 * Loaded only by the server's headless browser during PDF export.
 * It renders the exact same pages as the editor preview.
 */
export default function PrintPage() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const [resume, setResume] = useState<ResumeDTO | null>(null);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    const token = params.get("token") ?? "";
    api<ResumeDTO>(`/print/${id}?token=${encodeURIComponent(token)}`)
      .then(async (data) => {
        const family = FONTS[data.settings.font].family;
        await Promise.all(
          ["400", "600", "700", "italic 400"].map((weight) => document.fonts.load(`${weight} 16px ${family}`)),
        ).catch(() => {});
        setResume(data);
      })
      .catch((error) => {
        window.__RESUME_ERROR__ = errorMessage(error);
        window.__RESUME_READY__ = true;
      });
  }, [id, params]);

  const onLayout = useCallback(({ fontsLoaded }: { fontsLoaded: boolean }) => {
    if (!fontsLoaded) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        window.__RESUME_READY__ = true;
      }),
    );
  }, []);

  if (!resume) return null;
  const page = PAGE_SIZE[resume.settings.paper];

  return (
    <>
      <style>{`
        @page { size: ${page.width}px ${page.height}px; margin: 0; }
        html, body { margin: 0; padding: 0; background: #fff !important; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      `}</style>
      <ResumePages content={resume.content} settings={resume.settings} print onLayout={onLayout} />
    </>
  );
}
