import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DragHandle, SortableList, useSortableItem } from "./sortable";

interface BulletsEditorProps {
  bulletKey: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label: string;
}

function BulletRow({
  id,
  index,
  text,
  placeholder,
  onText,
  onKeyDown,
  onPaste,
  onRemove,
}: {
  id: string;
  index: number;
  text: string;
  placeholder?: string;
  onText: (text: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  onRemove: () => void;
}) {
  const sortable = useSortableItem(id);
  return (
    <div
      ref={sortable.ref}
      style={sortable.style}
      className={cn(
        "group/bullet relative flex items-start bg-surface first:rounded-t-[5px] last:rounded-b-[5px]",
        sortable.isDragging && "rounded-[5px] shadow-pop ring-1 ring-line-strong",
      )}
    >
      {/* The dot turns into a drag handle on hover. */}
      <div className="relative flex w-7 shrink-0 justify-center pt-[8px]">
        <span className="text-ink-4 transition-opacity group-hover/bullet:opacity-0" aria-hidden>
          •
        </span>
        <DragHandle
          handle={sortable.handle}
          className="absolute top-1 left-1 opacity-0 group-hover/bullet:opacity-100 focus-visible:opacity-100"
          label="Drag bullet"
        />
      </div>
      <Textarea
        autoGrow
        rows={1}
        data-bullet={index}
        value={text}
        maxLength={1000}
        placeholder={index === 0 ? placeholder : undefined}
        onChange={(e) => onText(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        className="min-h-9 flex-1 rounded-none border-0 bg-transparent py-[7px] pr-8 pl-0 shadow-none hover:border-0 focus:border-0 focus:ring-0"
        aria-label={`Bullet ${index + 1}`}
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-1.5 grid size-5 place-items-center rounded text-ink-4 opacity-0 group-hover/bullet:opacity-100 hover:bg-ink/5 hover:text-ink focus-visible:opacity-100"
        aria-label={`Remove bullet ${index + 1}`}
      >
        <XIcon className="size-3" weight="bold" />
      </button>
    </div>
  );
}

export function BulletsEditor({ bulletKey, value, onChange, placeholder, label }: BulletsEditorProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const ids = value.map((_, i) => `${bulletKey}-${i}`);

  function focusBullet(index: number, atEnd = true) {
    requestAnimationFrame(() => {
      const el = listRef.current?.querySelector<HTMLTextAreaElement>(`[data-bullet="${index}"]`);
      if (!el) return;
      el.focus();
      const pos = atEnd ? el.value.length : 0;
      el.setSelectionRange(pos, pos);
    });
  }

  function update(index: number, text: string) {
    onChange(value.map((b, i) => (i === index ? text : b)));
  }

  function insertAfter(index: number, texts: string[]) {
    const next = value.slice();
    next.splice(index + 1, 0, ...texts);
    onChange(next.slice(0, 40));
    focusBullet(index + texts.length);
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLTextAreaElement>) {
    const el = event.currentTarget;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const before = el.value.slice(0, el.selectionStart);
      const after = el.value.slice(el.selectionEnd);
      const next = value.slice();
      next[index] = before.trimEnd();
      next.splice(index + 1, 0, after.trimStart());
      onChange(next.slice(0, 40));
      focusBullet(index + 1, false);
    } else if (event.key === "Backspace" && el.selectionStart === 0 && el.selectionEnd === 0 && index > 0) {
      event.preventDefault();
      const previous = value[index - 1] ?? "";
      const next = value.slice();
      next[index - 1] = previous + el.value;
      next.splice(index, 1);
      onChange(next);
      requestAnimationFrame(() => {
        const prevEl = listRef.current?.querySelector<HTMLTextAreaElement>(`[data-bullet="${index - 1}"]`);
        if (prevEl) {
          prevEl.focus();
          prevEl.setSelectionRange(previous.length, previous.length);
        }
      });
    } else if (event.key === "ArrowUp" && el.selectionStart === 0 && index > 0) {
      event.preventDefault();
      focusBullet(index - 1);
    } else if (event.key === "ArrowDown" && el.selectionStart === el.value.length && index < value.length - 1) {
      event.preventDefault();
      focusBullet(index + 1, false);
    }
  }

  function onPaste(index: number, event: ClipboardEvent<HTMLTextAreaElement>) {
    const text = event.clipboardData.getData("text");
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*([•▪◦‣\-–*]|\d+[.)])\s*/, "").trim())
      .filter(Boolean);
    if (lines.length < 2) return;
    event.preventDefault();
    const el = event.currentTarget;
    const current = value[index] ?? "";
    const merged = (current.slice(0, el.selectionStart) + lines[0] + current.slice(el.selectionEnd)).trim();
    const next = value.slice();
    next[index] = merged;
    onChange(next);
    insertAfter(index, lines.slice(1));
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-medium text-ink-2">{label}</span>
        <span className="text-[12px] text-ink-4">Enter adds a bullet · paste a list to split it</span>
      </div>
      <div
        ref={listRef}
        className={cn(
          "flex flex-col divide-y divide-line rounded-md border border-line-strong bg-surface",
          "transition-[border-color,box-shadow] focus-within:border-brand focus-within:ring-[3px] focus-within:ring-brand/15",
        )}
      >
        <SortableList
          ids={ids}
          onMove={(from, to) => {
            const next = value.slice();
            const [item] = next.splice(from, 1);
            next.splice(to, 0, item ?? "");
            onChange(next);
          }}
        >
          {value.map((text, i) => (
            <BulletRow
              key={ids[i]}
              id={ids[i]!}
              index={i}
              text={text}
              placeholder={placeholder}
              onText={(t) => update(i, t)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onPaste={(e) => onPaste(i, e)}
              onRemove={() => onChange(value.filter((_, j) => j !== i))}
            />
          ))}
        </SortableList>
      </div>
      <button
        type="button"
        onClick={() => insertAfter(value.length - 1, [""])}
        disabled={value.length >= 40}
        className="mt-2 inline-flex h-7 items-center gap-1.5 rounded-md px-1.5 text-[13px] font-medium text-brand-text hover:bg-brand-soft/60"
      >
        <PlusIcon className="size-3.5" weight="bold" /> Add bullet
      </button>
    </div>
  );
}
