import { memo, useState, type ComponentType, type ReactNode } from "react";
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
  PlusIcon,
  TextAaIcon,
  TextAlignLeftIcon,
  TranslateIcon,
  TrashIcon,
  TrophyIcon,
  UserIcon,
  WrenchIcon,
  type IconProps,
} from "@phosphor-icons/react";
import { SECTION_META, SECTION_TYPES, type ResumeBasics, type ResumeSection, type SectionType } from "@resumeai/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useEditor } from "./store";
import { DragHandle, SortableList, useSortableItem } from "./sortable";
import { EntriesEditor } from "./entries-editor";
import { SkillsEditor } from "./skills-editor";

export const SECTION_ICONS: Record<SectionType, ComponentType<IconProps>> = {
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
}: {
  icon: ComponentType<IconProps>;
  title: ReactNode;
  meta?: ReactNode;
  open: boolean;
  onToggle: () => void;
  dragHandle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  muted?: boolean;
  dragging?: boolean;
  innerRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
}) {
  return (
    <section
      ref={innerRef}
      style={style}
      className={cn("rounded-lg border border-line bg-surface shadow-card", dragging && "shadow-pop")}
    >
      <div className={cn("flex h-[52px] items-center gap-1 pr-2", dragHandle ? "pl-1" : "pl-3")}>
        {dragHandle}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex h-full min-w-0 flex-1 items-center gap-2.5 text-left outline-none focus-visible:underline"
        >
          <span
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-md bg-ink/[0.045] dark:bg-white/[0.06]",
              muted ? "text-ink-4" : "text-ink-2",
            )}
          >
            <Icon className="size-4" />
          </span>
          <span className={cn("truncate text-[14px] font-semibold", muted ? "text-ink-3" : "text-ink")}>{title}</span>
          {meta}
        </button>
        {actions}
        <button
          type="button"
          onClick={onToggle}
          className="grid size-7 place-items-center rounded text-ink-3 hover:bg-ink/5"
          aria-label={open ? "Collapse" : "Expand"}
          tabIndex={-1}
        >
          <CaretDownIcon className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {open ? <div className="border-t border-line px-4 pt-4 pb-4">{children}</div> : null}
    </section>
  );
}

/* ------------------------------------------------------------------ */

const BASIC_FIELDS: { key: keyof ResumeBasics; label: string; placeholder: string; type?: string; wide?: boolean; max: number }[] = [
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
      meta={<span className="text-[12.5px] text-ink-3 tabular">{basics.name || `${filled}/${BASIC_FIELDS.length}`}</span>}
      open={open}
      onToggle={() => setOpen(open ? null : BASICS_ID)}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {BASIC_FIELDS.map((field) => (
          <Field key={field.key} label={field.label} className={field.wide ? "sm:col-span-2" : undefined}>
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

function SummaryEditor({ section }: { section: ResumeSection }) {
  const updateSection = useEditor((s) => s.updateSection);
  const length = section.text.trim().length;
  const tone = length === 0 ? "text-ink-4" : length < 200 || length > 700 ? "text-warn" : "text-good";
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
      <div className="mt-1.5 flex justify-between text-[12px]">
        <span className="text-ink-3">Lead with your role and years, then your strongest result.</span>
        <span className={cn("tabular", tone)}>{length} / 300–600</span>
      </div>
    </div>
  );
}

function SectionBody({ section }: { section: ResumeSection }) {
  if (section.type === "summary") return <SummaryEditor section={section} />;
  if (section.type === "skills") return <SkillsEditor section={section} />;
  return <EntriesEditor section={section} />;
}

function itemCount(section: ResumeSection) {
  if (section.type === "summary") return null;
  if (section.type === "skills") return section.groups.reduce((n, g) => n + g.keywords.length, 0);
  return section.entries.length;
}

const SectionCard = memo(function SectionCard({ section }: { section: ResumeSection }) {
  const open = useEditor((s) => s.openSection === section.id);
  const setOpen = useEditor((s) => s.setOpenSection);
  const updateSection = useEditor((s) => s.updateSection);
  const removeSection = useEditor((s) => s.removeSection);
  const sortable = useSortableItem(section.id);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(section.title);
  const Icon = SECTION_ICONS[section.type];
  const count = itemCount(section);

  function commitRename() {
    updateSection(section.id, { title: draft.trim() || SECTION_META[section.type].defaultTitle });
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
      className="h-7 w-full rounded border border-brand bg-surface px-1.5 text-[14px] font-semibold outline-none ring-[3px] ring-brand/15"
      aria-label="Section name"
    />
  ) : (
    section.title || SECTION_META[section.type].defaultTitle
  );

  return (
    <CardShell
      innerRef={sortable.ref}
      style={sortable.style}
      dragging={sortable.isDragging}
      icon={Icon}
      title={title}
      muted={!section.visible}
      meta={
        <>
          {count !== null ? <span className="text-[12.5px] text-ink-3 tabular">{count}</span> : null}
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
              size="icon-sm"
              className="size-7"
              onClick={() => updateSection(section.id, { visible: !section.visible })}
              aria-label={section.visible ? "Hide section" : "Show section"}
            >
              {section.visible ? <EyeIcon /> : <EyeSlashIcon />}
            </Button>
          </Tooltip>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="size-7" aria-label="Section actions">
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
      <p className="-mt-1 mb-3 text-[12.5px] text-ink-3">{SECTION_META[section.type].hint}</p>
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
        <button
          type="button"
          disabled={sections.length >= 20}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong text-[13.5px] font-medium text-ink-2 transition-colors hover:border-brand hover:bg-brand-soft/40 hover:text-brand-text"
        >
          <PlusIcon weight="bold" className="size-4" /> Add section
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-[300px]">
        <DropdownMenuLabel>Add a section</DropdownMenuLabel>
        {available.map((type) => {
          const Icon = SECTION_ICONS[type];
          return (
            <DropdownMenuItem key={type} icon={<Icon />} onSelect={() => addSection(type)} className="h-auto py-1.5">
              <span className="block text-[13px] text-ink">{SECTION_META[type].label}</span>
              <span className="block text-[12px] text-ink-3">{SECTION_META[type].hint}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ContentPanel() {
  const sections = useEditor((s) => s.content.sections);
  const moveSection = useEditor((s) => s.moveSection);

  return (
    <div className="flex flex-col gap-2.5 p-4">
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
