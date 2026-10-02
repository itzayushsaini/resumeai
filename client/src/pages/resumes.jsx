import "./resumes.css";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/misc";
import { Spinner } from "@/components/ui/spinner";
import { errorMessage } from "@/lib/api";
import { pluralize, timeAgo } from "@/lib/utils";
import { useResumes } from "@/features/resume/api";
import { useNewResume } from "@/features/resume/use-new-resume";
import { ResumeMenu } from "@/features/resume/resume-actions";
import { FluidThumbnail } from "@/features/resume/fluid-thumbnail";
import { NewResumeButton } from "@/features/resume/new-resume-button";
import { TEMPLATES } from "@/features/resume/render/config";

function ResumeCard({ resume }) {
  const href = `/resumes/${resume.id}/edit`;
  return (
    <li className="resume-card">
      <Link to={href} className="resume-card-frame" aria-label={`Open ${resume.title}`}>
        <FluidThumbnail content={resume.content} settings={resume.settings} />
      </Link>
      <div className="resume-card-foot">
        <div className="resume-card-text">
          <Link to={href} className="resume-card-title">
            {resume.title}
          </Link>
          <div className="resume-card-meta">
            {TEMPLATES[resume.settings.template].name} · {timeAgo(resume.updatedAt)}
          </div>
        </div>
        <ResumeMenu resume={resume} />
      </div>
    </li>
  );
}

function NewCard() {
  const { start, pending, variables } = useNewResume();
  return (
    <li className="resume-card">
      <button onClick={() => start({ starter: "blank" })} disabled={pending} className="new-card">
        {pending && variables?.starter === "blank" ? <Spinner size="lg" /> : <PlusIcon />}
        <span className="new-card-label">Blank resume</span>
      </button>
      <div className="new-card-alt">
        or{" "}
        <button className="link" onClick={() => start({ starter: "example" })} disabled={pending}>
          start from an example
        </button>
      </div>
    </li>
  );
}

export default function ResumesPage() {
  const { data: resumes, isPending, error } = useResumes();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("edited");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = (resumes ?? []).filter((r) => !q || r.title.toLowerCase().includes(q));
    return sort === "name" ? [...filtered].sort((a, b) => a.title.localeCompare(b.title)) : filtered;
  }, [resumes, query, sort]);

  return (
    <PageContainer>
      <PageHeader
        title="Resumes"
        description={
          resumes?.length
            ? `${pluralize(resumes.length, "resume")}. Keeping one per kind of role makes tailoring faster.`
            : "Keep one per kind of role. It makes tailoring for each job much faster."
        }
        actions={<NewResumeButton />}
      />

      {resumes && resumes.length > 3 ? (
        <div className="resumes-tools">
          <div className="input-icon resumes-filter">
            <MagnifyingGlassIcon />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name"
              aria-label="Filter resumes"
            />
          </div>
          <Segmented
            size="sm"
            value={sort}
            onChange={setSort}
            aria-label="Sort"
            options={[
              { value: "edited", label: "Last edited" },
              { value: "name", label: "Name" },
            ]}
          />
        </div>
      ) : null}

      {error ? (
        <p className="field-error" style={{ marginTop: 32 }}>
          {errorMessage(error)}
        </p>
      ) : null}

      <ul className="resume-grid">
        {isPending ? (
          [0, 1, 2].map((i) => (
            <li key={i}>
              <Skeleton className="card-skeleton" />
              <Skeleton style={{ width: "75%", height: 14, marginTop: 12 }} />
              <Skeleton style={{ width: "50%", height: 12, marginTop: 8 }} />
            </li>
          ))
        ) : (
          <>
            {!query ? <NewCard /> : null}
            {list.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </>
        )}
      </ul>

      {query && list.length === 0 ? <p className="no-match">No resume names match “{query}”.</p> : null}
    </PageContainer>
  );
}
