import "./dashboard.css";
import { Link } from "react-router";
import { ArrowRightIcon, BookOpenTextIcon, CheckIcon, FilePlusIcon, LayoutIcon, PlusIcon } from "@phosphor-icons/react";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/misc";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/auth-client";
import { cx, firstName, greeting, timeAgo } from "@/lib/utils";
import { errorMessage } from "@/lib/api";
import { useResumes } from "@/features/resume/api";
import { useNewResume } from "@/features/resume/use-new-resume";
import { ResumeMenu } from "@/features/resume/resume-actions";
import { ResumeThumbnail } from "@/features/resume/render/document";
import { TEMPLATES } from "@/features/resume/render/config";
import { resumeChecklist, resumeStats } from "@/features/resume/checklist";
import { levelLabel } from "@/features/profile/options";

function ResumeRow({ resume }) {
  return (
    <li className="resume-row">
      <Link to={`/resumes/${resume.id}/edit`} className="resume-row-link" aria-label={`Open ${resume.title}`} />
      <div className="resume-row-thumb">
        <ResumeThumbnail content={resume.content} settings={resume.settings} width={46} />
      </div>
      <div className="resume-row-text">
        <div className="resume-row-title">{resume.title}</div>
        <div className="resume-row-meta">
          {TEMPLATES[resume.settings.template].name} · Edited {timeAgo(resume.updatedAt)}
        </div>
      </div>
      <div className="resume-row-stats">{resumeStats(resume.content)}</div>
      <div className="resume-row-menu">
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
            <Link to="/resumes" className="link">
              View all {resumes.length}
            </Link>
          ) : null
        }
      />
      {isPending ? (
        <ul className="resume-rows">
          {[0, 1, 2].map((i) => (
            <li key={i} className="skeleton-row">
              <Skeleton style={{ width: 46, height: 60 }} />
              <div style={{ flex: 1, display: "grid", gap: 8 }}>
                <Skeleton style={{ width: 176, height: 14 }} />
                <Skeleton style={{ width: 112, height: 12 }} />
              </div>
            </li>
          ))}
        </ul>
      ) : error ? (
        <p className="card-body field-error">{errorMessage(error)}</p>
      ) : resumes.length === 0 ? (
        <div className="card-body">
          <div className="empty">
            <h3 className="empty-title">No resumes yet</h3>
            <p className="empty-text">Start with a blank page, or open a finished example and make it yours.</p>
            <div className="empty-actions">
              <Button
                onClick={() => start({ starter: "example" })}
                loading={pending && variables?.starter === "example"}
              >
                Open an example
              </Button>
              <Button
                variant="primary"
                onClick={() => start({ starter: "blank" })}
                loading={pending && variables?.starter !== "example"}
              >
                <PlusIcon /> New resume
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <ul className="resume-rows">
          {resumes.slice(0, 5).map((resume) => (
            <ResumeRow key={resume.id} resume={resume} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function StartCard() {
  const { start, pending, variables } = useNewResume();
  return (
    <Card className="start-card">
      <CardHeader title="Start another" description="One resume per kind of role makes tailoring much faster." />
      <div className="start-tiles">
        <button className="start-tile" onClick={() => start({ starter: "blank" })} disabled={pending}>
          <span className="start-tile-icon">
            {pending && variables?.starter === "blank" ? <Spinner /> : <FilePlusIcon />}
          </span>
          <span>
            <span className="start-tile-title">Blank resume</span>
            <span className="start-tile-text">Your name and email filled in</span>
          </span>
        </button>
        <button className="start-tile" onClick={() => start({ starter: "example" })} disabled={pending}>
          <span className="start-tile-icon">
            {pending && variables?.starter === "example" ? <Spinner /> : <BookOpenTextIcon />}
          </span>
          <span>
            <span className="start-tile-title">From an example</span>
            <span className="start-tile-text">Edit a finished resume</span>
          </span>
        </button>
        <Link to="/templates" className="start-tile">
          <span className="start-tile-icon">
            <LayoutIcon />
          </span>
          <span>
            <span className="start-tile-title">Browse templates</span>
            <span className="start-tile-text">Pick a look first</span>
          </span>
        </Link>
      </div>
    </Card>
  );
}

function ChecklistCard({ resume }) {
  const items = resumeChecklist(resume.content);
  const done = items.filter((i) => i.done).length;

  return (
    <Card>
      <CardHeader
        title="Before you apply"
        description={
          <span className="truncate" style={{ display: "block" }}>
            For “{resume.title}”
          </span>
        }
        action={
          <span className="count tabular">
            {done}/{items.length}
          </span>
        }
      />
      <div className="checklist-progress" aria-hidden>
        {items.map((item) => (
          <span key={item.id} className={item.done ? "is-done" : undefined} />
        ))}
      </div>
      <ul className="checklist">
        {items.map((item) => (
          <li key={item.id} className={cx("checklist-item", item.done && "is-done")}>
            <span className="check">{item.done ? <CheckIcon weight="bold" /> : null}</span>
            <div style={{ minWidth: 0 }}>
              <div className="checklist-label">{item.label}</div>
              <div className="checklist-detail">{item.detail}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="card-footer">
        <Link to={`/resumes/${resume.id}/edit`} className="arrow-link">
          {done === items.length ? "Open in editor" : "Fix these in the editor"} <ArrowRightIcon />
        </Link>
      </div>
    </Card>
  );
}

function GoalCard({ user }) {
  return (
    <Card>
      <CardHeader
        title="Your goal"
        action={
          <Link to="/settings" className="link">
            Edit
          </Link>
        }
      />
      <div className="card-body">
        {user.targetRole ? (
          <>
            <div className="goal-role">{user.targetRole}</div>
            {user.experienceLevel ? <div className="goal-level">{levelLabel(user.experienceLevel)}</div> : null}
          </>
        ) : (
          <p className="goal-empty">Add the job you're going for. Checks and suggestions are tuned to it.</p>
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
              You're working toward <strong>{user.targetRole}</strong>.
            </>
          ) : null
        }
        actions={
          <Button variant="primary" onClick={() => start({ starter: "blank" })} loading={pending}>
            <PlusIcon /> New resume
          </Button>
        }
      />

      <div className="dash-grid">
        <div className="dash-col">
          <ResumesCard />
          {resumes && resumes.length > 0 ? <StartCard /> : null}
        </div>
        <div className="dash-col">
          {resumes?.[0] ? <ChecklistCard resume={resumes[0]} /> : null}
          <GoalCard user={user} />
        </div>
      </div>
    </PageContainer>
  );
}
