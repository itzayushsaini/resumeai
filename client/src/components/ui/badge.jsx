import { cx } from "@/lib/utils";

/** tone: neutral | brand | good | warn | bad | outline */
export function Badge({ tone = "neutral", className, ...props }) {
  return <span className={cx("badge", tone !== "neutral" && `badge-${tone}`, className)} {...props} />;
}
