import { CaretDownIcon, CopySimpleIcon, DotsThreeIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { SECTION_META, formatEntryDates, type ResumeEntry, type ResumeSection } from "@resumeai/shared";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useEditor } from "./store";
import { DragHandle, SortableList, useSortableItem } from "./sortable";
import { MonthInput } from "./month-input";
import { BulletsEditor } from "./bullets-editor";

const CURRENT_LABEL: Partial<Record<ResumeSection["type"], string>> = {
  experience: "I work here now",
  volunteering: "I'm still doing this",
  education: "Still studying",
};

function EntryFields({ section, entry }: { section: ResumeSection; entry: ResumeEntry }) {
  const updateEntry = useEditor((s) => s.updateEntry);
  const meta = SECTION_META[section.type];
  const set = (patch: Partial<ResumeEntry>) => updateEntry(section.id, entry.id, patch);
  const fields = meta.fields;

  return (
    <div className="flex flex-col gap-4 pt-1 pr-4 pb-4 pl-7">
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.title ? (
          <Field label={fields.title.label}>
            {(props) => (
              <Input {...props} value={entry.title} maxLength={200} placeholder={fields.title!.placeholder} onChange={(e) => set({ title: e.target.value })} />
            )}
          </Field>
        ) : null}
        {fields.subtitle ? (
          <Field label={fields.subtitle.label}>
            {(props) => (
              <Input {...props} value={entry.subtitle} maxLength={200} placeholder={fields.subtitle!.placeholder} onChange={(e) => set({ subtitle: e.target.value })} />
            )}
          </Field>
        ) : null}
        {fields.location ? (
          <Field label={fields.location.label}>
            {(props) => (
              <Input {...props} value={entry.location} maxLength={120} placeholder={fields.location!.placeholder} onChange={(e) => set({ location: e.target.value })} />
            )}
          </Field>
        ) : null}
        {fields.meta ? (
          <Field label={fields.meta.label}>
            {(props) => (
              <Input {...props} value={entry.meta} maxLength={200} placeholder={fields.meta!.placeholder} onChange={(e) => set({ meta: e.target.value })} />
            )}
          </Field>
        ) : null}
        {fields.link ? (
          <Field label={fields.link.label}>
            {(props) => (
              <Input {...props} value={entry.link} maxLength={300} placeholder={fields.link!.placeholder} onChange={(e) => set({ link: e.target.value })} />
            )}
          </Field>
        ) : null}
      </div>

      {meta.dates === "range" ? (
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Start">
              {(props) => <MonthInput id={props.id} value={entry.startDate} onChange={(v) => set({ startDate: v })} aria-label="Start date" />}
            </Field>
            <Field label="End">
              {(props) => (
                <MonthInput id={props.id} value={entry.endDate} onChange={(v) => set({ endDate: v })} disabled={entry.current} aria-label="End date" />
              )}
            </Field>
          </div>
          <label className="mt-2.5 inline-flex cursor-pointer items-center gap-2 text-[13px] text-ink-2">
            <Switch checked={entry.current} onCheckedChange={(checked) => set({ current: checked })} />
            {CURRENT_LABEL[section.type] ?? "Ongoing"}
          </label>
        </div>
      ) : meta.dates === "single" ? (
        <Field label="Date" className="sm:max-w-[calc(50%-6px)]">
          {(props) => <MonthInput id={props.id} value={entry.endDate} onChange={(v) => set({ endDate: v })} aria-label="Date" />}
        </Field>
      ) : null}

      {meta.bullets ? (
        <BulletsEditor
          bulletKey={entry.id}
          label={meta.bullets.label}
          placeholder={meta.bullets.placeholder}
          value={entry.bullets.length ? entry.bullets : [""]}
          onChange={(bullets) => set({ bullets })}
        />
      ) : null}
    </div>
  );
}

function EntryCard({ section, entry }: { section: ResumeSection; entry: ResumeEntry }) {
  const open = useEditor((s) => s.openEntry === entry.id);
  const setOpenEntry = useEditor((s) => s.setOpenEntry);
  const removeEntry = useEditor((s) => s.removeEntry);
  const duplicateEntry = useEditor((s) => s.duplicateEntry);
  const sortable = useSortableItem(entry.id);
  const meta = SECTION_META[section.type];

  const heading = [entry.title, entry.subtitle].filter(Boolean).join(" · ");
  const dates = formatEntryDates(entry, meta.dates);

  return (
    <div
      ref={sortable.ref}
      style={sortable.style}
      className={cn(
        "rounded-md border bg-surface transition-[border-color,box-shadow]",
        open ? "border-line-strong shadow-card" : "border-line",
        sortable.isDragging && "shadow-pop",
      )}
    >
      <div className="flex items-center gap-1 py-1.5 pr-1.5 pl-1">
        <DragHandle handle={sortable.handle} />
        <button
          type="button"
          onClick={() => setOpenEntry(open ? null : entry.id)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 rounded px-1 py-1 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className={cn("block truncate text-[13.5px] font-medium", heading ? "text-ink" : "text-ink-4")}>
              {heading || `New ${meta.label.toLowerCase()} item`}
            </span>
            {dates ? <span className="block truncate text-[12px] text-ink-3 tabular">{dates}</span> : null}
          </span>
          <CaretDownIcon className={cn("size-3.5 shrink-0 text-ink-3 transition-transform", open && "rotate-180")} />
        </button>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="size-7" aria-label="Item actions">
              <DotsThreeIcon weight="bold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem icon={<CopySimpleIcon />} onSelect={() => duplicateEntry(section.id, entry.id)}>
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem icon={<TrashIcon />} tone="danger" onSelect={() => removeEntry(section.id, entry.id)}>
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {open ? <EntryFields section={section} entry={entry} /> : null}
    </div>
  );
}

export function EntriesEditor({ section }: { section: ResumeSection }) {
  const addEntry = useEditor((s) => s.addEntry);
  const moveEntry = useEditor((s) => s.moveEntry);
  const meta = SECTION_META[section.type];

  return (
    <div className="flex flex-col gap-2">
      <SortableList ids={section.entries.map((e) => e.id)} onMove={(from, to) => moveEntry(section.id, from, to)}>
        {section.entries.map((entry) => (
          <EntryCard key={entry.id} section={section} entry={entry} />
        ))}
      </SortableList>
      <Button
        variant="ghost"
        size="sm"
        className="self-start text-brand-text hover:bg-brand-soft/60 hover:text-brand-text"
        onClick={() => addEntry(section.id)}
        disabled={section.entries.length >= 50}
      >
        <PlusIcon weight="bold" /> {meta.addLabel}
      </Button>
    </div>
  );
}
