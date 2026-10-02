import { memo, useState } from "react";
import {
  BriefcaseIcon,
  CaretDownIcon,
  CertificateIcon,
  CodeIcon,
  DotsThreeIcon,
  EyeIcon,
  EyeSlashIcon,
  GraduationCapIcon,
  HandHeartIcon,
  NotePencilIcon,
  PenNibIcon,
  PlusIcon,
  TextAaIcon,
  TextAlignLeftIcon,
  TranslateIcon,
  TrashIcon,
  TrophyIcon,
  UserIcon,
  WrenchIcon,
} from "@phosphor-icons/react";
import { SECTION_META, SECTION_TYPES } from "@resumeai/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cx } from "@/lib/utils";
import { useAiEnabled, useAiPrefs } from "@/features/ai/api";
import { SummaryWriter } from "@/features/ai/summary-writer";
import { useEditor } from "./store";
import { DragHandle, SortableList, useSortableItem } from "./sortable";
import { EntriesEditor } from "./entries-editor";
import { SkillsEditor } from "./skills-editor";

export const SECTION_ICONS = {
  summary: TextAlignLeftIcon,
  experience: BriefcaseIcon,
  education: GraduationCapIcon,
  skills: WrenchIcon,
  projects: CodeIcon,
  certifications: CertificateIcon,
  achievements: TrophyIcon,
  languages: TranslateIcon,
  volunteering: HandHeartIcon,
  custom: NotePencilIcon,
};

const BASICS_ID = "__basics";

function CardShell({
  icon: Icon,
  title,
  meta,
  open,
  onToggle,
  dragHandle,
  actions,
  children,
  muted,
  dragging,
  innerRef,
  style,
}) {
  return (
    <section
      ref={innerRef}
      style={style}
      className={cx("sec", open && "is-open", muted && "is-hidden", dragging && "is-dragging")}
    >
      <div className={cx("sec-head", !dragHandle && "no-handle")}>
        {dragHandle}
        <button type="button" onClick={onToggle} aria-expanded={open} className="sec-toggle">
          <span className="sec-icon">
            <Icon />
          </span>
          <span className="sec-title">{title}</span>
          {meta}
        </button>
        {actions}
        <button
          type="button"
          onClick={onToggle}
          className="caret-button"
          aria-label={open ? "Collapse" : "Expand"}
          tabIndex={-1}
        >
          <CaretDownIcon />
        </button>
      </div>
      {open ? <div className="sec-body">{children}</div> : null}
    </section>
  );
}

/* ------------------------------------------------------------------ */

const BASIC_FIELDS = [
  { key: "name", label: "Full name", placeholder: "Maya Chen", wide: true, max: 120 },
  { key: "headline", label: "Headline", placeholder: "Senior Frontend Engineer", wide: true, max: 160 },
  { key: "email", label: "Email", placeholder: "you@example.com", type: "email", max: 160 },
  { key: "phone", label: "Phone", placeholder: "(512) 555-0142", type: "tel", max: 60 },
  { key: "location", label: "City", placeholder: "Austin, TX", max: 120 },
  { key: "website", label: "Website", placeholder: "yourname.dev", max: 200 },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/you", max: 200 },
  { key: "github", label: "GitHub", placeholder: "github.com/you", max: 200 },
];

function BasicsCard() {
  const basics = useEditor((s) => s.content.basics);
  const updateBasics = useEditor((s) => s.updateBasics);
  const open = useEditor((s) => s.openSection === BASICS_ID);
  const setOpen = useEditor((s) => s.setOpenSection);
  const filled = BASIC_FIELDS.filter((f) => basics[f.key]).length;

  return (
    <CardShell
      icon={UserIcon}
      title="Personal details"
      meta={<span className="sec-count">{basics.name || `${filled}/${BASIC_FIELDS.length}`}</span>}
      open={open}
      onToggle={() => setOpen(open ? null : BASICS_ID)}
    >
      <div className="grid-2">
        {BASIC_FIELDS.map((field) => (
          <Field key={field.key} label={field.label} className={field.wide ? "span-2" : undefined}>
            {(props) => (
              <Input
                {...props}
                type={field.type ?? "text"}
                value={basics[field.key]}
                maxLength={field.max}
                placeholder={field.placeholder}
                onChange={(e) => updateBasics({ [field.key]: e.target.value })}
              />
            )}
          </Field>
        ))}
      </div>
    </CardShell>
  );
}

/* ------------------------------------------------------------------ */

function SummaryEditor({ section }) {
  const content = useEditor((s) => s.content);
  const updateSection = useEditor((s) => s.updateSection);
  const aiEnabled = useAiEnabled();
  const [writing, setWriting] = useState(false);
  const length = section.text.trim().length;
  const tone = length === 0 ? "is-empty" : length < 200 || length > 700 ? "is-warn" : "is-good";

  return (
    <div>
      <Textarea
        autoGrow
        rows={4}
        value={section.text}
        maxLength={4000}
        onChange={(e) => updateSection(section.id, { text: e.target.value })}
        placeholder="Frontend engineer with 6 years building fast, accessible web apps…"
        aria-label="Summary"
      />
      <div className="summary-meta">
        <span>Lead with your role and years, then your strongest result.</span>
        <span className={cx("summary-count", tone)}>{length} / 300–600</span>
      </div>
      {aiEnabled && !writing ? (
        <div style={{ marginTop: 10 }}>
          <Button variant="ai" size="sm" onClick={() => setWriting(true)}>
            <PenNibIcon /> Write with AI
          </Button>
        </div>
      ) : null}
      {writing ? (
        <SummaryWriter
          content={content}
          current={section.text}
          onClose={() => setWriting(false)}
          onUse={(text) => {
            updateSection(section.id, { text });
            setWriting(false);
          }}
        />
      ) : null}
    </div>
  );
}

