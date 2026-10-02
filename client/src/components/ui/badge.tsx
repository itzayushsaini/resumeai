import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[5px] px-1.5 h-5 text-[11.5px] font-medium leading-none whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-ink/[0.06] text-ink-2 dark:bg-white/[0.07]",
        brand: "bg-brand-soft text-brand-ink",
        good: "bg-good-soft text-good",
        warn: "bg-warn-soft text-warn",
        bad: "bg-bad-soft text-bad",
        outline: "border border-line-strong text-ink-2",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
