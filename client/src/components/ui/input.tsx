import { forwardRef, useLayoutEffect, useRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const fieldBase = [
  "w-full rounded-md border border-line-strong bg-surface text-ink",
  "shadow-[inset_0_1px_1px_rgb(20_22_30/0.03)]",
  "transition-[border-color,box-shadow] duration-150",
  "hover:border-ink-4/70",
  "focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/15",
  "disabled:cursor-not-allowed disabled:opacity-60",
  "aria-[invalid=true]:border-bad aria-[invalid=true]:focus:ring-bad/15",
].join(" ");

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(fieldBase, "h-9 px-3 text-sm", className)} {...props} />;
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Grow with content instead of scrolling. */
  autoGrow?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, autoGrow, value, ...props },
  forwardedRef,
) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!autoGrow || !el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [autoGrow, value]);

  return (
    <textarea
      ref={(node) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      value={value}
      className={cn(fieldBase, "min-h-9 px-3 py-2 text-sm leading-relaxed", autoGrow && "resize-none overflow-hidden", className)}
      {...props}
    />
  );
});
