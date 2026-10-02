import "./landing.css";
import { Link } from "react-router";
import { ArrowRightIcon, CheckIcon, FilePdfIcon, MinusIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { TEMPLATE_IDS } from "@resumeai/shared";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cx } from "@/lib/utils";
import { ResumeSheet } from "@/features/resume/showcase";
import { TEMPLATES } from "@/features/resume/render/config";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const SCORE_PARTS = [
  {
    name: "Keyword match",
    weight: 25,
    how: "Keywords pulled from the job post, with synonyms understood (JS is JavaScript, k8s is Kubernetes). Required terms count more.",
  },
  {
    name: "Skills alignment",
    weight: 20,
    how: "Your skills compared with what the role usually asks for, using the job post and a skills database.",
  },
  {
    name: "Experience relevance",
    weight: 15,
    how: "How closely each role and bullet relates to the job, and whether your years match what's asked.",
  },
  {
    name: "Measurable results",
    weight: 15,
    how: "How many bullets show an outcome or a number, start with a strong verb and skip filler like “responsible for”.",
  },
  {
    name: "Formatting and structure",
    weight: 15,
    how: "Standard headings, consistent dates, sensible length, no tables, columns or text inside images.",
  },
  {
    name: "Parsing readiness",
    weight: 10,
    how: "We read your exported file back like an ATS would and check that contact details, dates and sections come out right.",
  },
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
    q: "Can I write my notes in Hindi or Hinglish?",
    a: "Yes. Describe your work the way you'd say it, in any mix of languages, and the AI turns it into clear English bullets. It only uses what you wrote.",
  },
  {
    q: "PDF or Word?",
    a: "Our PDFs keep a real text layer, which every modern ATS reads well, and they look identical everywhere. Use Word when an application asks for it specifically.",
  },
  {
    q: "What happens to my resume data?",
    a: "Your resumes are stored in your account and you can delete everything from Settings at any time. When you use an AI feature, the relevant text is sent to Google's Gemini API to generate the suggestion. We don't sell or share your data.",
  },
];

/* ------------------------------------------------------------------ */
/* Visual pieces                                                       */
/* ------------------------------------------------------------------ */

