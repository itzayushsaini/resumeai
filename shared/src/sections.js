const role = { label: "Job title", placeholder: "Senior Software Engineer" };
const org = { label: "Company", placeholder: "Northwind Commerce" };
const place = { label: "Location", placeholder: "Austin, TX · Remote" };
const impact = {
  label: "Bullet points",
  placeholder: "Cut checkout load time 38% by moving pricing to an edge cache",
};

export const SECTION_META = {
  summary: {
    type: "summary",
    label: "Summary",
    defaultTitle: "Summary",
    hint: "Two or three lines on who you are and what you're best at.",
    fields: {},
    dates: null,
    bullets: null,
    addLabel: "",
  },
  experience: {
    type: "experience",
    label: "Experience",
    defaultTitle: "Experience",
    hint: "Jobs, internships and contract work, newest first.",
    fields: { title: role, subtitle: org, location: place },
    dates: "range",
    bullets: impact,
    addLabel: "Add position",
  },
  education: {
    type: "education",
    label: "Education",
    defaultTitle: "Education",
    hint: "Degrees, diplomas and bootcamps.",
    fields: {
      title: { label: "Degree", placeholder: "B.S. Computer Science" },
      subtitle: { label: "School", placeholder: "University of Texas at Austin" },
      location: place,
      meta: { label: "Grade", placeholder: "GPA 3.8 / 4.0" },
    },
    dates: "range",
    bullets: { label: "Highlights", placeholder: "Senior thesis on low-latency collaborative editing" },
    addLabel: "Add education",
  },
  skills: {
    type: "skills",
    label: "Skills",
    defaultTitle: "Skills",
    hint: "Group related skills so a recruiter can scan them in seconds.",
    fields: {},
    dates: null,
    bullets: null,
    addLabel: "Add group",
  },
  projects: {
    type: "projects",
    label: "Projects",
    defaultTitle: "Projects",
    hint: "Side projects, open source and portfolio work.",
    fields: {
      title: { label: "Project", placeholder: "Tidepool — open-source habit tracker" },
      subtitle: { label: "Stack or role", placeholder: "React Native, Supabase" },
      link: { label: "Link", placeholder: "github.com/you/tidepool" },
    },
    dates: "range",
    bullets: { label: "Bullet points", placeholder: "Reached 2,300 GitHub stars and 40 outside contributors" },
    addLabel: "Add project",
  },
  certifications: {
    type: "certifications",
    label: "Certifications",
    defaultTitle: "Certifications",
    hint: "Licenses and certificates with the issuer and date.",
    fields: {
      title: { label: "Certification", placeholder: "AWS Certified Developer – Associate" },
      subtitle: { label: "Issuer", placeholder: "Amazon Web Services" },
      link: { label: "Credential link", placeholder: "credly.com/badges/…" },
    },
    dates: "single",
    bullets: null,
    addLabel: "Add certification",
  },
  achievements: {
    type: "achievements",
    label: "Achievements",
    defaultTitle: "Achievements",
    hint: "Awards, publications, patents, competitions.",
    fields: {
      title: { label: "Achievement", placeholder: "First place, HackTX" },
      subtitle: { label: "Awarded by", placeholder: "University of Texas" },
    },
    dates: "single",
    bullets: { label: "Details", placeholder: "Built a real-time transit tracker in 24 hours with a team of 3" },
    addLabel: "Add achievement",
  },
  languages: {
    type: "languages",
    label: "Languages",
    defaultTitle: "Languages",
    hint: "Spoken languages and how well you speak them.",
    fields: {
      title: { label: "Language", placeholder: "Spanish" },
      subtitle: { label: "Level", placeholder: "Professional working proficiency" },
    },
    dates: null,
    bullets: null,
    addLabel: "Add language",
  },
  volunteering: {
    type: "volunteering",
    label: "Volunteering",
    defaultTitle: "Volunteering",
    hint: "Unpaid roles that show leadership or relevant skills.",
    fields: {
      title: { label: "Role", placeholder: "Mentor" },
      subtitle: { label: "Organization", placeholder: "Code2040" },
      location: place,
    },
    dates: "range",
    bullets: impact,
    addLabel: "Add role",
  },
  custom: {
    type: "custom",
    label: "Custom section",
    defaultTitle: "Additional",
    hint: "Anything else: publications, talks, interests.",
    fields: {
      title: { label: "Title", placeholder: "Speaker, React Summit" },
      subtitle: { label: "Subtitle", placeholder: "Amsterdam" },
      location: { label: "Location", placeholder: "" },
      link: { label: "Link", placeholder: "" },
    },
    dates: "range",
    bullets: { label: "Bullet points", placeholder: "" },
    addLabel: "Add item",
  },
};

/* ------------------------------------------------------------------ */
/* Factories                                                           */
/* ------------------------------------------------------------------ */

export function createId() {
  return globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export function createEntry(partial = {}) {
  return {
    id: createId(),
    title: "",
    subtitle: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    link: "",
    meta: "",
    bullets: [],
    ...partial,
  };
}

export function createSkillGroup(partial = {}) {
  return { id: createId(), name: "", keywords: [], ...partial };
}

export function createSection(type, partial = {}) {
  const meta = SECTION_META[type];
  return {
    id: createId(),
    type,
    title: meta.defaultTitle,
    visible: true,
    text: "",
    entries: [],
    groups: [],
    ...partial,
  };
}

export function emptyBasics(partial = {}) {
  return {
    name: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    ...partial,
  };
}

export function createBlankContent(basics = {}) {
  return {
    basics: emptyBasics(basics),
    sections: [
      createSection("summary"),
      createSection("experience", { entries: [createEntry({ bullets: [""] })] }),
      createSection("education", { entries: [createEntry()] }),
      createSection("skills", { groups: [createSkillGroup({ name: "Skills" })] }),
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatMonth(value) {
  if (!value) return "";
  const [year, month] = value.split("-");
  if (!month) return year ?? "";
  return `${MONTHS[Number(month) - 1] ?? ""} ${year}`;
}

export function formatEntryDates(entry, mode) {
  if (!mode) return "";
  if (mode === "single") return formatMonth(entry.endDate || entry.startDate);
  const start = formatMonth(entry.startDate);
  const end = entry.current ? "Present" : formatMonth(entry.endDate);
  if (start && end) return `${start} – ${end}`;
  return start || end;
}
