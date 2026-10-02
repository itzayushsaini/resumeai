import type { ReactNode } from "react";
import { RadioGroup } from "radix-ui";
import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: ReactNode;
  title?: string;
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  className?: string;
  size?: "sm" | "md";
  "aria-label"?: string;
}

/** Compact single-choice control (a styled radio group). */
export function Segmented<T extends string>({ value, onChange, options, className, size = "md", ...rest }: SegmentedProps<T>) {
  return (
    <RadioGroup.Root
      value={value}
      onValueChange={(next) => onChange(next as T)}
      className={cn("inline-flex rounded-md bg-ink/[0.05] p-0.5 dark:bg-white/[0.06]", className)}
      aria-label={rest["aria-label"]}
    >
      {options.map((option) => (
        <RadioGroup.Item
          key={option.value}
          value={option.value}
          title={option.title}
          className={cn(
            "flex-1 rounded-[5px] font-medium text-ink-3 transition-colors outline-none",
            "hover:text-ink focus-visible:ring-2 focus-visible:ring-brand/40",
            "data-[state=checked]:bg-surface data-[state=checked]:text-ink data-[state=checked]:shadow-[0_1px_2px_rgb(20_22_30/0.12)]",
            "dark:data-[state=checked]:bg-surface-2",
            size === "sm" ? "h-7 px-2.5 text-[12.5px]" : "h-8 px-3 text-[13px]",
          )}
        >
          {option.label}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
