import { RadioGroup } from "radix-ui";
import { cx } from "@/lib/utils";

/**
 * Compact single-choice control (a styled radio group).
 * options: [{ value, label, title? }]
 */
export function Segmented({ value, onChange, options, className, size = "md", block, ...rest }) {
  return (
    <RadioGroup.Root
      value={value}
      onValueChange={onChange}
      className={cx("segmented", size === "sm" && "segmented-sm", block && "segmented-block", className)}
      aria-label={rest["aria-label"]}
    >
      {options.map((option) => (
        <RadioGroup.Item key={option.value} value={option.value} title={option.title} className="segmented-item">
          {option.label}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
