import { forwardRef, useLayoutEffect, useRef } from "react";
import { cx } from "@/lib/utils";

/** size: md (default) | lg | xl */
export const Input = forwardRef(function Input({ className, size, ...props }, ref) {
  return <input ref={ref} className={cx("input", size && `input-${size}`, className)} {...props} />;
});

/** A textarea that can grow with its content (autoGrow) instead of scrolling. */
export const Textarea = forwardRef(function Textarea({ className, autoGrow, value, ...props }, forwardedRef) {
  const innerRef = useRef(null);

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
      className={cx("textarea", autoGrow && "textarea-grow", className)}
      {...props}
    />
  );
});
