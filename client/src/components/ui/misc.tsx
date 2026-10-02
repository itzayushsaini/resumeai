import type { ReactNode, SelectHTMLAttributes } from "react";
import { forwardRef } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { cn, initials } from "@/lib/utils";
import { fieldBase } from "./input";

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[4px] border border-line-strong bg-surface-2 px-1",
        "font-sans text-[10.5px] font-medium text-ink-3 shadow-[0_1px_0_var(--line-strong)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

export function Avatar({ name, image, className }: { name?: string | null; image?: string | null; className?: string }) {
  if (image) {
    return <img src={image} alt="" className={cn("size-8 rounded-full object-cover", className)} referrerPolicy="no-referrer" />;
  }
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full bg-[#d9dff7] text-[12px] font-semibold text-[#1f357f]",
        "dark:bg-[#26305a] dark:text-[#c5d0ff]",
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-ink/[0.06] dark:bg-white/[0.06]", className)} />;
}

export const NativeSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function NativeSelect(
  { className, children, ...props },
  ref,
) {
  return (
    <div className={cn("relative", className)}>
      <select ref={ref} className={cn(fieldBase, "h-9 appearance-none pr-8 pl-3 text-sm")} {...props}>
        {children}
      </select>
      <CaretDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-ink-3" />
    </div>
  );
});

export function Divider({ label, className }: { label?: string; className?: string }) {
  if (!label) return <div className={cn("h-px bg-line", className)} />;
  return (
    <div className={cn("flex items-center gap-3 text-[12px] text-ink-3", className)}>
      <div className="h-px flex-1 bg-line" />
      {label}
      <div className="h-px flex-1 bg-line" />
    </div>
  );
}
