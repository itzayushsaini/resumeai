import { useMemo, useRef, useState } from "react";
import {
  ArrowsInLineHorizontalIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ChatTeardropTextIcon,
  CheckCircleIcon,
  HashIcon,
  PenNibIcon,
} from "@phosphor-icons/react";
import { checkBullet } from "@resumeai/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { errorMessage } from "@/lib/api";
import { ai } from "./api";

const ACTIONS = [
  { id: "improve", label: "Improve", icon: PenNibIcon },
  { id: "metric", label: "Add a number", icon: HashIcon },
  { id: "shorten", label: "Shorten", icon: ArrowsInLineHorizontalIcon },
  { id: "human", label: "Sound human", icon: ChatTeardropTextIcon },
];

/**
 * Shown under the bullet being edited: instant checks, AI actions, and the
 * suggestion card. Nothing changes the bullet until the person accepts it.
 */
export function BulletAssist({ text, context, aiEnabled, onApply }) {
  const issues = useMemo(() => checkBullet(text), [text]);
  const [state, setState] = useState({ phase: "idle" });
  const seen = useRef([]);
  const tooShort = text.trim().length < 8;

  async function run(action, { answer, again = false } = {}) {
    if (tooShort || state.phase === "loading") return;
    setState({ phase: "loading", action });
    try {
      const result = await ai.bullet({ action, text, answer, avoid: again ? seen.current : [], context });
      if (action === "metric" && !answer && result.question && result.options.length === 0) {
        setState({ phase: "ask", question: result.question, answer: "" });
        return;
      }
      if (!result.options.length) {
        setState({ phase: "note", message: "No clearly better version. This one may already be strong." });
        return;
      }
      seen.current = [...seen.current, ...result.options.map((o) => o.text)].slice(-6);
      setState({ phase: "result", action, options: result.options, index: 0, question: result.question, answer });
    } catch (error) {
      setState({ phase: "error", message: errorMessage(error) });
    }
  }

  function accept(next) {
    seen.current = [];
    setState({ phase: "idle" });
    onApply(next);
  }

  const busy = state.phase === "loading";

  return (
    <div className="assist">
      {issues.length ? (
        <div className="assist-issues">
          {issues.map((issue) => (
            <button
              key={issue.kind}
              type="button"
              className="issue"
              title={aiEnabled ? `${issue.detail} Click to fix with AI.` : issue.detail}
              disabled={!aiEnabled}
              aria-disabled={busy || undefined}
              onClick={() => run(issue.fix)}
            >
              {issue.label}
            </button>
          ))}
        </div>
      ) : text.trim().length >= 12 ? (
        <div className="assist-ok">
          <CheckCircleIcon weight="fill" /> Reads well: action first, with a result.
        </div>
      ) : null}

      {aiEnabled ? (
        <div className="assist-actions">
          <span className="ai-tag">AI</span>
          {ACTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className="ai-chip"
              disabled={tooShort}
              // aria-disabled (not disabled) while busy, so the clicked button keeps focus.
              aria-disabled={busy || undefined}
              onClick={() => run(id)}
            >
              {busy && state.action === id ? <Spinner /> : <Icon />}
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {state.phase === "result" ? (
        <Suggestion
          state={state}
          onPick={(index) => setState({ ...state, index })}
          onAccept={() => accept(state.options[state.index].text)}
          onAgain={() => run(state.action, { answer: state.answer, again: true })}
          onDismiss={() => setState({ phase: "idle" })}
          onAnswer={() => setState({ phase: "ask", question: state.question, answer: "" })}
        />
      ) : null}

      {state.phase === "ask" ? (
        <div className="suggestion">
          <div className="suggestion-label">One quick question</div>
          <p className="ask-question">{state.question}</p>
          <form
            className="ask-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (state.answer.trim()) run("metric", { answer: state.answer.trim() });
            }}
          >
            <Input
              autoFocus
              value={state.answer}
              maxLength={300}
              placeholder="e.g. about 2,000 a week"
              onChange={(e) => setState({ ...state, answer: e.target.value })}
              aria-label="Your answer"
            />
            <Button type="submit" variant="primary" size="sm" disabled={!state.answer.trim()}>
              Rewrite
            </Button>
          </form>
          <p className="ask-hint">We use exactly what you type. A rough number is fine.</p>
        </div>
      ) : null}

      {state.phase === "error" ? <p className="ai-error">{state.message}</p> : null}
      {state.phase === "note" ? <p className="ai-note">{state.message}</p> : null}
    </div>
  );
}

function Suggestion({ state, onPick, onAccept, onAgain, onDismiss, onAnswer }) {
  const option = state.options[state.index];
  const count = state.options.length;
  return (
    <div className="suggestion">
      <div className="suggestion-top">
        <span className="suggestion-label">Suggestion</span>
        {count > 1 ? (
          <span className="suggestion-nav">
            <button
              type="button"
              onClick={() => onPick(state.index - 1)}
              disabled={state.index === 0}
              aria-label="Previous"
            >
              <CaretLeftIcon weight="bold" />
            </button>
            <span className="tabular">
              {state.index + 1} of {count}
            </span>
            <button
              type="button"
              onClick={() => onPick(state.index + 1)}
              disabled={state.index === count - 1}
              aria-label="Next"
            >
              <CaretRightIcon weight="bold" />
            </button>
          </span>
        ) : null}
      </div>
      <p className="suggestion-text">{option.text}</p>
      {option.why ? <p className="suggestion-why">{option.why}</p> : null}
      {state.question && state.action !== "metric" ? (
        <div className="suggestion-question">
          <span>
            <strong>Stronger with a number:</strong> {state.question}
          </span>
          <Button size="sm" variant="secondary" onClick={onAnswer}>
            Answer
          </Button>
        </div>
      ) : null}
      <div className="suggestion-actions">
        <Button variant="primary" size="sm" onClick={onAccept}>
          Use this
        </Button>
        <Button size="sm" onClick={onAgain}>
          Try again
        </Button>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
