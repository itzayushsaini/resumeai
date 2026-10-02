import type { ReactNode } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

interface DialogContentProps {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Hide the visible header (title stays available to screen readers). */
  bare?: boolean;
}

export function DialogContent({ title, description, children, className, bare }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#0b0e14]/45 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-[440px] -translate-x-1/2 -translate-y-1/2",
          "rounded-xl border border-line bg-surface shadow-pop outline-none",
          "data-[state=open]:animate-pop-in",
          className,
        )}
      >
        {bare ? (
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
        ) : (
          <div className="px-5 pt-5 pr-12">
            <DialogPrimitive.Title className="text-[15px] font-semibold text-ink">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-1 text-[13.5px] leading-relaxed text-ink-2">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
        )}
        {!description && <DialogPrimitive.Description className="sr-only" />}
        {children}
        <DialogPrimitive.Close
          className="absolute top-3.5 right-3.5 grid size-7 place-items-center rounded-md text-ink-3 hover:bg-ink/5 hover:text-ink"
          aria-label="Close"
        >
          <XIcon className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("px-5 pt-4", className)}>{children}</div>;
}

export function DialogFooter({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex items-center justify-end gap-2 px-5 pt-5 pb-5", className)}>{children}</div>;
}
