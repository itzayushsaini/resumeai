import type { ReactNode } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { FONT_IDS, TEMPLATE_IDS, type ResumeSettings } from "@resumeai/shared";
import { Segmented } from "@/components/ui/segmented";
import { cn } from "@/lib/utils";
import { ACCENTS, FONTS, TEMPLATES } from "@/features/resume/render/config";
import { ResumeThumbnail } from "@/features/resume/render/document";
import { useEditor } from "./store";

function Group({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <section className="border-t border-line px-4 py-5 first:border-t-0">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-ink">{label}</h3>
        {hint ? <span className="text-[12px] text-ink-3">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

const TEMPLATE_FONT = { classic: "source-serif", modern: "ibm-plex-sans", minimal: "carlito" } as const;

export function DesignPanel() {
  const content = useEditor((s) => s.content);
  const settings = useEditor((s) => s.settings);
  const setSettings = useEditor((s) => s.setSettings);
  const set = <K extends keyof ResumeSettings>(key: K, value: ResumeSettings[K]) => setSettings({ [key]: value });

  return (
    <div>
      <Group label="Template" hint="Your content, three layouts">
        <div className="grid grid-cols-3 gap-3">
          {TEMPLATE_IDS.map((id) => {
            const active = settings.template === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSettings({ template: id, font: settings.template === id ? settings.font : TEMPLATE_FONT[id] })}
                aria-pressed={active}
                className="group text-left"
              >
                <div
                  className={cn(
                    "overflow-hidden rounded-[4px] bg-white ring-1 transition-[box-shadow]",
                    active
                      ? "ring-2 ring-brand shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_16%,transparent)]"
                      : "ring-black/10 group-hover:ring-ink-4 dark:ring-white/10",
                  )}
                >
                  <ResumeThumbnail
                    content={content}
                    settings={{ ...settings, template: id, font: active ? settings.font : TEMPLATE_FONT[id] }}
                    width={124}
                  />
                </div>
                <div className={cn("mt-2 flex items-center gap-1 text-[12.5px] font-medium", active ? "text-brand-text" : "text-ink-2")}>
                  {active ? <CheckIcon weight="bold" className="size-3" /> : null}
                  {TEMPLATES[id].name}
                </div>
              </button>
            );
          })}
        </div>
      </Group>

      <Group label="Accent color" hint={settings.template === "classic" ? "Used for section titles" : undefined}>
        <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Accent color">
          {ACCENTS.map((accent) => {
            const active = settings.accent.toLowerCase() === accent.value;
            return (
              <button
                key={accent.value}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={accent.label}
                title={accent.label}
                onClick={() => set("accent", accent.value)}
                className={cn(
                  "grid size-8 place-items-center rounded-full ring-offset-2 ring-offset-surface transition-[box-shadow]",
                  active ? "ring-2 ring-ink" : "ring-1 ring-black/10 hover:ring-2 hover:ring-ink-4",
                )}
                style={{ background: accent.value }}
              >
                {active ? <CheckIcon weight="bold" className="size-3.5 text-white" /> : null}
              </button>
            );
          })}
        </div>
      </Group>

      <Group label="Font">
        <div className="flex flex-col gap-1" role="radiogroup" aria-label="Font">
          {FONT_IDS.map((id) => {
            const font = FONTS[id];
            const active = settings.font === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => set("font", id)}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md border px-3 text-left transition-colors",
                  active ? "border-brand bg-brand-soft/50" : "border-transparent hover:bg-ink/[0.04]",
                )}
              >
                <span className="w-8 text-[20px] leading-none text-ink" style={{ fontFamily: font.family }}>
                  Aa
                </span>
                <span className="flex-1 text-[13.5px] text-ink" style={{ fontFamily: font.family }}>
                  {font.label}
                </span>
                <span className="text-[12px] text-ink-3">{font.kind}</span>
              </button>
            );
          })}
        </div>
      </Group>

      <Group label="Layout">
        <div className="grid gap-3.5">
          <Row label="Text size">
            <Segmented
              size="sm"
              value={settings.fontSize}
              onChange={(v) => set("fontSize", v)}
              aria-label="Text size"
              options={[
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
                { value: "lg", label: "Large" },
              ]}
            />
          </Row>
          <Row label="Spacing">
            <Segmented
              size="sm"
              value={settings.spacing}
              onChange={(v) => set("spacing", v)}
              aria-label="Spacing"
              options={[
                { value: "compact", label: "Tight" },
                { value: "normal", label: "Normal" },
                { value: "relaxed", label: "Airy" },
              ]}
            />
          </Row>
          <Row label="Margins">
            <Segmented
              size="sm"
              value={settings.margins}
              onChange={(v) => set("margins", v)}
              aria-label="Margins"
              options={[
                { value: "narrow", label: "Narrow" },
                { value: "normal", label: "Normal" },
                { value: "wide", label: "Wide" },
              ]}
            />
          </Row>
          <Row label="Paper">
            <Segmented
              size="sm"
              value={settings.paper}
              onChange={(v) => set("paper", v)}
              aria-label="Paper size"
              options={[
                { value: "letter", label: "US Letter" },
                { value: "a4", label: "A4" },
              ]}
            />
          </Row>
        </div>
      </Group>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-ink-2">{label}</span>
      {children}
    </div>
  );
}
