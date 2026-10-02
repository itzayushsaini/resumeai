import { DropdownMenu as Menu } from "radix-ui";
import { cx } from "@/lib/utils";

export const DropdownMenu = Menu.Root;
export const DropdownMenuTrigger = Menu.Trigger;

export function DropdownMenuContent({ className, align = "end", sideOffset = 6, style, ...props }) {
  return (
    <Menu.Portal>
      <Menu.Content align={align} sideOffset={sideOffset} className={cx("menu", className)} style={style} {...props} />
    </Menu.Portal>
  );
}

/** tone: default | danger. `hint` adds a second, muted line. */
export function DropdownMenuItem({ className, icon, shortcut, hint, tone = "default", children, ...props }) {
  return (
    <Menu.Item className={cx("menu-item", tone === "danger" && "is-danger", className)} {...props}>
      {icon}
      <span className="menu-item-text">
        {children}
        {hint ? <span className="menu-item-hint">{hint}</span> : null}
      </span>
      {shortcut ? <span className="menu-item-shortcut">{shortcut}</span> : null}
    </Menu.Item>
  );
}

export function DropdownMenuLabel({ className, ...props }) {
  return <Menu.Label className={cx("menu-label", className)} {...props} />;
}

export function DropdownMenuSeparator() {
  return <Menu.Separator className="menu-separator" />;
}
