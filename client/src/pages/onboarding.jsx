import "./onboarding.css";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeftIcon, ArrowRightIcon, BookOpenTextIcon, FilePlusIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient, useSession } from "@/lib/auth-client";
import { api, errorMessage } from "@/lib/api";
import { cx, firstName } from "@/lib/utils";
import { EXPERIENCE_LEVELS, ROLE_SUGGESTIONS } from "@/features/profile/options";
import { resumeKeys } from "@/features/resume/api";

const STEPS = ["Target role", "Experience", "First resume"];

function Choice({ selected, onClick, title, hint, icon }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={cx("choice", selected && "is-selected")}>
      {icon ? <span className="choice-icon">{icon}</span> : null}
      <span className="choice-text">
        <span className="choice-title">{title}</span>
        <span className="choice-hint">{hint}</span>
      </span>
      <span className="choice-radio" />
    </button>
  );
}

export default function OnboardingPage() {
  const { data } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(data?.user.targetRole ?? "");
  const [level, setLevel] = useState(data?.user.experienceLevel ?? "");
  const [starter, setStarter] = useState("blank");
  const [pending, setPending] = useState(false);

  const canContinue = step === 0 ? role.trim().length > 1 : step === 1 ? Boolean(level) : true;
  const name = firstName(data?.user.name);

  async function finish(skip = false) {
    setPending(true);
    try {
      const { error } = await authClient.updateUser({
        targetRole: skip ? (data?.user.targetRole ?? "") : role.trim(),
        experienceLevel: skip ? (data?.user.experienceLevel ?? "") : level,
        onboarded: true,
      });
      if (error) throw new Error(error.message ?? "Couldn't save your answers.");
      await authClient.getSession({ query: { disableCookieCache: true } });

      if (skip) {
        navigate("/dashboard", { replace: true });
        return;
      }
      const resume = await api("/resumes", {
        method: "POST",
        body: { starter, targetRole: role.trim(), title: `${role.trim()} resume` },
      });
      queryClient.setQueryData(resumeKeys.detail(resume.id), resume);
      await queryClient.invalidateQueries({ queryKey: resumeKeys.all });
      navigate(`/resumes/${resume.id}/edit`, { replace: true });
    } catch (error) {
      toast.error(errorMessage(error));
      setPending(false);
    }
  }

  return (
    <div className="onboarding">
      <header className="onboarding-top">
        <Logo />
        <Button variant="ghost" size="sm" onClick={() => finish(true)} disabled={pending}>
          Skip for now
        </Button>
      </header>

      <main className="onboarding-main">
        <div className="onboarding-box">
          <ol className="steps" aria-label="Progress">
            {STEPS.map((label, i) => (
              <li
                key={label}
                className={cx("step", i <= step && "is-done", i === step && "is-current")}
                aria-current={i === step ? "step" : undefined}
              >
                <div className="step-bar" />
                <div className="step-label">{label}</div>
              </li>
            ))}
          </ol>

          <div key={step} className="animate-slide-up">
            {step === 0 ? (
              <>
                <h1 className="onboarding-title">{name ? `${name}, what` : "What"} job are you going for?</h1>
                <p className="onboarding-lead">
                  We use this to pick the right keywords and skills to check for. You can change it any time.
                </p>
                <Input
                  className="onboarding-input"
                  size="xl"
                  placeholder="e.g. Frontend Developer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canContinue && setStep(1)}
                  autoFocus
                  aria-label="Target role"
                />
                <div className="chips">
                  {ROLE_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setRole(suggestion)}
                      className={cx("chip", role === suggestion && "is-selected")}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <h1 className="onboarding-title">How much experience do you have?</h1>
                <p className="onboarding-lead">
                  This changes what we expect to see, like whether projects should come before work history.
                </p>
                <div className="choices">
                  {EXPERIENCE_LEVELS.map((option) => (
                    <Choice
                      key={option.value}
                      selected={level === option.value}
                      onClick={() => setLevel(option.value)}
                      title={option.label}
                      hint={option.hint}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <h1 className="onboarding-title">How do you want to start?</h1>
                <p className="onboarding-lead">Either way you can switch templates and edit everything later.</p>
                <div className="choices">
                  <Choice
                    selected={starter === "blank"}
                    onClick={() => setStarter("blank")}
                    icon={<FilePlusIcon />}
                    title="Start from scratch"
                    hint="We'll fill in your name, email and target role."
                  />
                  <Choice
                    selected={starter === "example"}
                    onClick={() => setStarter("example")}
                    icon={<BookOpenTextIcon />}
                    title="Start from a finished example"
                    hint="See what a strong resume looks like, then replace it with yours."
                  />
                </div>
              </>
            ) : null}
          </div>

          <div className="onboarding-nav">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={pending}>
                <ArrowLeftIcon /> Back
              </Button>
            ) : (
              <span />
            )}
            {step < 2 ? (
              <Button variant="primary" size="lg" disabled={!canContinue} onClick={() => setStep(step + 1)}>
                Continue <ArrowRightIcon />
              </Button>
            ) : (
              <Button variant="primary" size="lg" onClick={() => finish(false)} loading={pending}>
                Open the editor <ArrowRightIcon />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