function Bar({ label, value }) {
  const tone = value >= 85 ? "tone-good" : value >= 70 ? "tone-ok" : "tone-warn";
  return (
    <div className="bar">
      <span className="bar-label">{label}</span>
      <span className="bar-value">{value}</span>
      <div className="bar-track">
        <div className={cx("bar-fill", tone)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Keyword({ ok, children }) {
  return (
    <span className={cx("kw", ok ? "is-yes" : "is-no")}>
      {ok ? <CheckIcon weight="bold" /> : <XIcon weight="bold" />}
      {children}
    </span>
  );
}

function HeroVisual() {
  return (
    <div className="hero-visual">
      <div className="hero-sheet">
        <ResumeSheet template="modern" width={420} />
        <div className="hero-mark" />
      </div>
      <div className="hero-fade" />

      <div className="panel float float-score">
        <div className="score-head">
          <span className="panel-kicker">ATS readiness</span>
          <span className="sample-tag">Sample</span>
        </div>
        <div className="score-big">
          <strong className="tabular">82</strong>
          <span>/ 100</span>
        </div>
        <div className="bars">
          <Bar label="Keyword match" value={91} />
          <Bar label="Skills alignment" value={78} />
          <Bar label="Measurable results" value={64} />
          <Bar label="Parsing readiness" value={98} />
        </div>
      </div>

      <div className="panel float float-note">
        <div className="note-label">Strong bullet</div>
        <p className="note-text">Result and a number up front. Keep this one as it is.</p>
      </div>

      <div className="panel float float-keywords">
        <div className="panel-kicker">Keywords from the job post</div>
        <div className="kw-chips">
          <Keyword ok>React</Keyword>
          <Keyword ok>TypeScript</Keyword>
          <Keyword ok>GraphQL</Keyword>
          <Keyword ok>Accessibility</Keyword>
          <Keyword ok={false}>Kubernetes</Keyword>
          <Keyword ok={false}>CI/CD</Keyword>
        </div>
      </div>
    </div>
  );
}

function JobMatchVisual() {
  const rows = [
    ["React", true],
    ["TypeScript", true],
    ["Performance", true],
    ["CI/CD", false],
    ["Kubernetes", false],
  ];
  return (
    <div className="stack stack-2">
      <div className="panel panel-raise pad">
        <div className="panel-kicker">Job post · Frontend Engineer</div>
        <p className="jd-text">
          You'll build product features in <mark>React</mark> and <mark>TypeScript</mark>, own <mark>performance</mark>,
          and ship through our <mark>CI/CD</mark> pipeline. Experience with <mark>Kubernetes</mark> is a plus.
        </p>
      </div>
      <div className="panel panel-raise pad">
        <div className="match-top">
          <span className="panel-kicker">Match</span>
          <strong className="tabular">87%</strong>
        </div>
        <ul className="match-list">
          {rows.map(([skill, ok]) => (
            <li key={skill}>
              {skill}
              {ok ? <span className="match-yes">On your resume</span> : <span className="match-no">Missing</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BulletVisual() {
  return (
    <div className="panel panel-raise" style={{ overflow: "hidden" }}>
      <div className="bv-step">
        <div className="bv-kicker">Before</div>
        <p className="bv-before">Responsible for improving website performance.</p>
      </div>
      <div className="bv-step is-ask">
        <div className="bv-kicker is-ai">The AI asks, you answer</div>
        <p style={{ fontSize: 13.5, color: "var(--ink-2)" }}>How much faster did pages get?</p>
        <div className="bv-answer">
          <span>3.1s</span>
          <ArrowRightIcon />
          <span className="is-focus">1.4s</span>
        </div>
      </div>
      <div className="bv-step">
        <div className="bv-kicker is-good">After</div>
        <p>Cut median page load from 3.1s to 1.4s by code-splitting routes and caching pricing at the edge.</p>
      </div>
    </div>
  );
}

function AnalyserVisual() {
  const rows = [
    { tone: "good", label: "Strong", text: "Led a 4-engineer rebuild of checkout, raising conversion 7.2%" },
    { tone: "warn", label: "Needs work", text: "Worked on the design system with other teams" },
    { tone: "bad", label: "Weak", text: "Responsible for various frontend tasks" },
  ];
  const plan = [
    ["30 days", "Add CI/CD to Tidepool"],
    ["60 days", "Ship a Kubernetes demo"],
    ["90 days", "AWS Developer cert"],
  ];
  return (
    <div className="stack">
      <div className="panel panel-raise file-row">
        <span className="file-icon">
          <FilePdfIcon />
        </span>
        <div style={{ minWidth: 0 }}>
          <div className="file-name">maya-chen-resume.pdf</div>
          <div className="file-meta">2 pages · read in 4 seconds</div>
        </div>
        <span className="file-status">Analysed</span>
      </div>
      <div className="panel panel-raise">
        {rows.map((row) => (
          <div key={row.label} className="review-row">
            <span className={cx("review-dot", `is-${row.tone}`)} />
            <div>
              <div className="bv-kicker">{row.label}</div>
              <div className="review-text">{row.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="panel panel-raise pad">
        <div className="panel-kicker">Your roadmap to Senior Frontend Engineer</div>
        <ol className="roadmap">
          {plan.map(([when, what]) => (
            <li key={when}>
              <div className="roadmap-when tabular">{when}</div>
              <div className="roadmap-what">{what}</div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function FeatureRow({ index, title, body, points, visual, flipped }) {
  return (
    <div className={cx("feature", flipped && "is-flipped")}>
      <div className="feature-copy">
        <span className="feature-index">{index}</span>
        <h3>{title}</h3>
        <p className="feature-body">{body}</p>
        <ul className="feature-points">
          {points.map((point) => (
            <li key={point}>
              <CheckIcon weight="bold" />
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div className="feature-stage">{visual}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function Nav() {
  const { data } = useSession();
  return (
    <header className="lnav">
      <div className="wrap lnav-inner">
        <Link to="/" aria-label="ResumeAI home">
          <Logo />
        </Link>
        <nav className="lnav-links" aria-label="Sections">
          <a href="#score">How scoring works</a>
          <a href="#features">Features</a>
          <a href="#templates">Templates</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="lnav-actions">
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

export default function LandingPage() {
  return (
    <div className="landing">
      <Nav />

      <main>
        <section className="wrap hero">
          <div className="hero-copy">
            <p className="eyebrow">Resume builder with an honest ATS check</p>
            <h1 className="hero-title">
              Get past the ATS.
              <br />
              <em>Get read by a person.</em>
            </h1>
            <p className="hero-lead">
              ResumeAI checks your resume the way applicant tracking systems read it, shows what's missing for the job
              you want, and helps you fix it as you write, without making anything up.
            </p>
            <div className="hero-ctas">
              <Button variant="primary" size="lg" asChild>
                <Link to="/sign-up">
                  Build my resume <ArrowRightIcon weight="bold" />
                </Link>
              </Button>
              <Button size="lg" asChild>
                <a href="#score">See what gets checked</a>
              </Button>
            </div>
            <dl className="hero-facts">
              {[
                ["Templates", "ATS-safe, one column"],
                ["Export", "PDF with real text"],
                ["AI", "Suggests, never invents"],
              ].map(([term, detail]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
          <HeroVisual />
        </section>

        <section id="score" className="band anchor">
          <div className="wrap split">
            <div>
              <h2 className="section-title">The score isn't magic. Here's what it measures.</h2>
              <p className="section-lead">
                No employer publishes an official “ATS score”. So we measure the two things that decide how your resume
                fares: whether software can read it cleanly, and whether it matches the job. Every point comes with a
                reason and a fix.
              </p>
            </div>
            <ol className="parts">
              {SCORE_PARTS.map((part, i) => (
                <li key={part.name} className="part">
                  <span className="part-index">0{i + 1}</span>
                  <div>
                    <h3>{part.name}</h3>
                    <p>{part.how}</p>
                  </div>
                  <div className="part-weight">
                    <strong>{part.weight}</strong>
                    <span>%</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="features" className="wrap anchor" style={{ paddingTop: 32 }}>
          <FeatureRow
            index="01"
            title="An AI copilot while you write"
            body="Click into any bullet and it checks it instantly. One click to improve it, shorten it, make it sound human, or add the number that's missing. Grey autocomplete suggests the next few words; Tab accepts."
            points={[
              "Flags weak starts, buzzwords and missing numbers as you type",
              "Write in Hindi, Hinglish or English notes; get clear English bullets",
              "Nothing changes until you press “Use this”",
            ]}
            visual={<BulletVisual />}
          />
          <FeatureRow
            flipped
            index="02"
            title="Tailor it to the job in a minute"
            body="Paste a job post. You see which of its keywords are already on your resume, which are missing, and where each missing one would fit naturally."
            points={[
              "Synonyms understood, so you don't stuff duplicates",
              "Required skills weighted above nice-to-haves",
              "Make a tailored copy and keep your main resume untouched",
            ]}
            visual={<JobMatchVisual />}
          />
          <FeatureRow
            index="03"
            title="Already have a resume? Start there."
            body="Upload your PDF or Word file. Get a line-by-line review, an improved version you can accept change by change, and a roadmap to the role you want."
            points={[
              "See exactly what an ATS pulls out of your file",
              "Each change explained, nothing applied without you",
              "A 30, 60, 90-day plan with projects that become bullets",
            ]}
            visual={<AnalyserVisual />}
          />
        </section>

        <section id="templates" className="tband anchor">
          <div className="wrap">
            <div className="tband-head">
              <div>
                <h2 className="section-title">Templates that stay out of the way</h2>
                <p className="section-lead" style={{ marginTop: 12, maxWidth: 560 }}>
                  One column, standard headings, real text. Switch any time without retyping a word.
                </p>
              </div>
              <Button asChild>
                <Link to="/sign-up">
                  Try them with your content <ArrowRightIcon />
                </Link>
              </Button>
            </div>
            <div className="tband-grid">
              {TEMPLATE_IDS.map((id) => (
                <figure key={id}>
                  <ResumeSheet template={id} width={340} />
                  <figcaption>
                    <div className="tband-name">{TEMPLATES[id].name}</div>
                    <div className="tband-desc">{TEMPLATES[id].description}</div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="wrap faq anchor">
          <div className="split" style={{ padding: 0 }}>
            <h2 className="section-title">Straight answers</h2>
            <div className="faq-list">
              {FAQ.map((item) => (
                <details key={item.q} className="faq-item">
                  <summary>
                    {item.q}
                    <span className="faq-toggle">
                      <PlusIcon weight="bold" className="icon-plus" />
                      <MinusIcon weight="bold" className="icon-minus" />
                    </span>
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="wrap">
          <div className="cta">
            <p>Your next application deserves a better resume.</p>
            <Button variant="primary" size="lg" asChild>
              <Link to="/sign-up">
                Start for free <ArrowRightIcon weight="bold" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="lfoot">
        <div className="wrap">
          <Logo />
          <span>© {new Date().getFullYear()} ResumeAI</span>
        </div>
      </footer>
    </div>
  );
}
