import { useRef, useState } from "react";
import { XIcon } from "@phosphor-icons/react";

/** Chips input: Enter or comma adds, Backspace removes, pasting a list adds all of it. */
export function TagInput({ value, onChange, placeholder, max = 60, ...rest }) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  function commit(text) {
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

  function onKeyDown(event) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit(draft);
    } else if (event.key === "Backspace" && !draft && value.length) {
      event.preventDefault();
      onChange(value.slice(0, -1));
    }
  }

  function onPaste(event) {
    const text = event.clipboardData.getData("text");
    if (/[,;\n\t]/.test(text)) {
      event.preventDefault();
      commit(draft + text);
    }
  }

  return (
    <div className="tags" onClick={() => inputRef.current?.focus()}>
      {value.map((tag, i) => (
        <span key={`${tag}-${i}`} className="tag">
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(value.filter((_, j) => j !== i));
            }}
            aria-label={`Remove ${tag}`}
          >
            <XIcon weight="bold" />
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
        aria-label={rest["aria-label"]}
      />
    </div>
  );
}
