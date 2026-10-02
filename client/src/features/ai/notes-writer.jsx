import { useState } from "react";
import { PenNibIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { cx } from "@/lib/utils";
import { errorMessage } from "@/lib/api";
import { ai } from "./api";

/**
 * "Write from notes": describe the work in plain words (any language,
 * Hinglish included) and get English resume bullets to pick from.
 */
export function NotesWriter({ context, onAdd, onClose }) {
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [picked, setPicked] = useState([]);

  async function write() {
    setPending(true);
    setError(null);
    try {
      const data = await ai.notes({ notes, context });
      setResult(data);
      setPicked(data.bullets.map(() => true));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setPending(false);
    }
  }

  const chosen = result ? result.bullets.filter((_, i) => picked[i]) : [];

  return (
    <div className="ai-panel">
      <div className="ai-panel-head">
        <span className="ai-panel-title">
          <PenNibIcon /> Write bullets from your notes
        </span>
        <button type="button" className="ai-panel-close" onClick={onClose} aria-label="Close">
          <XIcon weight="bold" />
        </button>
      </div>

      <Textarea
        autoGrow
        rows={3}
        autoFocus
        value={notes}
        maxLength={2000}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Plain words or Hinglish is fine. e.g. maine booking form dobara banaya, pehle log beech mein chhod dete the…"
        aria-label="Your notes"
      />
      <div className="ai-panel-actions">
        <Button variant="ai" size="sm" loading={pending} disabled={notes.trim().length < 5} onClick={write}>
          <PenNibIcon /> {result ? "Write again" : "Write bullets"}
        </Button>
        <span className="ai-hint">Only facts from your notes are used.</span>
      </div>

      {error ? <p className="ai-error">{error}</p> : null}

      {result ? (
        <>
          <ul className="picks">
            {result.bullets.map((bullet, i) => (
              <li key={i}>
                <label className={cx("pick", !picked[i] && "is-off")}>
                  <input
                    type="checkbox"
                    checked={picked[i] ?? false}
                    onChange={(e) => setPicked(picked.map((v, j) => (j === i ? e.target.checked : v)))}
                  />
                  <span>{bullet}</span>
                </label>
              </li>
            ))}
          </ul>
          {result.questions.length ? (
            <div className="ai-questions">
              <strong>Add these to make them stronger</strong>
              <ul>
                {result.questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="ai-panel-actions">
            <Button variant="primary" size="sm" disabled={!chosen.length} onClick={() => onAdd(chosen)}>
              Add {chosen.length} {chosen.length === 1 ? "bullet" : "bullets"}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
