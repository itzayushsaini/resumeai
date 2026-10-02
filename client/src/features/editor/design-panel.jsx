import { CheckIcon } from "@phosphor-icons/react";
import { FONT_IDS, TEMPLATE_IDS } from "@resumeai/shared";
import { Segmented } from "@/components/ui/segmented";
import { cx } from "@/lib/utils";
import { ACCENTS, FONTS, TEMPLATES } from "@/features/resume/render/config";
import { ResumeThumbnail } from "@/features/resume/render/document";
import { useEditor } from "./store";

const TEMPLATE_FONT = { classic: "source-serif", modern: "ibm-plex-sans", minimal: "carlito" };

function Group({ label, hint, children }) {
  return (
    <section className="design-group">
      <div className="design-head">
        <h3>{label}</h3>
        {hint ? <span>{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

function Row({ label, children }) {
  return (
    <div className="design-row">
      <span>{label}</span>
      {children}
    </div>
  );
}

const LAYOUT_ROWS = [
  {
    key: "fontSize",
    label: "Text size",
    options: [
      { value: "sm", label: "Small" },
      { value: "md", label: "Medium" },
      { value: "lg", label: "Large" },
    ],
  },
  {
    key: "spacing",
    label: "Spacing",
    options: [
      { value: "compact", label: "Tight" },
      { value: "normal", label: "Normal" },
      { value: "relaxed", label: "Airy" },
    ],
  },
  {
    key: "margins",
    label: "Margins",
    options: [
      { value: "narrow", label: "Narrow" },
      { value: "normal", label: "Normal" },
      { value: "wide", label: "Wide" },
    ],
  },
  {
    key: "paper",
    label: "Paper",
    options: [
      { value: "letter", label: "US Letter" },
      { value: "a4", label: "A4" },
    ],
  },
];

export function DesignPanel() {
  const content = useEditor((s) => s.content);
  const settings = useEditor((s) => s.settings);
  const setSettings = useEditor((s) => s.setSettings);

  return (
    <div>
      <Group label="Template" hint="Your content, three layouts">
        <div className="template-choices">
          {TEMPLATE_IDS.map((id) => {
            const active = settings.template === id;
            const font = active ? settings.font : TEMPLATE_FONT[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSettings({ template: id, font })}
                aria-pressed={active}
                className={cx("template-choice", active && "is-active")}
              >
                <div className="template-choice-frame">
                  <ResumeThumbnail content={content} settings={{ ...settings, template: id, font }} width={124} />
                </div>
                <div className="template-choice-name">
                  {active ? <CheckIcon weight="bold" /> : null}
                  {TEMPLATES[id].name}
                </div>
              </button>
            );
          })}
        </div>
      </Group>

      <Group label="Accent color" hint={settings.template === "classic" ? "Used for section titles" : undefined}>
        <div className="accents" role="radiogroup" aria-label="Accent color">
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
                onClick={() => setSettings({ accent: accent.value })}
                className={cx("accent", active && "is-active")}
                style={{ background: accent.value }}
              >
                {active ? <CheckIcon weight="bold" /> : null}
              </button>
            );
          })}
        </div>
      </Group>

      <Group label="Font">
        <div className="fonts" role="radiogroup" aria-label="Font">
          {FONT_IDS.map((id) => {
            const font = FONTS[id];
            const active = settings.font === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSettings({ font: id })}
                className={cx("font-option", active && "is-active")}
              >
                <span className="font-sample" style={{ fontFamily: font.family }}>
                  Aa
                </span>
                <span className="font-name" style={{ fontFamily: font.family }}>
                  {font.label}
                </span>
                <span className="font-kind">{font.kind}</span>
              </button>
            );
          })}
        </div>
      </Group>

      <Group label="Layout">
        <div className="design-rows">
          {LAYOUT_ROWS.map((row) => (
            <Row key={row.key} label={row.label}>
              <Segmented
                size="sm"
                value={settings[row.key]}
                onChange={(value) => setSettings({ [row.key]: value })}
                aria-label={row.label}
                options={row.options}
              />
            </Row>
          ))}
        </div>
      </Group>
    </div>
  );
}
