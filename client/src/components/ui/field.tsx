import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  className?: string;
  /** Rendered next to the label, e.g. a "Forgot password?" link. */
  aside?: ReactNode;
  children: (props: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) => ReactNode;
}

export function Field({ label, hint, error, className, aside, children }: FieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-medium text-ink-2">
          {label}
        </label>
        {aside}
      </div>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {error ? (
        <p id={`${id}-error`} className="text-[12.5px] text-bad">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[12.5px] text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
