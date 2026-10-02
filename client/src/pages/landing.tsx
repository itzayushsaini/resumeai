import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRightIcon, CheckIcon, FilePdfIcon, MinusIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { TEMPLATE_IDS } from "@resumeai/shared";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ResumeSheet } from "@/features/resume/showcase";
import { TEMPLATES } from "@/features/resume/render/config";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const SCORE_PARTS = [
  { name: "Keyword match", weight: 25, how: "Keywords pulled from the job post, with synonyms understood (JS is JavaScript, k8s is Kubernetes). Required terms count more." },
  { name: "Skills alignment", weight: 20, how: "Your skills compared with what the role usually asks for, using the job post and a skills database." },
  { name: "Experience relevance", weight: 15, how: "How closely each role and bullet relates to the job, and whether your years match what's asked." },
  { name: "Measurable results", weight: 15, how: "How many bullets show an outcome or a number, start with a strong verb and skip filler like “responsible for”." },
  { name: "Formatting and structure", weight: 15, how: "Standard headings, consistent dates, sensible length, no tables, columns or text inside images." },
  { name: "Parsing readiness", weight: 10, how: "We read your exported file back like an ATS would and check that contact details, dates and sections come out right." },
];

const FAQ = [
  {
    q: "Is this the score employers see?",
    a: "No, and no tool can honestly claim that. Workday, Greenhouse, Lever and others don't publish a score. They parse your resume into fields, then recruiters filter and search. Our score estimates the two things that decide how that goes: whether software can read your file cleanly, and how well it matches the job.",
  },
  {
    q: "Will the AI make up experience for me?",
    a: "No. Suggestions only reword and surface what's already true. When a bullet would be stronger with a number, we ask you for it instead of inventing one. Keywords you don't have stay off your resume, because they tend to fall apart in interviews.",
  },
  {
    q: "PDF or Word?",
    a: "Our PDFs keep a real text layer, which every modern ATS reads well, and they look identical everywhere. Use Word when an application asks for it specifically.",
  },
  {
    q: "What happens to my resume data?",
    a: "Your resumes are stored in your account and you can delete everything from Settings at any time. When you use an AI feature, the relevant text is sent to Google's Gemini API to generate the suggestion. We don't sell or share your data.",
  },
  {
    q: "Do I need to write from scratch?",
    a: "No. Start from a finished example, or upload the resume you already have and we'll analyse it and help you improve it.",
  },
];

/* ------------------------------------------------------------------ */
/* Small visual pieces                                                 */
/* ------------------------------------------------------------------ */

function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-xl border border-line bg-surface shadow-pop", className)}>{children}</div>;
}

function Bar({ label, value }: { label: string; value: number }) {
  const tone = value >= 85 ? "bg-good" : value >= 70 ? "bg-brand" : "bg-warn";
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
      <span className="text-[12px] text-ink-2">{label}</span>
      <span className="text-[12px] font-medium text-ink tabular">{value}</span>
      <div className="col-span-2 h-1 overflow-hidden rounded-full bg-ink/[0.07]">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Chip({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-[5px] px-2 text-[12px] font-medium",
        ok ? "bg-good-soft text-good" : "bg-bad-soft text-bad",
      )}
    >
      {ok ? <CheckIcon weight="bold" className="size-3" /> : <XIcon weight="bold" className="size-3" />}
      {children}
    </span>
  );
}

