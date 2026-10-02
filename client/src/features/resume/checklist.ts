import type { ResumeContent, SectionType } from "@resumeai/shared";
import { entryHasContent } from "./render/blocks";

export interface ChecklistItem {
  id: string;
  label: string;
  detail: string;
  done: boolean;
}

function collect(content: ResumeContent) {
  const sections = content.sections.filter((s) => s.visible);
  const entriesOf = (types: SectionType[]) =>
    sections.filter((s) => types.includes(s.type)).flatMap((s) => s.entries.filter(entryHasContent));
  const work = entriesOf(["experience", "projects", "volunteering"]);
  const bullets = work.flatMap((e) => e.bullets).filter((b) => b.trim());
  const skills = sections
    .filter((s) => s.type === "skills")
    .flatMap((s) => s.groups.flatMap((g) => g.keywords))
    .filter(Boolean);
  const summary = sections.find((s) => s.type === "summary")?.text.trim() ?? "";
  const positions = entriesOf(["experience"]).length;
  return { work, bullets, skills, summary, positions };
}

export function resumeStats(content: ResumeContent) {
  const { positions, skills, work } = collect(content);
  const parts: string[] = [];
  if (positions) parts.push(`${positions} ${positions === 1 ? "role" : "roles"}`);
  const projects = work.length - positions;
  if (projects > 0) parts.push(`${projects} ${projects === 1 ? "project" : "projects"}`);
  if (skills.length) parts.push(`${skills.length} skills`);
  return parts.join(" · ") || "Empty so far";
}

/** Quick, rule-based checks that don't need AI. */
export function resumeChecklist(content: ResumeContent): ChecklistItem[] {
  const b = content.basics;
  const { work, bullets, skills, summary } = collect(content);
  const withNumber = bullets.filter((t) => /\d/.test(t)).length;
  const missingContact = [
    !b.name && "name",
    !b.email && "email",
    !b.phone && "phone",
    !b.location && "city",
  ].filter(Boolean);

  return [
    {
      id: "contact",
      label: "Contact details",
      detail: missingContact.length ? `Add your ${missingContact.join(", ")}` : "Name, email, phone and city",
      done: missingContact.length === 0,
    },
    {
      id: "summary",
      label: "Summary",
      detail: summary.length >= 120 ? "Looks complete" : "Two to four lines on what you do best",
      done: summary.length >= 120,
    },
    {
      id: "experience",
      label: "Roles or projects",
      detail: work.length >= 2 ? `${work.length} added` : "Add at least two",
      done: work.length >= 2,
    },
    {
      id: "numbers",
      label: "Bullets show results",
      detail: bullets.length
        ? `${withNumber} of ${bullets.length} bullets include a number`
        : "Add bullet points to your roles",
      done: bullets.length >= 3 && withNumber / bullets.length >= 0.5,
    },
    {
      id: "skills",
      label: "Skills listed",
      detail: skills.length >= 8 ? `${skills.length} skills` : `${skills.length} of 8 recommended`,
      done: skills.length >= 8,
    },
  ];
}
