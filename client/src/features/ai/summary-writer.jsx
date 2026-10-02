import { useState } from "react";
import { PenNibIcon, XIcon } from "@phosphor-icons/react";
import { resumeToText } from "@resumeai/shared";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { errorMessage } from "@/lib/api";
import { ai, useProfileContext } from "./api";

/** Three summary options written from the rest of the resume. */
export function SummaryWriter({ content, current, onUse, onClose }) {
  const profile = useProfileContext();
  const [state, setState] = useState({ phase: "idle" });
  const resumeText = resumeToText(content);
  const enoughToWork = resumeText.length > 120;

  async function write() {
    setState({ phase: "loading" });
    try {
      const data = await ai.summary({ resumeText, current, ...profile });
      setState({ phase: "done", options: data.options });
    } catch (e) {
      setState({ phase: "error", message: errorMessage(e) });
    }
  }

  return (
    <div className="ai-panel is-below">
      <div className="ai-panel-head">
        <span className="ai-panel-title">
          <PenNibIcon /> Summary from your resume
        </span>
        <button type="button" className="ai-panel-close" onClick={onClose} aria-label="Close">
          <XIcon weight="bold" />
        </button>
      </div>

      {!enoughToWork ? (
        <p className="ai-hint">Add a role or two first, so there's something real to summarise.</p>
      ) : state.phase === "idle" ? (
        <div className="ai-panel-actions" style={{ marginTop: 0 }}>
          <Button variant="ai" size="sm" onClick={write}>
            <PenNibIcon /> Write 3 options
          </Button>
          <span className="ai-hint">Built only from what's on your resume.</span>
        </div>
      ) : state.phase === "loading" ? (
        <p className="ai-hint" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Spinner size="sm" /> Reading your resume…
        </p>
      ) : state.phase === "error" ? (
        <>
          <p className="ai-error" style={{ marginTop: 0 }}>
            {state.message}
          </p>
          <div className="ai-panel-actions">
            <Button size="sm" onClick={write}>
              Try again
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="options">
            {state.options.map((option) => (
              <div key={option.label} className="option">
                <div className="option-top">
                  <span className="option-label">{option.label}</span>
                  <Button variant="primary" size="sm" onClick={() => onUse(option.text)}>
                    Use this
                  </Button>
                </div>
                <p className="option-text">{option.text}</p>
              </div>
            ))}
          </div>
          <div className="ai-panel-actions">
            <Button size="sm" onClick={write}>
              Write new options
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
