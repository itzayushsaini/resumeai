import { cx } from "@/lib/utils";

export function Card({ className, ...props }) {
  return <div className={cx("card", className)} {...props} />;
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cx("card-header", className)}>
      <div style={{ minWidth: 0 }}>
        <h2 className="card-title">{title}</h2>
        {description ? <p className="card-desc">{description}</p> : null}
      </div>
      {action ? <div style={{ flexShrink: 0 }}>{action}</div> : null}
    </div>
  );
}
