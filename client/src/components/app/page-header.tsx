import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-4", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="text-[13px] text-ink-3">{eyebrow}</p> : null}
        <h1 className="mt-0.5 font-display text-[38px] leading-[1.05] tracking-[-0.01em] text-ink sm:text-[42px]">{title}</h1>
        {description ? <p className="mt-2 text-[14.5px] text-ink-2">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1160px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10", className)}>{children}</div>;
}
