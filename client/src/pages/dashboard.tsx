import { Link } from "react-router";
import { ArrowRightIcon, BookOpenTextIcon, CheckIcon, FilePlusIcon, LayoutIcon, PlusIcon } from "@phosphor-icons/react";
import { Spinner } from "@/components/ui/spinner";
import type { ResumeDTO } from "@resumeai/shared";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/misc";
import { useSession, type SessionUser } from "@/lib/auth-client";
import { cn, firstName, greeting, timeAgo } from "@/lib/utils";
import { errorMessage } from "@/lib/api";
import { useResumes } from "@/features/resume/api";
import { useNewResume } from "@/features/resume/use-new-resume";
import { ResumeMenu } from "@/features/resume/resume-actions";
import { ResumeThumbnail } from "@/features/resume/render/document";
import { TEMPLATES } from "@/features/resume/render/config";
import { resumeChecklist, resumeStats } from "@/features/resume/checklist";
import { levelLabel } from "@/features/profile/options";

function ResumeRow({ resume }: { resume: ResumeDTO }) {
  return (
    <li className="group relative flex items-center gap-4 border-t border-line px-5 py-3 transition-colors first:border-t-0 hover:bg-surface-2">
      <Link to={`/resumes/${resume.id}/edit`} className="absolute inset-0 z-0" aria-label={`Open ${resume.title}`} />
      <div className="pointer-events-none relative shrink-0 overflow-hidden rounded-[3px] shadow-card ring-1 ring-black/[0.08] transition-transform group-hover:-translate-y-px">
        <ResumeThumbnail content={resume.content} settings={resume.settings} width={46} />
      </div>
      <div className="pointer-events-none relative min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium text-ink">{resume.title}</div>
        <div className="mt-0.5 truncate text-[12.5px] text-ink-3">
          {TEMPLATES[resume.settings.template].name} · Edited {timeAgo(resume.updatedAt)}
        </div>
      </div>
      <div className="pointer-events-none relative hidden text-[12.5px] text-ink-3 md:block">{resumeStats(resume.content)}</div>
      <div className="relative z-10">
        <ResumeMenu resume={resume} />
      </div>
    </li>
  );
}

