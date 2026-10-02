import { useMemo, useState } from "react";
import { Link } from "react-router";
import { MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react";
import type { ResumeDTO } from "@resumeai/shared";
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

const cardFrame =
  "block overflow-hidden rounded-[4px] bg-white shadow-card ring-1 ring-black/[0.08] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-raise dark:ring-white/10";

function ResumeCard({ resume }: { resume: ResumeDTO }) {
  return (
    <li className="min-w-0">
      <Link to={`/resumes/${resume.id}/edit`} className={cardFrame} aria-label={`Open ${resume.title}`}>
        <FluidThumbnail content={resume.content} settings={resume.settings} />
      </Link>
      <div className="mt-3 flex items-start gap-1">
        <div className="min-w-0 flex-1">
          <Link to={`/resumes/${resume.id}/edit`} className="block truncate text-[14px] font-medium text-ink hover:underline">
            {resume.title}
          </Link>
          <div className="truncate text-[12.5px] text-ink-3">
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
    <li className="min-w-0">
      <button
        onClick={() => start({ starter: "blank" })}
        disabled={pending}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-[4px] border border-dashed border-line-strong text-ink-3 transition-colors hover:border-brand hover:bg-brand-soft/40 hover:text-brand-text"
        style={{ aspectRatio: "816 / 1056" }}
      >
        {pending && variables?.starter === "blank" ? <Spinner className="size-5" /> : <PlusIcon className="size-6" />}
        <span className="text-[13.5px] font-medium">Blank resume</span>
      </button>
      <div className="mt-3 text-[12.5px] text-ink-3">
        or{" "}
        <button className="font-medium text-brand-text hover:underline" onClick={() => start({ starter: "example" })} disabled={pending}>
          start from an example
        </button>
      </div>
    </li>
  );
}

export default function ResumesPage() {
  const { data: resumes, isPending, error } = useResumes();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"edited" | "name">("edited");

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
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-[280px]">
            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-4" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by name" className="pl-9" aria-label="Filter resumes" />
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

      {error ? <p className="mt-8 text-bad">{errorMessage(error)}</p> : null}

      <ul className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-x-6 gap-y-8">
        {isPending ? (
          [0, 1, 2].map((i) => (
            <li key={i}>
              <div style={{ aspectRatio: "816 / 1056" }} className="animate-pulse rounded-[4px] bg-ink/[0.05]" />
              <Skeleton className="mt-3 h-3.5 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
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

      {query && list.length === 0 ? <p className="mt-2 text-[13.5px] text-ink-3">No resume names match “{query}”.</p> : null}
    </PageContainer>
  );
}
