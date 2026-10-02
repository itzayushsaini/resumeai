import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  max?: number;
  "aria-label"?: string;
}

/** Chips input: Enter or comma adds, Backspace removes, pasting a list adds all of it. */
export function TagInput({ value, onChange, placeholder, max = 60, ...rest }: TagInputProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function commit(text: string) {
    const parts = text
      .split(/[,;\n\t•]+/)
      .map((t) => t.trim().slice(0, 80))
      .filter(Boolean);
    setDraft("");
    if (!parts.length) return;
    const seen = new Set(value.map((v) => v.toLowerCase()));
    const additions = parts.filter((p) => {
      const key = p.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (additions.length) onChange([...value, ...additions].slice(0, max));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit(draft);
    } else if (event.key === "Backspace" && !draft && value.length) {
      event.preventDefault();
      onChange(value.slice(0, -1));
    }
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text");
    if (/[,;\n\t]/.test(text)) {
      event.preventDefault();
      commit(draft + text);
    }
  }

  return (
    <div
      className={cn(
        "flex min-h-9 w-full cursor-text flex-wrap items-center gap-1 rounded-md border border-line-strong bg-surface p-1",
        "shadow-[inset_0_1px_1px_rgb(20_22_30/0.03)] transition-[border-color,box-shadow]",
        "hover:border-ink-4/70 focus-within:border-brand focus-within:ring-[3px] focus-within:ring-brand/15",
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex h-6 items-center gap-1 rounded-[5px] bg-ink/[0.06] pr-1 pl-2 text-[12.5px] text-ink dark:bg-white/[0.08]"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(value.filter((_, j) => j !== i));
            }}
            className="grid size-4 place-items-center rounded-sm text-ink-3 hover:bg-ink/10 hover:text-ink"
            aria-label={`Remove ${tag}`}
          >
            <XIcon className="size-2.5" weight="bold" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onBlur={() => commit(draft)}
        placeholder={value.length ? "" : placeholder}
        className="h-6 min-w-[120px] flex-1 bg-transparent px-1.5 text-sm text-ink outline-none placeholder:text-ink-4"
        aria-label={rest["aria-label"]}
      />
    </div>
  );
}
