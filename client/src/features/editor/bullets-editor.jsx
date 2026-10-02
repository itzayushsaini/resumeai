import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { PenNibIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { checkBullet } from "@resumeai/shared";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/utils";
import { ai, useAiEnabled, useAiPrefs, useProfileContext } from "@/features/ai/api";
import { BulletAssist } from "@/features/ai/bullet-assist";
import { NotesWriter } from "@/features/ai/notes-writer";
import { DragHandle, SortableList, useSortableItem } from "./sortable";

/**
 * Grey "ghost" completion after the cursor, like code autocomplete.
 * Only asks the AI after a pause, with the cursor at the end of the text.
 */
function useGhostCompletion({ enabled, focused, text, inputRef, contextRef }) {
  const [ghost, setGhost] = useState("");
  const latest = useRef(text);
  latest.current = text;

  useEffect(() => {
    setGhost("");
    if (!enabled || !focused) return;
    const value = text;
    const trimmed = value.trim();
    if (trimmed.length < 18 || value.length > 400 || /[.!?;:]$/.test(trimmed)) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const el = inputRef.current;
      if (!el || el.selectionStart !== el.value.length) return;
      try {
        const { completion } = await ai.complete(
          { text: value, context: contextRef.current },
          { signal: controller.signal },
        );
        if (latest.current === value && completion.trim()) setGhost(completion);
      } catch {
        // Autocomplete is best-effort; the explicit AI actions report errors.
      }
    }, 900);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [enabled, focused, text, inputRef, contextRef]);

  return [ghost, setGhost];
}

function BulletRow({
  id,
  index,
  text,
  placeholder,
  active,
  showFlag,
  aiEnabled,
  autocomplete,
  context,
  onText,
  onKeyDown,
  onPaste,
  onRemove,
}) {
  const sortable = useSortableItem(id);
  const inputRef = useRef(null);
  const ghostRef = useRef(null);
  const contextRef = useRef(context);
  contextRef.current = context;
  const [focused, setFocused] = useState(false);
  const [ghost, setGhost] = useGhostCompletion({
    enabled: aiEnabled && autocomplete,
    focused,
    text,
    inputRef,
    contextRef,
  });

  // Grow with the text, and with the ghost text when it wraps to a new line.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    const ghostHeight = ghost && ghostRef.current ? ghostRef.current.scrollHeight : 0;
    el.style.height = `${Math.max(el.scrollHeight, ghostHeight)}px`;
  }, [text, ghost]);

  function handleKeyDown(event) {
    if (ghost && event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();
      onText(text + ghost);
      setGhost("");
      return;
    }
    if (ghost && event.key === "Escape") {
      setGhost("");
      return;
    }
    onKeyDown(event);
  }

  return (
    <div
      ref={sortable.ref}
      style={sortable.style}
      className={cx("bullet-item", sortable.isDragging && "is-dragging")}
      data-index={index}
    >
      <div className="bullet">
        <div className="bullet-gutter">
          <span className="bullet-dot" aria-hidden>
            •
          </span>
          <DragHandle handle={sortable.handle} label="Drag bullet" />
        </div>
        <div className="bullet-field">
          <textarea
            ref={inputRef}
            className="bullet-input"
            rows={1}
            data-bullet={index}
            value={text}
            maxLength={1000}
            placeholder={index === 0 ? placeholder : undefined}
            onChange={(e) => onText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={onPaste}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              setGhost("");
            }}
            aria-label={`Bullet ${index + 1}`}
          />
          {ghost ? (
            <div ref={ghostRef} className="bullet-ghost" aria-hidden>
              <span className="ghost-prefix">{text}</span>
              <span className="ghost-text">{ghost}</span>
              <span className="ghost-key">Tab</span>
            </div>
          ) : null}
        </div>
        {showFlag ? <span className="bullet-flag" /> : null}
        <button type="button" onClick={onRemove} className="bullet-remove" aria-label={`Remove bullet ${index + 1}`}>
          <XIcon weight="bold" />
        </button>
      </div>
      {active ? (
        <BulletAssist
          text={text}
          context={context}
          aiEnabled={aiEnabled}
          onApply={(next) => {
            onText(next);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
        />
      ) : null}
    </div>
  );
}

