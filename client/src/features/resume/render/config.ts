import "@fontsource-variable/source-serif-4";
import "@fontsource-variable/source-serif-4/wght-italic.css";
import "@fontsource-variable/eb-garamond";
import "@fontsource-variable/eb-garamond/wght-italic.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/400-italic.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/700.css";
import "@fontsource/carlito/400.css";
import "@fontsource/carlito/400-italic.css";
import "@fontsource/carlito/700.css";
import type { CSSProperties } from "react";
import type { FontId, ResumeSettings, TemplateId } from "@resumeai/shared";

export const PAGE_SIZE = {
  letter: { width: 816, height: 1056, label: "US Letter" },
  a4: { width: 794, height: 1123, label: "A4" },
} as const;

export const FONTS: Record<FontId, { label: string; family: string; scale: number; kind: "Serif" | "Sans" }> = {
  "source-serif": { label: "Source Serif", family: '"Source Serif 4 Variable", Georgia, serif', scale: 1, kind: "Serif" },
  "eb-garamond": { label: "EB Garamond", family: '"EB Garamond Variable", Garamond, Georgia, serif', scale: 1.08, kind: "Serif" },
  "ibm-plex-sans": { label: "IBM Plex Sans", family: '"IBM Plex Sans", Arial, sans-serif', scale: 0.96, kind: "Sans" },
  carlito: { label: "Carlito", family: "Carlito, Calibri, Arial, sans-serif", scale: 1.04, kind: "Sans" },
  "instrument-sans": { label: "Instrument Sans", family: '"Instrument Sans Variable", Arial, sans-serif', scale: 0.98, kind: "Sans" },
};

export const TEMPLATES: Record<TemplateId, { name: string; description: string }> = {
  classic: { name: "Classic", description: "Centered header and ruled sections. Safe for every ATS and every industry." },
  modern: { name: "Modern", description: "Left-aligned with a color accent. Reads well for tech, design and startups." },
  minimal: { name: "Minimal", description: "Quiet type, lots of air. Lets strong content speak for itself." },
};

export const ACCENTS = [
  { value: "#1a1a1a", label: "Ink" },
  { value: "#1f3a8a", label: "Navy" },
  { value: "#2448d8", label: "Cobalt" },
  { value: "#0f6e66", label: "Teal" },
  { value: "#8f1d3a", label: "Wine" },
  { value: "#8a4a12", label: "Umber" },
];

const BASE_SIZE = { sm: 12.5, md: 13.5, lg: 14.5 } as const;
const SPACING = { compact: 0.72, normal: 1, relaxed: 1.3 } as const;
const LINE_HEIGHT = { compact: 1.3, normal: 1.38, relaxed: 1.45 } as const;
const MARGIN = { narrow: 44, normal: 58, wide: 76 } as const;

export type Gap = "none" | "section" | "entry" | "item" | "bullet";

export interface Metrics {
  pageWidth: number;
  pageHeight: number;
  margin: number;
  contentWidth: number;
  contentHeight: number;
  fontSize: number;
  gaps: Record<Gap, number>;
}

export function getMetrics(settings: ResumeSettings): Metrics {
  const page = PAGE_SIZE[settings.paper];
  const margin = MARGIN[settings.margins];
  const fontSize = BASE_SIZE[settings.fontSize] * FONTS[settings.font].scale;
  const m = SPACING[settings.spacing];
  return {
    pageWidth: page.width,
    pageHeight: page.height,
    margin,
    contentWidth: page.width - margin * 2,
    contentHeight: page.height - margin * 2,
    fontSize,
    gaps: {
      none: 0,
      section: Math.round(fontSize * 1.2 * m),
      entry: Math.round(fontSize * 0.8 * m),
      item: Math.round(fontSize * 0.24 * m),
      bullet: Math.round(fontSize * 0.16 * m),
    },
  };
}

export function documentStyle(settings: ResumeSettings, metrics: Metrics): CSSProperties {
  return {
    "--rz-font": FONTS[settings.font].family,
    "--rz-size": `${metrics.fontSize}px`,
    "--rz-lh": LINE_HEIGHT[settings.spacing],
    "--rz-accent": settings.accent,
  } as CSSProperties;
}
