import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium select-none",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-150",
    "disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-brand text-white border border-black/10 dark:border-white/10",
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.16),0_1px_2px_rgb(20_22_30/0.14)]",
          "hover:bg-brand-hover",
        ],
        secondary: [
          "bg-surface text-ink border border-line-strong shadow-card",
          "hover:bg-surface-2 hover:border-ink-4/60",
        ],
        ghost: "text-ink-2 hover:bg-ink/[0.05] hover:text-ink dark:hover:bg-white/[0.06]",
        danger: [
          "bg-bad text-white border border-black/10",
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(20_22_30/0.14)]",
          "hover:brightness-110",
        ],
        "danger-ghost": "text-bad hover:bg-bad-soft",
        link: "text-brand-text underline-offset-4 hover:underline px-0! h-auto!",
      },
      size: {
        sm: "h-8 px-2.5 text-[13px] [&_svg]:size-4",
        md: "h-9 px-3.5 text-sm [&_svg]:size-4",
        lg: "h-11 px-5 text-[15px] [&_svg]:size-[18px]",
        "icon-sm": "size-8 [&_svg]:size-4",
        icon: "size-9 [&_svg]:size-[18px]",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild, loading, disabled, children, type, ...props },
  ref,
) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && !asChild ? (
        <>
          <span className="absolute inset-0 grid place-items-center">
            <Spinner className="size-4" />
          </span>
          <span className="invisible inline-flex items-center gap-1.5">{children}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
});

export { buttonVariants };
