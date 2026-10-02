import "./templates.css";
import { TEMPLATE_IDS } from "@resumeai/shared";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FluidThumbnail } from "@/features/resume/fluid-thumbnail";
import { useExampleResume } from "@/features/resume/showcase";
import { useNewResume } from "@/features/resume/use-new-resume";
import { FONTS, TEMPLATES } from "@/features/resume/render/config";

function TemplateCard({ id }) {
  const { content, settings } = useExampleResume(id);
  const { start, pending, variables } = useNewResume();
  const busy = pending && variables?.template === id;

  return (
    <li className="template-card">
      <div className="template-desk">
        <div className="template-paper">
          <FluidThumbnail content={content} settings={settings} />
        </div>
      </div>
      <div className="template-name">
        <h2>{TEMPLATES[id].name}</h2>
        <Badge tone="good">ATS-safe</Badge>
        <Badge>{FONTS[settings.font].kind}</Badge>
      </div>
      <p className="template-desc">{TEMPLATES[id].description}</p>
      <div className="template-actions">
        <Button
          variant="primary"
          size="sm"
          loading={busy && variables?.starter === "blank"}
          disabled={pending}
          onClick={() => start({ starter: "blank", template: id })}
        >
          Use template
        </Button>
        <Button
          size="sm"
          loading={busy && variables?.starter === "example"}
          disabled={pending}
          onClick={() => start({ starter: "example", template: id })}
        >
          Try with example content
        </Button>
      </div>
    </li>
  );
}

const NOTES = [
  {
    title: "One column",
    body: "Two-column layouts often get read across the columns, mixing your job titles with your skills. Every template here keeps one reading order.",
  },
  {
    title: "Real text, not images",
    body: "PDFs export with a selectable text layer, so the parser gets exactly what you typed. No icons standing in for words.",
  },
  {
    title: "Standard headings",
    body: "Experience, Education, Skills. Parsers look for familiar section names, so the defaults stick to them. You can still rename any section.",
  },
];

export default function TemplatesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Templates"
        description="Pick a look. You can switch at any time in the editor without losing anything."
      />
      <ul className="template-grid">
        {TEMPLATE_IDS.map((id) => (
          <TemplateCard key={id} id={id} />
        ))}
      </ul>

      <section className="notes">
        <h2 className="notes-heading">Why they all look calm</h2>
        <div className="notes-grid">
          {NOTES.map((note) => (
            <div key={note.title}>
              <h3>{note.title}</h3>
              <p>{note.body}</p>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
