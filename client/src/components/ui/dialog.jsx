import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "@phosphor-icons/react";
import { cx } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ title, description, children, className, style }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="overlay" />
      <DialogPrimitive.Content className={cx("dialog", className)} style={style}>
        <div className="dialog-head">
          <DialogPrimitive.Title className="dialog-title">{title}</DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="dialog-desc">{description}</DialogPrimitive.Description>
          ) : (
            <DialogPrimitive.Description className="sr-only" />
          )}
        </div>
        {children}
        <DialogPrimitive.Close className="dialog-close" aria-label="Close">
          <XIcon />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogBody({ className, children }) {
  return <div className={cx("dialog-body", className)}>{children}</div>;
}

export function DialogFooter({ className, children }) {
  return <div className={cx("dialog-footer", className)}>{children}</div>;
}
