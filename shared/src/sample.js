import { createEntry, createSection, createSkillGroup, emptyBasics } from "./sections.js";

/** Realistic example content for "Start from an example" and template previews. */
export function createExampleContent() {
  return {
    basics: emptyBasics({
      name: "Maya Chen",
      headline: "Senior Frontend Engineer",
      email: "maya.chen@example.com",
      phone: "(512) 555-0142",
      location: "Austin, TX",
      website: "mayachen.dev",
      linkedin: "linkedin.com/in/mayachen",
      github: "github.com/mayachen",
    }),
    sections: [
      createSection("summary", {
        text: "Frontend engineer with 6 years building fast, accessible web apps in React and TypeScript. Led the rebuild of a checkout used by 2M shoppers a month and cut its load time in half. Comfortable owning features end to end, from API design to release.",
      }),
      createSection("experience", {
        entries: [
          createEntry({
            title: "Senior Frontend Engineer",
            subtitle: "Northwind Commerce",
            location: "San Francisco, CA · Hybrid",
            startDate: "2022-03",
            current: true,
            bullets: [
              "Led a 4-engineer rebuild of checkout in React and TypeScript, raising conversion 7.2% across 2M monthly sessions",
              "Cut median page load from 3.1s to 1.4s by code-splitting routes and moving pricing to an edge cache",
              "Built a shared component library of 48 components meeting WCAG 2.2 AA, now used by 6 product teams",
              "Mentored 3 junior engineers through code review and pairing; two were promoted within 18 months",
            ],
          }),
          createEntry({
            title: "Frontend Engineer",
            subtitle: "Fernway Health",
            location: "Remote",
            startDate: "2019-06",
            endDate: "2022-02",
            bullets: [
              "Shipped a patient scheduling app in React and GraphQL that now handles 40,000 bookings a week",
              "Reduced support tickets 31% by redesigning form validation and error states with the design team",
              "Introduced Playwright end-to-end tests in CI, halving regressions that reached production",
            ],
          }),
          createEntry({
            title: "Software Engineering Intern",
            subtitle: "Copperleaf Labs",
            location: "Austin, TX",
            startDate: "2018-05",
            endDate: "2018-08",
            bullets: ["Built an internal Vue.js dashboard that tracks build times across 120 services"],
          }),
        ],
      }),
      createSection("skills", {
        groups: [
          createSkillGroup({ name: "Languages", keywords: ["TypeScript", "JavaScript", "HTML", "CSS", "SQL"] }),
          createSkillGroup({
            name: "Frameworks",
            keywords: ["React", "Next.js", "Node.js", "GraphQL", "Tailwind CSS"],
          }),
          createSkillGroup({
            name: "Tools",
            keywords: ["Git", "Playwright", "Jest", "Vite", "AWS (S3, CloudFront)", "Figma"],
          }),
        ],
      }),
      createSection("projects", {
        entries: [
          createEntry({
            title: "Tidepool — open-source habit tracker",
            subtitle: "React Native, Supabase",
            link: "github.com/mayachen/tidepool",
            startDate: "2021-01",
            current: true,
            bullets: ["Grew to 2,300 GitHub stars and 40 outside contributors; maintain releases and roadmap"],
          }),
        ],
      }),
      createSection("education", {
        entries: [
          createEntry({
            title: "B.S. Computer Science",
            subtitle: "University of Texas at Austin",
            location: "Austin, TX",
            startDate: "2015-08",
            endDate: "2019-05",
            meta: "GPA 3.7",
          }),
        ],
      }),
      createSection("certifications", {
        entries: [
          createEntry({
            title: "AWS Certified Developer – Associate",
            subtitle: "Amazon Web Services",
            endDate: "2023-04",
          }),
        ],
      }),
    ],
  };
}
