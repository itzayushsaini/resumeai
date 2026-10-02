import type { ComponentProps, ReactNode } from "react";
import { DropdownMenu as Menu } from "radix-ui";
import { cn } from "@/lib/utils";

export const DropdownMenu = Menu.Root;
export const DropdownMenuTrigger = Menu.Trigger;
export const DropdownMenuGroup = Menu.Group;

export function DropdownMenuContent({
  className,
  align = "end",
  sideOffset = 6,
  ...props
}: ComponentProps<typeof Menu.Content>) {
  return (
    <Menu.Portal>
      <Menu.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[180px] overflow-hidden rounded-lg border border-line bg-surface p-1 shadow-pop",
          "data-[state=open]:animate-pop-in",
          className,
        )}
        {...props}
      />
    </Menu.Portal>
  );
}

interface ItemProps extends ComponentProps<typeof Menu.Item> {
  icon?: ReactNode;
  shortcut?: string;
  tone?: "default" | "danger";
}

export function DropdownMenuItem({ className, icon, shortcut, tone = "default", children, ...props }: ItemProps) {
  return (
    <Menu.Item
      className={cn(
        "flex h-8 cursor-default items-center gap-2.5 rounded-md px-2 text-[13px] text-ink outline-none select-none",
        "data-[highlighted]:bg-ink/[0.05] dark:data-[highlighted]:bg-white/[0.06] data-[disabled]:opacity-50",
        "[&_svg]:size-4 [&_svg]:text-ink-3",
        tone === "danger" && "text-bad [&_svg]:text-bad data-[highlighted]:bg-bad-soft",
        className,
      )}
      {...props}
    >
      {icon}
      <span className="flex-1">{children}</span>
      {shortcut ? <span className="text-[11.5px] text-ink-4">{shortcut}</span> : null}
    </Menu.Item>
  );
}

export function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof Menu.Label>) {
  return <Menu.Label className={cn("px-2 pt-1.5 pb-1 text-[11.5px] font-medium text-ink-3", className)} {...props} />;
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <Menu.Separator className={cn("my-1 h-px bg-line", className)} />;
}
