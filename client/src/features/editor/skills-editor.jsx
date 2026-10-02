import { useState } from "react";
import { PlusIcon, WrenchIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cx } from "@/lib/utils";
import { useAiEnabled } from "@/features/ai/api";
import { SkillsSuggest } from "@/features/ai/skills-suggest";
import { useEditor } from "./store";
import { DragHandle, SortableList, useSortableItem } from "./sortable";
import { TagInput } from "./tag-input";

function GroupRow({ section, group, canRemove }) {
  const updateGroup = useEditor((s) => s.updateGroup);
  const removeGroup = useEditor((s) => s.removeGroup);
  const sortable = useSortableItem(group.id);

  return (
    <div ref={sortable.ref} style={sortable.style} className={cx("skill-group", sortable.isDragging && "is-dragging")}>
      <div className="skill-group-head">
        <DragHandle handle={sortable.handle} label="Drag skill group" />
        <Input
          className="skill-name"
          value={group.name}
          maxLength={80}
          onChange={(e) => updateGroup(section.id, group.id, { name: e.target.value })}
          placeholder="Group name, e.g. Languages"
          aria-label="Skill group name"
        />
        {canRemove ? (
          <Button
            variant="ghost"
            size="icon-xs"
            className="skill-remove"
            onClick={() => removeGroup(section.id, group.id)}
            aria-label="Remove group"
          >
            <XIcon />
          </Button>
        ) : null}
      </div>
      <div className="skill-tags">
        <TagInput
          value={group.keywords}
          onChange={(keywords) => updateGroup(section.id, group.id, { keywords })}
          placeholder="Type a skill and press Enter"
          aria-label={`${group.name || "Skills"} keywords`}
        />
      </div>
    </div>
  );
}

export function SkillsEditor({ section }) {
  const content = useEditor((s) => s.content);
  const addGroup = useEditor((s) => s.addGroup);
  const moveGroup = useEditor((s) => s.moveGroup);
  const updateGroup = useEditor((s) => s.updateGroup);
  const aiEnabled = useAiEnabled();
  const [suggesting, setSuggesting] = useState(false);
  const existing = section.groups.flatMap((g) => g.keywords);

  function addSkill(skill) {
    const target = section.groups[0];
    if (!target) return;
    updateGroup(section.id, target.id, { keywords: [...target.keywords, skill].slice(0, 60) });
  }

  return (
    <div className="skills">
      <div className="bullets-head" style={{ marginBottom: 0 }}>
        <p className="skills-meta">
          {existing.length} {existing.length === 1 ? "skill" : "skills"}. Paste a comma-separated list to add many at
          once.
        </p>
        {aiEnabled ? (
          <Button variant="ai" size="sm" onClick={() => setSuggesting((open) => !open)} aria-expanded={suggesting}>
            <WrenchIcon /> Suggest skills
          </Button>
        ) : null}
      </div>

      {suggesting ? (
        <SkillsSuggest content={content} existing={existing} onAdd={addSkill} onClose={() => setSuggesting(false)} />
      ) : null}

      <SortableList ids={section.groups.map((g) => g.id)} onMove={(from, to) => moveGroup(section.id, from, to)}>
        {section.groups.map((group) => (
          <GroupRow key={group.id} section={section} group={group} canRemove={section.groups.length > 1} />
        ))}
      </SortableList>
      <button
        type="button"
        className="add-btn"
        onClick={() => addGroup(section.id)}
        disabled={section.groups.length >= 20}
      >
        <PlusIcon weight="bold" /> Add group
      </button>
    </div>
  );
}
