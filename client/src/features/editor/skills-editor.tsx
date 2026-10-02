import { PlusIcon, XIcon } from "@phosphor-icons/react";
import type { ResumeSection, SkillGroup } from "@resumeai/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEditor } from "./store";
import { DragHandle, SortableList, useSortableItem } from "./sortable";
import { TagInput } from "./tag-input";

function GroupRow({ section, group, canRemove }: { section: ResumeSection; group: SkillGroup; canRemove: boolean }) {
  const updateGroup = useEditor((s) => s.updateGroup);
  const removeGroup = useEditor((s) => s.removeGroup);
  const sortable = useSortableItem(group.id);

  return (
    <div ref={sortable.ref} style={sortable.style} className="group">
      <div
        className={cn(
          "flex min-w-0 flex-col gap-1.5 rounded-md border border-line bg-surface-2 p-2.5 pl-1",
          sortable.isDragging && "shadow-pop",
        )}
      >
        <div className="flex items-center gap-1">
          <DragHandle handle={sortable.handle} label="Drag skill group" />
          <Input
            value={group.name}
            maxLength={80}
            onChange={(e) => updateGroup(section.id, group.id, { name: e.target.value })}
            placeholder="Group name, e.g. Languages"
            className="h-8 border-transparent bg-transparent px-1.5 font-medium shadow-none hover:border-line-strong focus:bg-surface"
            aria-label="Skill group name"
          />
          {canRemove ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-7 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              onClick={() => removeGroup(section.id, group.id)}
              aria-label="Remove group"
            >
              <XIcon />
            </Button>
          ) : null}
        </div>
        <div className="pl-6">
          <TagInput
            value={group.keywords}
            onChange={(keywords) => updateGroup(section.id, group.id, { keywords })}
            placeholder="Type a skill and press Enter"
            aria-label={`${group.name || "Skills"} keywords`}
          />
        </div>
      </div>
    </div>
  );
}

export function SkillsEditor({ section }: { section: ResumeSection }) {
  const addGroup = useEditor((s) => s.addGroup);
  const moveGroup = useEditor((s) => s.moveGroup);
  const total = section.groups.reduce((n, g) => n + g.keywords.length, 0);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12.5px] text-ink-3">
        {total} {total === 1 ? "skill" : "skills"}. Paste a comma-separated list to add many at once.
      </p>
      <div className="flex flex-col gap-2">
        <SortableList ids={section.groups.map((g) => g.id)} onMove={(from, to) => moveGroup(section.id, from, to)}>
          {section.groups.map((group) => (
            <GroupRow key={group.id} section={section} group={group} canRemove={section.groups.length > 1} />
          ))}
        </SortableList>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="self-start text-brand-text hover:bg-brand-soft/60 hover:text-brand-text"
        onClick={() => addGroup(section.id)}
        disabled={section.groups.length >= 20}
      >
        <PlusIcon weight="bold" /> Add group
      </Button>
    </div>
  );
}
