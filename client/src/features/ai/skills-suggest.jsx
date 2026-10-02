import { useState } from "react";
import { CheckIcon, PlusIcon, WrenchIcon, XIcon } from "@phosphor-icons/react";
import { resumeToText } from "@resumeai/shared";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { errorMessage } from "@/lib/api";
import { ai, useProfileContext } from "./api";

/**
 * Two kinds of suggestions, kept apart on purpose: skills your own resume
 * already proves, and skills the target role asks for (add only if true).
 */
export function SkillsSuggest({ content, existing, onAdd, onClose }) {
  const profile = useProfileContext();
  const [state, setState] = useState({ phase: "idle" });
  const [added, setAdded] = useState([]);
  const resumeText = resumeToText(content);

  async function load() {
    setState({ phase: "loading" });
    try {
      const data = await ai.skills({ resumeText, existing, targetRole: profile.targetRole });
      setState({ phase: "done", ...data });
    } catch (e) {
      setState({ phase: "error", message: errorMessage(e) });
    }
  }

  function add(skill) {
    onAdd(skill);
    setAdded((list) => [...list, skill.toLowerCase()]);
  }

  const chip = (skill, title) => {
    const isAdded =
      added.includes(skill.toLowerCase()) || existing.some((s) => s.toLowerCase() === skill.toLowerCase());
    return (
      <button
        key={skill}
        type="button"
        className="suggest-chip"
        title={title}
        disabled={isAdded}
        onClick={() => add(skill)}
      >
        {isAdded ? <CheckIcon weight="bold" /> : <PlusIcon weight="bold" />}
        {skill}
      </button>
    );
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel-head">
        <span className="ai-panel-title">
          <WrenchIcon /> Skill suggestions
        </span>
        <button type="button" className="ai-panel-close" onClick={onClose} aria-label="Close">
          <XIcon weight="bold" />
        </button>
      </div>

      {resumeText.length < 60 ? (
        <p className="ai-hint">Add some experience or projects first; suggestions come from what you've done.</p>
      ) : state.phase === "idle" ? (
        <div className="ai-panel-actions" style={{ marginTop: 0 }}>
          <Button variant="ai" size="sm" onClick={load}>
            <WrenchIcon /> Find skills
          </Button>
          <span className="ai-hint">
            Checks your bullets{profile.targetRole ? ` and what ${profile.targetRole} roles ask for` : ""}.
          </span>
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
            <Button size="sm" onClick={load}>
              Try again
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="suggest-group">
            <div className="suggest-heading">Already shown in your resume</div>
            {state.fromResume.length ? (
              <div className="suggest-chips">{state.fromResume.map((s) => chip(s.skill, `From: “${s.evidence}”`))}</div>
            ) : (
              <p className="suggest-note">Your skills list already covers what your bullets mention.</p>
            )}
          </div>
          {state.forRole.length ? (
            <div className="suggest-group">
              <div className="suggest-heading">
                Often asked for{profile.targetRole ? ` in ${profile.targetRole} roles` : ""}
              </div>
              <p className="suggest-note">Only add the ones you've really used.</p>
              <div className="suggest-chips">{state.forRole.map((s) => chip(s.skill, s.why))}</div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
