export const ROLE_SUGGESTIONS = [
  "Software Engineer",
  "Frontend Developer",
  "Data Analyst",
  "Product Manager",
  "UX Designer",
  "Data Scientist",
  "Marketing Manager",
  "Business Analyst",
];

export const EXPERIENCE_LEVELS = [
  { value: "student", label: "Student or new grad", hint: "Internships, projects and coursework" },
  { value: "early", label: "Early career", hint: "About 1–3 years" },
  { value: "mid", label: "Mid-level", hint: "About 3–7 years" },
  { value: "senior", label: "Senior", hint: "7 or more years" },
  { value: "lead", label: "Manager or lead", hint: "You lead people or a function" },
] as const;

export function levelLabel(value: string | null | undefined) {
  return EXPERIENCE_LEVELS.find((level) => level.value === value)?.label ?? "";
}
