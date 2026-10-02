import { TEMPLATE_IDS, type TemplateId } from "@resumeai/shared";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FluidThumbnail } from "@/features/resume/fluid-thumbnail";
import { useExampleResume } from "@/features/resume/showcase";
import { useNewResume } from "@/features/resume/use-new-resume";
import { FONTS, TEMPLATES } from "@/features/resume/render/config";

function TemplateCard({ id }: { id: TemplateId }) {
  const { content, settings } = useExampleResume(id);
  const { start, pending, variables } = useNewResume();
  const busy = pending && variables?.template === id;

  return (
    <li className="flex flex-col">
      <div className="rounded-lg border border-line bg-sunken px-6 pt-6">
        <div className="overflow-hidden rounded-t-[3px] shadow-page ring-1 ring-black/5">
          <FluidThumbnail content={content} settings={settings} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <h2 className="text-[16px] font-semibold">{TEMPLATES[id].name}</h2>
        <Badge tone="good">ATS-safe</Badge>
        <Badge>{FONTS[settings.font].kind}</Badge>
      </div>
      <p className="mt-1 text-[13.5px] text-ink-2">{TEMPLATES[id].description}</p>
      <div className="mt-4 flex gap-2">
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
      <ul className="mt-8 grid gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
        {TEMPLATE_IDS.map((id) => (
          <TemplateCard key={id} id={id} />
        ))}
      </ul>

      <section className="mt-16 border-t border-line pt-8">
        <h2 className="text-[13px] font-semibold tracking-wide text-ink-3 uppercase">Why they all look calm</h2>
        <div className="mt-5 grid gap-8 md:grid-cols-3">
          {NOTES.map((note) => (
            <div key={note.title}>
              <h3 className="text-[14.5px] font-semibold">{note.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{note.body}</p>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
