import { CaretDownIcon, CopySimpleIcon, DotsThreeIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { SECTION_META, formatEntryDates } from "@resumeai/shared";
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
import { cx } from "@/lib/utils";
import { useEditor } from "./store";
import { DragHandle, SortableList, useSortableItem } from "./sortable";
import { MonthInput } from "./month-input";
import { BulletsEditor } from "./bullets-editor";

const CURRENT_LABEL = {
  experience: "I work here now",
  volunteering: "I'm still doing this",
  education: "Still studying",
};

const TEXT_FIELDS = [
  { key: "title", max: 200 },
  { key: "subtitle", max: 200 },
  { key: "location", max: 120 },
  { key: "meta", max: 200 },
  { key: "link", max: 300 },
];

function EntryFields({ section, entry }) {
  const updateEntry = useEditor((s) => s.updateEntry);
  const meta = SECTION_META[section.type];
  const set = (patch) => updateEntry(section.id, entry.id, patch);

  return (
    <div className="entry-body">
      <div className="grid-2">
        {TEXT_FIELDS.filter(({ key }) => meta.fields[key]).map(({ key, max }) => (
          <Field key={key} label={meta.fields[key].label}>
            {(props) => (
              <Input
                {...props}
                value={entry[key]}
                maxLength={max}
                placeholder={meta.fields[key].placeholder}
                onChange={(e) => set({ [key]: e.target.value })}
              />
            )}
          </Field>
        ))}
      </div>

      {meta.dates === "range" ? (
        <div>
          <div className="grid-2">
            <Field label="Start">
              {(props) => (
                <MonthInput
                  id={props.id}
                  value={entry.startDate}
                  onChange={(v) => set({ startDate: v })}
                  aria-label="Start date"
                />
              )}
            </Field>
            <Field label="End">
              {(props) => (
                <MonthInput
                  id={props.id}
                  value={entry.endDate}
                  onChange={(v) => set({ endDate: v })}
                  disabled={entry.current}
                  aria-label="End date"
                />
              )}
            </Field>
          </div>
          <label className="switch-label current-toggle">
            <Switch checked={entry.current} onCheckedChange={(checked) => set({ current: checked })} />
            {CURRENT_LABEL[section.type] ?? "Ongoing"}
          </label>
        </div>
      ) : meta.dates === "single" ? (
        <Field label="Date" className="half">
          {(props) => (
            <MonthInput id={props.id} value={entry.endDate} onChange={(v) => set({ endDate: v })} aria-label="Date" />
          )}
        </Field>
      ) : null}

      {meta.bullets ? (
        <BulletsEditor
          bulletKey={entry.id}
          label={meta.bullets.label}
          placeholder={meta.bullets.placeholder}
          value={entry.bullets.length ? entry.bullets : [""]}
          onChange={(bullets) => set({ bullets })}
          context={{
            sectionType: section.type,
            title: entry.title,
            organization: entry.subtitle,
            current: entry.current,
          }}
        />
      ) : null}
    </div>
  );
}

function EntryCard({ section, entry }) {
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
      className={cx("entry", open && "is-open", sortable.isDragging && "is-dragging")}
    >
      <div className="entry-head">
        <DragHandle handle={sortable.handle} />
        <button
          type="button"
          onClick={() => setOpenEntry(open ? null : entry.id)}
          aria-expanded={open}
          className="entry-toggle"
        >
          <span className="entry-text">
            <span className={cx("entry-heading", !heading && "is-empty")}>
              {heading || `New ${meta.label.toLowerCase()} item`}
            </span>
            {dates ? <span className="entry-dates">{dates}</span> : null}
          </span>
          <span className="caret-button" aria-hidden>
            <CaretDownIcon />
          </span>
        </button>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs" aria-label="Item actions">
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

export function EntriesEditor({ section }) {
  const addEntry = useEditor((s) => s.addEntry);
  const moveEntry = useEditor((s) => s.moveEntry);
  const meta = SECTION_META[section.type];

  return (
    <div className="entries">
      <SortableList ids={section.entries.map((e) => e.id)} onMove={(from, to) => moveEntry(section.id, from, to)}>
        {section.entries.map((entry) => (
          <EntryCard key={entry.id} section={section} entry={entry} />
        ))}
      </SortableList>
      <button
        type="button"
        className="add-btn"
        onClick={() => addEntry(section.id)}
        disabled={section.entries.length >= 50}
      >
        <PlusIcon weight="bold" /> {meta.addLabel}
      </button>
    </div>
  );
}
