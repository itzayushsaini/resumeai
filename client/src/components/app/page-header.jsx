import { cx } from "@/lib/utils";

export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <header className={cx("page-header", className)}>
      <div style={{ minWidth: 0 }}>
        {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
        <h1 className="page-title">{title}</h1>
        {description ? <p className="page-desc">{description}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

export function PageContainer({ children, narrow }) {
  return <div className={cx("page", narrow && "page-narrow")}>{children}</div>;
}