export function BulletsEditor({ bulletKey, value, onChange, placeholder, label, context }) {
  const listRef = useRef(null);
  const ids = value.map((_, i) => `${bulletKey}-${i}`);
  const aiEnabled = useAiEnabled();
  const autocomplete = useAiPrefs((s) => s.autocomplete);
  const profile = useProfileContext();
  const [activeIndex, setActiveIndex] = useState(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const issueCounts = useMemo(() => value.map((t) => checkBullet(t).length), [value]);

  const baseContext = { ...context, ...profile };
  const contextFor = (i) => ({
    ...baseContext,
    otherBullets: value.filter((b, j) => j !== i && b.trim()).slice(0, 8),
  });

  function focusBullet(index, atEnd = true) {
    requestAnimationFrame(() => {
      const el = listRef.current?.querySelector(`[data-bullet="${index}"]`);
      if (!el) return;
      el.focus();
      const pos = atEnd ? el.value.length : 0;
      el.setSelectionRange(pos, pos);
    });
  }

  function update(index, text) {
    onChange(value.map((b, i) => (i === index ? text : b)));
  }

  function insertAfter(index, texts) {
    const next = value.slice();
    next.splice(index + 1, 0, ...texts);
    onChange(next.slice(0, 40));
    focusBullet(index + texts.length);
  }

  function onKeyDown(index, event) {
    const el = event.currentTarget;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const next = value.slice();
      next[index] = el.value.slice(0, el.selectionStart).trimEnd();
      next.splice(index + 1, 0, el.value.slice(el.selectionEnd).trimStart());
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
        const prevEl = listRef.current?.querySelector(`[data-bullet="${index - 1}"]`);
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

  function onPaste(index, event) {
    const text = event.clipboardData.getData("text");
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*([•▪◦‣\-–*]|\d+[.)])\s*/, "").trim())
      .filter(Boolean);
    if (lines.length < 2) return;
    event.preventDefault();
    const el = event.currentTarget;
    const current = value[index] ?? "";
    const next = value.slice();
    next[index] = (current.slice(0, el.selectionStart) + lines[0] + current.slice(el.selectionEnd)).trim();
    next.splice(index + 1, 0, ...lines.slice(1));
    onChange(next.slice(0, 40));
    focusBullet(index + lines.length - 1);
  }

  // The assist strip follows focus anywhere inside the list (bullet or its strip).
  function onFocus(event) {
    const item = event.target.closest?.(".bullet-item");
    if (item?.dataset.index) setActiveIndex(Number(item.dataset.index));
  }

  // Close only when focus moves to another field. A null target (clicking blank
  // space, or a button disabling itself while the AI works) keeps the strip open.
  function onBlur(event) {
    if (event.relatedTarget && !listRef.current?.contains(event.relatedTarget)) setActiveIndex(null);
  }

  return (
    <div>
      <div className="bullets-head">
        <span className="bullets-label">{label}</span>
        {aiEnabled ? (
          <Button variant="ai" size="sm" onClick={() => setNotesOpen((open) => !open)} aria-expanded={notesOpen}>
            <PenNibIcon /> Write from notes
          </Button>
        ) : null}
      </div>

      {notesOpen ? (
        <NotesWriter
          context={baseContext}
          onClose={() => setNotesOpen(false)}
          onAdd={(bullets) => {
            const kept = value.filter((b) => b.trim());
            onChange([...kept, ...bullets].slice(0, 40));
            setNotesOpen(false);
          }}
        />
      ) : null}

      <div ref={listRef} className="bullets" onFocus={onFocus} onBlur={onBlur}>
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
              id={ids[i]}
              index={i}
              text={text}
              placeholder={placeholder}
              active={activeIndex === i}
              showFlag={activeIndex !== i && issueCounts[i] > 0}
              aiEnabled={aiEnabled}
              autocomplete={autocomplete}
              context={contextFor(i)}
              onText={(t) => update(i, t)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onPaste={(e) => onPaste(i, e)}
              onRemove={() => onChange(value.filter((_, j) => j !== i))}
            />
          ))}
        </SortableList>
      </div>

      <div className="bullets-foot">
        <button
          type="button"
          className="add-btn"
          onClick={() => insertAfter(value.length - 1, [""])}
          disabled={value.length >= 40}
        >
          <PlusIcon weight="bold" /> Add bullet
        </button>
        <span className="bullets-tip">
          {aiEnabled && autocomplete ? "Enter for a new bullet · Tab accepts AI text" : "Enter for a new bullet"}
        </span>
      </div>
    </div>
  );
}
