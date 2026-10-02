import { forwardRef } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { cx, initials } from "@/lib/utils";

export function Kbd({ children, className }) {
  return <kbd className={cx("kbd", className)}>{children}</kbd>;
}

export function Avatar({ name, image, small }) {
  const className = cx("avatar", small && "avatar-sm");
  if (image) return <img src={image} alt="" className={className} referrerPolicy="no-referrer" />;
  return (
    <span className={className} aria-hidden>
      {initials(name)}
    </span>
  );
}

export function Skeleton({ className, style }) {
  return <div className={cx("skeleton", className)} style={style} />;
}

export const NativeSelect = forwardRef(function NativeSelect({ className, children, ...props }, ref) {
  return (
    <div className={cx("select-wrap", className)}>
      <select ref={ref} className="select" {...props}>
        {children}
      </select>
      <CaretDownIcon className="select-caret" />
    </div>
  );
});

export function Divider({ label, className }) {
  if (!label) return <div className={cx("divider", className)} />;
  return <div className={cx("divider-label", className)}>{label}</div>;
}