function SampleScore({ className }: { className?: string }) {
  return (
    <Panel className={cn("w-[240px] p-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-ink-3">ATS readiness</span>
        <span className="rounded-[4px] bg-ink/[0.06] px-1.5 py-0.5 text-[10.5px] font-medium tracking-wide text-ink-3 uppercase">
          Sample
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-display text-[52px] leading-none tabular">82</span>
        <span className="text-[13px] text-ink-3">/ 100</span>
      </div>
      <div className="mt-4 flex flex-col gap-2.5">
        <Bar label="Keyword match" value={91} />
        <Bar label="Skills alignment" value={78} />
        <Bar label="Measurable results" value={64} />
        <Bar label="Parsing readiness" value={98} />
      </div>
    </Panel>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto h-[560px] w-full max-w-[560px] sm:h-[620px]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 sm:left-[56px] sm:translate-x-0">
        <ResumeSheet template="modern" width={420} />
        {/* Highlighter mark over the first bullet of the real page */}
        <div className="pointer-events-none absolute top-[161px] left-[33px] h-[11px] w-[220px] rounded-[2px] bg-[#ffe48a]/70 mix-blend-multiply" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-canvas via-canvas/80 to-transparent" />

      <SampleScore className="absolute top-8 right-0 hidden sm:block" />

      <Panel className="absolute top-[196px] left-0 hidden w-[224px] p-3.5 sm:block">
        <div className="flex items-center gap-1.5 text-[11.5px] font-semibold tracking-wide text-good uppercase">
          <span className="size-1.5 rounded-full bg-good" /> Strong bullet
        </div>
        <p className="mt-1.5 text-[13px] leading-snug text-ink">Result and a number up front. Keep this one as it is.</p>
      </Panel>

      <Panel className="absolute right-4 bottom-10 w-[270px] p-4 sm:right-6">
        <div className="text-[12px] font-medium text-ink-3">Keywords from the job post</div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <Chip ok>React</Chip>
          <Chip ok>TypeScript</Chip>
          <Chip ok>GraphQL</Chip>
          <Chip ok>Accessibility</Chip>
          <Chip ok={false}>Kubernetes</Chip>
          <Chip ok={false}>CI/CD</Chip>
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feature visuals                                                     */
/* ------------------------------------------------------------------ */

function JobMatchVisual() {
  return (
    <div className="grid gap-3 sm:grid-cols-[1.1fr_1fr]">
      <Panel className="p-4 shadow-raise">
        <div className="text-[12px] font-medium text-ink-3">Job post · Frontend Engineer</div>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2">
          You'll build product features in <mark className="rounded-[2px] bg-mark/70 px-0.5 text-ink">React</mark> and{" "}
          <mark className="rounded-[2px] bg-mark/70 px-0.5 text-ink">TypeScript</mark>, own{" "}
          <mark className="rounded-[2px] bg-mark/70 px-0.5 text-ink">performance</mark>, and ship through our{" "}
          <mark className="rounded-[2px] bg-mark/70 px-0.5 text-ink">CI/CD</mark> pipeline. Experience with{" "}
          <mark className="rounded-[2px] bg-mark/70 px-0.5 text-ink">Kubernetes</mark> is a plus.
        </p>
      </Panel>
      <Panel className="p-4 shadow-raise">
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] font-medium text-ink-3">Match</span>
          <span className="font-display text-[34px] leading-none tabular">87%</span>
        </div>
        <div className="mt-3 space-y-1.5 text-[13px]">
          {[
            ["React", true],
            ["TypeScript", true],
            ["Performance", true],
            ["CI/CD", false],
            ["Kubernetes", false],
          ].map(([skill, ok]) => (
            <div key={String(skill)} className="flex items-center justify-between">
              <span className="text-ink-2">{skill}</span>
              {ok ? (
                <span className="text-[12px] font-medium text-good">On your resume</span>
              ) : (
                <span className="text-[12px] font-medium text-bad">Missing</span>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function BulletVisual() {
  return (
    <Panel className="overflow-hidden shadow-raise">
      <div className="border-b border-line p-4">
        <div className="text-[11.5px] font-semibold tracking-wide text-ink-3 uppercase">Before</div>
        <p className="mt-1.5 text-[14px] text-ink-3 line-through decoration-bad/50">
          Responsible for improving website performance.
        </p>
      </div>
      <div className="border-b border-line bg-surface-2 p-4">
        <div className="text-[11.5px] font-semibold tracking-wide text-brand-text uppercase">We ask, you answer</div>
        <p className="mt-1.5 text-[13.5px] text-ink-2">How much faster did pages get?</p>
        <div className="mt-2 flex items-center gap-2 text-[13px]">
          <span className="rounded-md border border-line-strong bg-surface px-2.5 py-1 tabular">3.1s</span>
          <ArrowRightIcon className="size-3.5 text-ink-4" />
          <span className="rounded-md border border-brand bg-surface px-2.5 py-1 tabular shadow-[0_0_0_3px_color-mix(in_oklab,var(--brand)_14%,transparent)]">
            1.4s
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="text-[11.5px] font-semibold tracking-wide text-good uppercase">After</div>
        <p className="mt-1.5 text-[14px] text-ink">
          Cut median page load from 3.1s to 1.4s by code-splitting routes and caching pricing at the edge.
        </p>
      </div>
    </Panel>
  );
}

function AnalyserVisual() {
  const rows = [
    { tone: "good", label: "Strong", text: "Led a 4-engineer rebuild of checkout, raising conversion 7.2%" },
    { tone: "warn", label: "Needs work", text: "Worked on the design system with other teams" },
    { tone: "bad", label: "Weak", text: "Responsible for various frontend tasks" },
  ] as const;
  return (
    <div className="grid gap-3">
      <Panel className="flex items-center gap-3 p-3.5 shadow-raise">
        <span className="grid size-9 place-items-center rounded-md bg-bad-soft text-bad">
          <FilePdfIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-medium">maya-chen-resume.pdf</div>
          <div className="text-[12px] text-ink-3">2 pages · read in 4 seconds</div>
        </div>
        <span className="text-[12px] font-medium text-good">Analysed</span>
      </Panel>
      <Panel className="divide-y divide-line shadow-raise">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-3 p-3.5">
            <span
              className={cn(
                "mt-1.5 size-2 shrink-0 rounded-full",
                row.tone === "good" ? "bg-good" : row.tone === "warn" ? "bg-warn" : "bg-bad",
              )}
            />
            <div>
              <div className="text-[11.5px] font-semibold tracking-wide text-ink-3 uppercase">{row.label}</div>
              <div className="text-[13.5px] text-ink">{row.text}</div>
            </div>
          </div>
        ))}
      </Panel>
      <Panel className="p-4 shadow-raise">
        <div className="text-[12px] font-medium text-ink-3">Your roadmap to Senior Frontend Engineer</div>
        <ol className="mt-3 grid grid-cols-3 gap-2">
          {[
            ["30 days", "Add CI/CD to Tidepool"],
            ["60 days", "Ship a Kubernetes demo"],
            ["90 days", "AWS Developer cert"],
          ].map(([when, what], i) => (
            <li key={when} className="rounded-md border border-line bg-surface-2 p-2.5">
              <div className="flex items-center gap-1.5">
                <span className={cn("size-1.5 rounded-full", i === 0 ? "bg-brand" : "bg-ink-4")} />
                <span className="text-[11.5px] font-medium text-ink-3 tabular">{when}</span>
              </div>
              <div className="mt-1 text-[12.5px] leading-snug text-ink">{what}</div>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}

function FeatureRow({
  index,
  title,
  body,
  points,
  visual,
  flip,
}: {
  index: string;
  title: string;
  body: string;
  points: string[];
  visual: ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-20">
      <div className={cn(flip && "lg:order-2")}>
        <span className="text-[13px] font-medium text-ink-4 tabular">{index}</span>
        <h3 className="mt-2 font-display text-[38px] leading-[1.08] tracking-[-0.01em]">{title}</h3>
        <p className="mt-4 max-w-[480px] text-[16px] leading-relaxed text-ink-2">{body}</p>
        <ul className="mt-6 flex flex-col gap-2.5">
          {points.map((point) => (
            <li key={point} className="flex gap-2.5 text-[14.5px] text-ink">
              <CheckIcon weight="bold" className="mt-1 size-3.5 shrink-0 text-good" />
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div className={cn("rounded-2xl bg-sunken p-5 sm:p-8", flip && "lg:order-1")}>{visual}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function Nav() {
  const { data } = useSession();
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-6">
        <Link to="/" aria-label="ResumeAI home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 text-[14px] text-ink-2 md:flex" aria-label="Sections">
          <a href="#score" className="hover:text-ink">How scoring works</a>
          <a href="#features" className="hover:text-ink">Features</a>
          <a href="#templates" className="hover:text-ink">Templates</a>
          <a href="#faq" className="hover:text-ink">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          {data ? (
            <Button variant="primary" asChild>
              <Link to="/dashboard">Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/sign-in">Sign in</Link>
              </Button>
              <Button variant="primary" asChild>
                <Link to="/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-line py-5 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[16px] font-medium text-ink">
        {q}
        <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line-strong text-ink-3">
          <PlusIcon className="size-3.5 group-open:hidden" weight="bold" />
          <MinusIcon className="hidden size-3.5 group-open:block" weight="bold" />
        </span>
      </summary>
      <p className="mt-3 max-w-[680px] text-[15px] leading-relaxed text-ink-2">{a}</p>
    </details>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <Nav />

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-[1200px] items-start gap-10 px-6 pt-14 pb-10 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
          <div className="lg:pt-8">
            <p className="flex items-center gap-2.5 text-[13.5px] text-ink-2">
              <span className="h-px w-6 bg-ink-4" />
              Resume builder with an honest ATS check
            </p>
            <h1 className="mt-6 font-display text-[54px] leading-[1.02] tracking-[-0.02em] sm:text-[76px]">
              Get past the ATS.
              <br />
              <em className="text-ink-2">Get read by a person.</em>
            </h1>
            <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-ink-2">
              ResumeAI checks your resume the way applicant tracking systems read it, shows what's missing for the job
              you want, and helps you fix it without making anything up.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="primary" size="lg" asChild>
                <Link to="/sign-up">
                  Build my resume <ArrowRightIcon weight="bold" />
                </Link>
              </Button>
              <Button size="lg" asChild>
                <a href="#score">See what gets checked</a>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-[520px] grid-cols-3 gap-6 border-t border-line pt-6">
              {[
                ["Templates", "ATS-safe, one column"],
                ["Export", "PDF with real text"],
                ["AI", "Suggests, never invents"],
              ].map(([term, detail]) => (
                <div key={term}>
                  <dt className="text-[12.5px] text-ink-3">{term}</dt>
                  <dd className="mt-1 text-[14.5px] font-medium text-ink">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
          <HeroVisual />
        </section>

        {/* What the score measures */}
        <section id="score" className="scroll-mt-16 border-y border-line bg-surface">
          <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-20 lg:grid-cols-[380px_1fr] lg:gap-20">
            <div>
              <h2 className="font-display text-[42px] leading-[1.06] tracking-[-0.01em]">
                The score isn't magic. Here's what it measures.
              </h2>
              <p className="mt-5 text-[16px] leading-relaxed text-ink-2">
                No employer publishes an official “ATS score”. So we measure the two things that decide how your resume
                fares: whether software can read it cleanly, and whether it matches the job. Every point comes with a
                reason and a fix.
              </p>
            </div>
            <ol className="border-t border-line">
              {SCORE_PARTS.map((part, i) => (
                <li key={part.name} className="grid grid-cols-[36px_1fr_auto] items-baseline gap-4 border-b border-line py-5">
                  <span className="text-[13px] text-ink-4 tabular">0{i + 1}</span>
                  <div>
                    <h3 className="text-[15.5px] font-semibold">{part.name}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{part.how}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-[32px] leading-none tabular">{part.weight}</span>
                    <span className="text-[13px] text-ink-3">%</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-[1200px] scroll-mt-16 px-6 pt-8">
          <FeatureRow
            index="01"
            title="Tailor it to the job in a minute"
            body="Paste a job post. You see which of its keywords are already on your resume, which are missing, and where each missing one would fit naturally."
            points={["Synonyms understood, so you don't stuff duplicates", "Required skills weighted above nice-to-haves", "Make a tailored copy and keep your main resume untouched"]}
            visual={<JobMatchVisual />}
          />
          <FeatureRow
            flip
            index="02"
            title="Stronger bullets, no made-up facts"
            body="Weak bullets get flagged as you type. When one needs a number, we ask you for it rather than guessing. You stay the author."
            points={["Flags filler like “responsible for” and passive voice", "Rewrites in your voice, with one-click accept or undo", "Never adds skills or results you didn't give us"]}
            visual={<BulletVisual />}
          />
          <FeatureRow
            index="03"
            title="Already have a resume? Start there."
            body="Upload your PDF or Word file. Get a line-by-line review, an improved version you can accept change by change, and a roadmap to the role you want."
            points={["See exactly what an ATS pulls out of your file", "Each change explained, nothing applied without you", "A 30, 60, 90-day plan with projects that become bullets"]}
            visual={<AnalyserVisual />}
          />
        </section>

        {/* Templates */}
        <section id="templates" className="scroll-mt-16 border-t border-line bg-sunken/60">
          <div className="mx-auto max-w-[1200px] px-6 py-20">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <h2 className="font-display text-[42px] leading-[1.06] tracking-[-0.01em]">Templates that stay out of the way</h2>
                <p className="mt-3 max-w-[560px] text-[16px] text-ink-2">
                  One column, standard headings, real text. Switch any time without retyping a word.
                </p>
              </div>
              <Button asChild>
                <Link to="/sign-up">
                  Try them with your content <ArrowRightIcon />
                </Link>
              </Button>
            </div>
            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              {TEMPLATE_IDS.map((id) => (
                <figure key={id}>
                  <ResumeSheet template={id} width={340} className="mx-auto max-w-full" />
                  <figcaption className="mt-4 text-center">
                    <div className="text-[15px] font-semibold">{TEMPLATES[id].name}</div>
                    <div className="mx-auto mt-1 max-w-[300px] text-[13.5px] text-ink-2">{TEMPLATES[id].description}</div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-[1200px] scroll-mt-16 px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-20">
            <h2 className="font-display text-[42px] leading-[1.06] tracking-[-0.01em]">Straight answers</h2>
            <div className="border-t border-line">
              {FAQ.map((item) => (
                <FaqItem key={item.q} {...item} />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-[1200px] px-6 pb-20">
          <div className="flex flex-col items-start justify-between gap-8 rounded-2xl bg-rail px-8 py-12 sm:px-12 lg:flex-row lg:items-center">
            <p className="max-w-[640px] font-display text-[38px] leading-[1.1] text-rail-ink sm:text-[44px]">
              Your next application deserves a better resume.
            </p>
            <Button variant="primary" size="lg" asChild>
              <Link to="/sign-up">
                Start for free <ArrowRightIcon weight="bold" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-8 text-[13px] text-ink-3">
          <Logo />
          <span>© {new Date().getFullYear()} ResumeAI</span>
        </div>
      </footer>
    </div>
  );
}
