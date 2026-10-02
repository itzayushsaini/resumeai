import { Fragment } from "react";
import { SECTION_META, formatEntryDates, isEntrySection } from "@resumeai/shared";

/**
 * A resume is rendered as a flat list of blocks. The paginator measures each
 * block and decides where pages break; `keepWithNext` stops a heading or a job
 * title from being stranded at the bottom of a page.
 */

function Anchor({ ctx, href, className, children }) {
  return ctx.links ? (
    <a className={className} href={href}>
      {children}
    </a>
  ) : (
    <span className={className}>{children}</span>
  );
}

function toUrl(value) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function cx(...names) {
  return names.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function Header({ basics, ctx }) {
  const contact = [];
  if (basics.email) contact.push({ text: basics.email, href: `mailto:${basics.email}` });
  if (basics.phone) contact.push({ text: basics.phone, href: `tel:${basics.phone.replace(/[^\d+]/g, "")}` });
  if (basics.location) contact.push({ text: basics.location });
  for (const value of [basics.website, basics.linkedin, basics.github]) {
    if (value) contact.push({ text: value, href: toUrl(value) });
  }

  return (
    <header className="rz-header">
      {basics.name || ctx.placeholders ? (
        <h1 className={cx("rz-name", !basics.name && "rz-ghost")}>{basics.name || "Your name"}</h1>
      ) : null}
      {basics.headline || ctx.placeholders ? (
        <div className={cx("rz-headline", !basics.headline && "rz-ghost")}>{basics.headline || "Target job title"}</div>
      ) : null}
      {contact.length > 0 ? (
        <div className="rz-contact">
          {contact.map((item, i) => (
            <Fragment key={i}>
              {/* Spaces around the dot are the only places the line may wrap. */}
              {i > 0 && (
                <>
                  {" "}
                  <span className="rz-sep">·</span>{" "}
                </>
              )}
              {item.href ? (
                <Anchor ctx={ctx} className="rz-item" href={item.href}>
                  {item.text}
                </Anchor>
              ) : (
                <span className="rz-item">{item.text}</span>
              )}
            </Fragment>
          ))}
        </div>
      ) : ctx.placeholders ? (
        <div className="rz-contact rz-ghost">you@example.com · (555) 555-0100 · City, State</div>
      ) : null}
    </header>
  );
}

function SectionTitle({ title }) {
  return <h2 className="rz-section-title">{title}</h2>;
}

function EntryHeader({ entry, section, ctx }) {
  const meta = SECTION_META[section.type];
  const ghost = ctx.placeholders && !entry.title && !entry.subtitle;
  const title = entry.title || (ghost ? (meta.fields.title?.label ?? "") : "");
  const subtitle = entry.subtitle || (ghost ? (meta.fields.subtitle?.label ?? "") : "");
  const dates = formatEntryDates(entry, meta.dates);
  const link = entry.link ? (
    <Anchor ctx={ctx} className="rz-link" href={toUrl(entry.link)}>
      {entry.link}
    </Anchor>
  ) : null;

  const datesNode = dates ? <span className="rz-dates">{dates}</span> : null;

  if (ctx.template === "classic") {
    const second = subtitle || entry.meta || link || entry.location;
    return (
      <div className={cx("rz-entry", ghost && "rz-ghost")}>
        <div className="rz-row">
          <span className="rz-title">{title}</span>
          {datesNode}
        </div>
        {second ? (
          <div className="rz-row">
            <span>
              {subtitle ? <span className="rz-sub">{subtitle}</span> : null}
              {entry.meta ? (
                <span className="rz-muted">
                  {subtitle ? ", " : ""}
                  {entry.meta}
                </span>
              ) : null}
              {link ? (
                <>
                  {subtitle || entry.meta ? <span className="rz-sep">·</span> : null}
                  {link}
                </>
              ) : null}
            </span>
            {entry.location ? <span className="rz-loc">{entry.location}</span> : null}
          </div>
        ) : null}
      </div>
    );
  }

  const details = [entry.location, entry.meta].filter(Boolean);
  const joiner = ctx.template === "modern" ? " · " : ", ";
  return (
    <div className={cx("rz-entry", ghost && "rz-ghost")}>
      <div className="rz-row">
        <span>
          <span className="rz-title">{title}</span>
          {subtitle ? (
            <span className={ctx.template === "modern" ? "rz-sub" : "rz-muted"}>
              {joiner}
              {subtitle}
            </span>
          ) : null}
        </span>
        {datesNode}
      </div>
      {details.length > 0 || link ? (
        <div className="rz-muted">
          {details.join(" · ")}
          {link ? (
            <>
              {details.length > 0 ? <span className="rz-sep">·</span> : null}
              {link}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Bullet({ text }) {
  return (
    <div className="rz-bullet">
      <span className="rz-dot">•</span>
      <span>{text}</span>
    </div>
  );
}

function SkillLine({ group, ctx }) {
  const keywords = group.keywords.filter(Boolean).join(", ");
  if (ctx.template === "modern") {
    return (
      <div className="rz-skill">
        <span className="rz-skill-name">{group.name}</span>
        <span>{keywords}</span>
      </div>
    );
  }
  return (
    <div className="rz-skill">
      {group.name ? <span className="rz-skill-name">{group.name}: </span> : null}
      <span>{keywords}</span>
    </div>
  );
}

function LanguageLine({ entries }) {
  return (
    <div>
      {entries.map((entry, i) => (
        <Fragment key={entry.id}>
          {i > 0 && <span className="rz-sep">·</span>}
          <span className="rz-skill-name">{entry.title}</span>
          {entry.subtitle ? <span className="rz-muted"> ({entry.subtitle})</span> : null}
        </Fragment>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Builder                                                             */
/* ------------------------------------------------------------------ */

export function entryHasContent(entry) {
  return Boolean(
    entry.title.trim() ||
    entry.subtitle.trim() ||
    entry.startDate ||
    entry.endDate ||
    entry.bullets.some((b) => b.trim()),
  );
}

function sectionBlocks(section, ctx) {
  const meta = SECTION_META[section.type];

  if (section.type === "summary") {
    const text = section.text.trim();
    if (!text && !ctx.placeholders) return [];
    return [
      {
        key: `${section.id}:text`,
        gap: "none",
        keepWithNext: false,
        node: (
          <p className={cx("rz-summary", !text && "rz-ghost")}>
            {text || "A short summary of your experience and what you're looking for next."}
          </p>
        ),
      },
    ];
  }

  if (section.type === "skills") {
    const groups = section.groups.filter((g) => g.keywords.some(Boolean));
    if (!groups.length && ctx.placeholders) {
      return [
        {
          key: `${section.id}:ghost`,
          gap: "none",
          keepWithNext: false,
          node: <div className="rz-ghost">Skill, Skill, Skill</div>,
        },
      ];
    }
    return groups.map((group, i) => ({
      key: group.id,
      gap: i === 0 ? "none" : "item",
      keepWithNext: false,
      node: <SkillLine group={group} ctx={ctx} />,
    }));
  }

  if (section.type === "languages") {
    const entries = section.entries.filter((e) => e.title.trim());
    if (!entries.length) return [];
    return [{ key: `${section.id}:list`, gap: "none", keepWithNext: false, node: <LanguageLine entries={entries} /> }];
  }

  if (!isEntrySection(section.type)) return [];

  const entries = ctx.placeholders ? section.entries : section.entries.filter(entryHasContent);
  const between = meta.bullets ? "entry" : "item";
  const blocks = [];

  entries.forEach((entry, i) => {
    const bullets = entry.bullets.filter((b) => b.trim());
    blocks.push({
      key: entry.id,
      gap: i === 0 ? "none" : between,
      keepWithNext: bullets.length > 0,
      node: <EntryHeader entry={entry} section={section} ctx={ctx} />,
    });
    bullets.forEach((text, j) => {
      blocks.push({ key: `${entry.id}:b${j}`, gap: "bullet", keepWithNext: false, node: <Bullet text={text} /> });
    });
  });

  return blocks;
}

export function buildBlocks(content, settings, { placeholders = false, links = true } = {}) {
  const ctx = { template: settings.template, placeholders, links };
  const blocks = [
    { key: "header", gap: "none", keepWithNext: false, node: <Header basics={content.basics} ctx={ctx} /> },
  ];

  for (const section of content.sections) {
    if (!section.visible) continue;
    const body = sectionBlocks(section, ctx);
    if (!body.length) continue;
    blocks.push({
      key: `${section.id}:title`,
      gap: "section",
      keepWithNext: true,
      node: <SectionTitle title={section.title || SECTION_META[section.type].defaultTitle} />,
    });
    blocks.push(...body);
  }

  return blocks;
}