function SectionBody({ section }) {
  if (section.type === "summary") return <SummaryEditor section={section} />;
  if (section.type === "skills") return <SkillsEditor section={section} />;
  return <EntriesEditor section={section} />;
}

function itemCount(section) {
  if (section.type === "summary") return null;
  if (section.type === "skills") return section.groups.reduce((n, g) => n + g.keywords.length, 0);
  return section.entries.length;
}

const SectionCard = memo(function SectionCard({ section }) {
  const open = useEditor((s) => s.openSection === section.id);
  const setOpen = useEditor((s) => s.setOpenSection);
  const updateSection = useEditor((s) => s.updateSection);
  const removeSection = useEditor((s) => s.removeSection);
  const sortable = useSortableItem(section.id);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(section.title);
  const count = itemCount(section);
  const defaultTitle = SECTION_META[section.type].defaultTitle;

  function commitRename() {
    updateSection(section.id, { title: draft.trim() || defaultTitle });
    setRenaming(false);
  }

  const title = renaming ? (
    <input
      autoFocus
      value={draft}
      maxLength={80}
      onChange={(e) => setDraft(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") commitRename();
        if (e.key === "Escape") setRenaming(false);
      }}
      onBlur={commitRename}
      className="sec-rename"
      aria-label="Section name"
    />
  ) : (
    section.title || defaultTitle
  );

  return (
    <CardShell
      innerRef={sortable.ref}
      style={sortable.style}
      dragging={sortable.isDragging}
      icon={SECTION_ICONS[section.type]}
      title={title}
      muted={!section.visible}
      meta={
        <>
          {count !== null ? <span className="sec-count">{count}</span> : null}
          {!section.visible ? <Badge>Hidden</Badge> : null}
        </>
      }
      open={open}
      onToggle={() => !renaming && setOpen(open ? null : section.id)}
      dragHandle={<DragHandle handle={sortable.handle} label={`Drag ${section.title}`} />}
      actions={
        <>
          <Tooltip content={section.visible ? "Hide from resume" : "Show on resume"}>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => updateSection(section.id, { visible: !section.visible })}
              aria-label={section.visible ? "Hide section" : "Show section"}
            >
              {section.visible ? <EyeIcon /> : <EyeSlashIcon />}
            </Button>
          </Tooltip>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" aria-label="Section actions">
                <DotsThreeIcon weight="bold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                icon={<TextAaIcon />}
                onSelect={() => {
                  setDraft(section.title);
                  setRenaming(true);
                }}
              >
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                icon={section.visible ? <EyeSlashIcon /> : <EyeIcon />}
                onSelect={() => updateSection(section.id, { visible: !section.visible })}
              >
                {section.visible ? "Hide from resume" : "Show on resume"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem icon={<TrashIcon />} tone="danger" onSelect={() => removeSection(section.id)}>
                Delete section
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    >
      <p className="sec-hint">{SECTION_META[section.type].hint}</p>
      <SectionBody section={section} />
    </CardShell>
  );
});

function AddSectionMenu() {
  const sections = useEditor((s) => s.content.sections);
  const addSection = useEditor((s) => s.addSection);
  const present = new Set(sections.map((s) => s.type));
  const available = SECTION_TYPES.filter((type) => type === "custom" || !present.has(type));

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button type="button" disabled={sections.length >= 20} className="add-section">
          <PlusIcon weight="bold" /> Add section
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" style={{ width: 300 }}>
        <DropdownMenuLabel>Add a section</DropdownMenuLabel>
        {available.map((type) => {
          const Icon = SECTION_ICONS[type];
          return (
            <DropdownMenuItem
              key={type}
              icon={<Icon />}
              hint={SECTION_META[type].hint}
              onSelect={() => addSection(type)}
            >
              {SECTION_META[type].label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AiBar() {
  const enabled = useAiEnabled();
  const autocomplete = useAiPrefs((s) => s.autocomplete);
  const setAutocomplete = useAiPrefs((s) => s.setAutocomplete);
  if (!enabled) return null;
  return (
    <div className="ai-bar">
      <div className="ai-bar-text">
        <div className="ai-bar-title">
          <PenNibIcon /> AI writing help is on
        </div>
        <div className="ai-bar-desc">
          Click into any bullet for checks and rewrites. Nothing changes until you accept it.
        </div>
      </div>
      <label className="switch-label" title="Grey suggestions while you type. Press Tab to accept.">
        Autocomplete
        <Switch checked={autocomplete} onCheckedChange={setAutocomplete} />
      </label>
    </div>
  );
}

export function ContentPanel() {
  const sections = useEditor((s) => s.content.sections);
  const moveSection = useEditor((s) => s.moveSection);

  return (
    <div className="content-list">
      <AiBar />
      <BasicsCard />
      <SortableList ids={sections.map((s) => s.id)} onMove={moveSection}>
        {sections.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </SortableList>
      <AddSectionMenu />
    </div>
  );
}
