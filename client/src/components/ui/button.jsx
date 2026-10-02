import { forwardRef } from "react";
import { Slot } from "radix-ui";
import { cx } from "@/lib/utils";
import { Spinner } from "./spinner";

/**
 * variant: primary | secondary | ghost | danger | danger-ghost | ai | link
 * size: sm | md | lg | icon | icon-sm | icon-xs
 */
export const Button = forwardRef(function Button(
  { className, variant = "secondary", size = "md", block, asChild, loading, disabled, children, type, ...props },
  ref,
) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (type ?? "button")}
      className={cx("btn", `btn-${variant}`, `btn-${size}`, block && "btn-block", loading && "is-loading", className)}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && !asChild ? (
        <>
          <span className="btn-spinner">
            <Spinner />
          </span>
          <span className="btn-label">{children}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
});