function ResumesCard() {
  const { data: resumes, isPending, error } = useResumes();
  const { start, pending, variables } = useNewResume();

  return (
    <Card>
      <CardHeader
        title="Your resumes"
        description={resumes?.length ? "Most recently edited first" : undefined}
        action={
          resumes && resumes.length > 5 ? (
            <Button variant="link" size="sm" asChild>
              <Link to="/resumes">View all {resumes.length}</Link>
            </Button>
          ) : null
        }
      />
      {isPending ? (
        <ul>
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-4 border-t border-line px-5 py-3 first:border-t-0">
              <Skeleton className="h-[60px] w-[46px]" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-44" />
                <Skeleton className="h-3 w-28" />
              </div>
            </li>
          ))}
        </ul>
      ) : error ? (
        <p className="px-5 pb-5 text-[13.5px] text-bad">{errorMessage(error)}</p>
      ) : resumes.length === 0 ? (
        <div className="px-5 pb-5">
          <div className="rounded-lg border border-dashed border-line-strong px-6 py-10 text-center">
            <h3 className="text-[15px] font-semibold">No resumes yet</h3>
            <p className="mx-auto mt-1 max-w-xs text-[13.5px] text-ink-2">
              Start with a blank page, or open a finished example and make it yours.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <Button
                onClick={() => start({ starter: "example" })}
                loading={pending && variables?.starter === "example"}
              >
                Open an example
              </Button>
              <Button variant="primary" onClick={() => start({ starter: "blank" })} loading={pending && variables?.starter !== "example"}>
                <PlusIcon /> New resume
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <ul className="border-t border-line">
          {resumes.slice(0, 5).map((resume) => (
            <ResumeRow key={resume.id} resume={resume} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function ChecklistCard({ resume }: { resume: ResumeDTO }) {
  const items = resumeChecklist(resume.content);
  const done = items.filter((i) => i.done).length;

  return (
    <Card>
      <CardHeader
        title="Before you apply"
        description={<span className="block truncate">For “{resume.title}”</span>}
        action={
          <span className="text-[12.5px] font-medium text-ink-3 tabular">
            {done}/{items.length}
          </span>
        }
      />
      <div className="px-5">
        <div className="flex h-1 gap-1" aria-hidden>
          {items.map((item) => (
            <div key={item.id} className={cn("flex-1 rounded-full", item.done ? "bg-good" : "bg-line-strong")} />
          ))}
        </div>
      </div>
      <ul className="flex flex-col gap-3 px-5 pt-4 pb-4">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <span
              className={cn(
                "mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full",
                item.done ? "bg-good text-white" : "border-[1.5px] border-line-strong",
              )}
            >
              {item.done ? <CheckIcon weight="bold" className="size-2.5" /> : null}
            </span>
            <div className="min-w-0">
              <div className={cn("text-[13.5px] font-medium", item.done ? "text-ink-2" : "text-ink")}>{item.label}</div>
              <div className="text-[12.5px] text-ink-3">{item.detail}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="border-t border-line px-5 py-3">
        <Link
          to={`/resumes/${resume.id}/edit`}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-text hover:underline"
        >
          {done === items.length ? "Open in editor" : "Fix these in the editor"} <ArrowRightIcon className="size-3.5" />
        </Link>
      </div>
    </Card>
  );
}

function StartCard() {
  const { start, pending, variables } = useNewResume();
  const tile =
    "group flex items-center gap-3 bg-surface p-4 text-left transition-colors hover:bg-surface-2 disabled:opacity-60 sm:flex-col sm:items-start sm:p-5";
  const icon =
    "grid size-9 shrink-0 place-items-center rounded-md border border-line bg-surface-2 text-ink-2 transition-colors group-hover:border-brand/40 group-hover:text-brand-text [&_svg]:size-[18px]";

  return (
    <Card className="overflow-hidden">
      <CardHeader title="Start another" description="One resume per kind of role makes tailoring much faster." />
      <div className="grid gap-px border-t border-line bg-line sm:grid-cols-3">
        <button className={tile} onClick={() => start({ starter: "blank" })} disabled={pending}>
          <span className={icon}>{pending && variables?.starter === "blank" ? <Spinner /> : <FilePlusIcon />}</span>
          <span>
            <span className="block text-[13.5px] font-medium text-ink">Blank resume</span>
            <span className="block text-[12.5px] text-ink-3">Your name and email filled in</span>
          </span>
        </button>
        <button className={tile} onClick={() => start({ starter: "example" })} disabled={pending}>
          <span className={icon}>{pending && variables?.starter === "example" ? <Spinner /> : <BookOpenTextIcon />}</span>
          <span>
            <span className="block text-[13.5px] font-medium text-ink">From an example</span>
            <span className="block text-[12.5px] text-ink-3">Edit a finished resume</span>
          </span>
        </button>
        <Link to="/templates" className={tile}>
          <span className={icon}>
            <LayoutIcon />
          </span>
          <span>
            <span className="block text-[13.5px] font-medium text-ink">Browse templates</span>
            <span className="block text-[12.5px] text-ink-3">Pick a look first</span>
          </span>
        </Link>
      </div>
    </Card>
  );
}

function GoalCard({ user }: { user: SessionUser }) {
  return (
    <Card>
      <CardHeader
        title="Your goal"
        action={
          <Button variant="link" size="sm" asChild>
            <Link to="/settings">Edit</Link>
          </Button>
        }
      />
      <div className="px-5 pb-5">
        {user.targetRole ? (
          <>
            <div className="font-display text-[24px] leading-tight">{user.targetRole}</div>
            {user.experienceLevel ? <div className="mt-1 text-[13px] text-ink-3">{levelLabel(user.experienceLevel)}</div> : null}
          </>
        ) : (
          <p className="text-[13.5px] text-ink-2">
            Add the job you're going for. Checks and suggestions are tuned to it.
          </p>
        )}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: resumes } = useResumes();
  const { start, pending } = useNewResume();
  const user = session?.user;
  if (!user) return null;

  const today = new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" });
  const name = firstName(user.name);

  return (
    <PageContainer>
      <PageHeader
        eyebrow={today}
        title={name ? `${greeting()}, ${name}` : greeting()}
        description={
          user.targetRole ? (
            <>
              You're working toward <span className="font-medium text-ink">{user.targetRole}</span>.
            </>
          ) : null
        }
        actions={
          <Button variant="primary" onClick={() => start({ starter: "blank" })} loading={pending}>
            <PlusIcon /> New resume
          </Button>
        }
      />

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <ResumesCard />
          {resumes && resumes.length > 0 ? <StartCard /> : null}
        </div>
        <div className="flex flex-col gap-6">
          {resumes?.[0] ? <ChecklistCard resume={resumes[0]} /> : null}
          <GoalCard user={user} />
        </div>
      </div>
    </PageContainer>
  );
}
