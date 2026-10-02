import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { ArrowLeftIcon, ArrowRightIcon, BookOpenTextIcon, FilePlusIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient, useSession } from "@/lib/auth-client";
import { api, errorMessage } from "@/lib/api";
import { cn, firstName } from "@/lib/utils";
import { EXPERIENCE_LEVELS, ROLE_SUGGESTIONS } from "@/features/profile/options";
import { resumeKeys } from "@/features/resume/api";
import type { ResumeDTO } from "@resumeai/shared";

type Starter = "blank" | "example";

function Choice({
  selected,
  onClick,
  title,
  hint,
  icon,
  disabled,
}: {
  selected?: boolean;
  onClick: () => void;
  title: string;
  hint: string;
  icon?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3.5 rounded-lg border bg-surface px-4 py-3.5 text-left transition-[border-color,box-shadow]",
        selected
          ? "border-brand shadow-[0_0_0_3px_color-mix(in_oklab,var(--brand)_14%,transparent)]"
          : "border-line-strong hover:border-ink-4",
        disabled && "opacity-60",
      )}
    >
      {icon ? <span className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-soft text-brand-ink [&_svg]:size-5">{icon}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium text-ink">{title}</span>
        <span className="block text-[13px] text-ink-3">{hint}</span>
      </span>
      <span
        className={cn(
          "grid size-[18px] shrink-0 place-items-center rounded-full border",
          selected ? "border-brand bg-brand" : "border-line-strong",
        )}
      >
        {selected ? <span className="size-1.5 rounded-full bg-white" /> : null}
      </span>
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
  const [starter, setStarter] = useState<Starter>("blank");
  const [pending, setPending] = useState(false);

  const steps = ["Target role", "Experience", "First resume"];
  const canContinue = step === 0 ? role.trim().length > 1 : step === 1 ? Boolean(level) : true;

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
      const resume = await api<ResumeDTO>("/resumes", {
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
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-16 items-center justify-between px-6 sm:px-10">
        <Logo />
        <Button variant="ghost" size="sm" onClick={() => finish(true)} disabled={pending}>
          Skip for now
        </Button>
      </header>

      <main className="flex flex-1 justify-center px-6 pt-[6vh] pb-16">
        <div className="w-full max-w-[520px]">
          <ol className="mb-10 grid grid-cols-3 gap-2" aria-label="Progress">
            {steps.map((label, i) => (
              <li key={label} aria-current={i === step ? "step" : undefined}>
                <div className={cn("h-[3px] rounded-full", i <= step ? "bg-brand" : "bg-line-strong")} />
                <div className={cn("mt-2 text-[12px] font-medium", i === step ? "text-ink" : "text-ink-3")}>{label}</div>
              </li>
            ))}
          </ol>

          <div key={step} className="animate-slide-up">
            {step === 0 ? (
              <>
                <h1 className="font-display text-[36px] leading-[1.1]">
                  {firstName(data?.user.name) ? `${firstName(data?.user.name)}, what` : "What"} job are you going for?
                </h1>
                <p className="mt-2 text-ink-2">
                  We use this to pick the right keywords and skills to check for. You can change it any time.
                </p>
                <Input
                  className="mt-6 h-11 text-[15px]"
                  placeholder="e.g. Frontend Developer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canContinue && setStep(1)}
                  autoFocus
                  aria-label="Target role"
                />
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {ROLE_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setRole(suggestion)}
                      className={cn(
                        "h-7 rounded-full border px-3 text-[12.5px] transition-colors",
                        role === suggestion
                          ? "border-brand bg-brand-soft text-brand-ink"
                          : "border-line-strong text-ink-2 hover:border-ink-4 hover:text-ink",
                      )}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <h1 className="font-display text-[36px] leading-[1.1]">How much experience do you have?</h1>
                <p className="mt-2 text-ink-2">This changes what we expect to see, like whether projects should come before work history.</p>
                <div className="mt-6 flex flex-col gap-2">
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
                <h1 className="font-display text-[36px] leading-[1.1]">How do you want to start?</h1>
                <p className="mt-2 text-ink-2">Either way you can switch templates and edit everything later.</p>
                <div className="mt-6 flex flex-col gap-2">
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

          <div className="mt-8 flex items-center justify-between">
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
              <Button variant="primary" size="lg" onClick={() => finish(false)} disabled={pending}>
                {pending ? <Spinner /> : null}
                Open the editor <ArrowRightIcon />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
