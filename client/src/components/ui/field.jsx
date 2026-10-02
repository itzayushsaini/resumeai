import { useId } from "react";
import { cx } from "@/lib/utils";

/**
 * Label, control and hint/error. The control is a render function so the
 * label and messages can be wired to it:
 *   <Field label="Email">{(props) => <Input {...props} />}</Field>
 */
export function Field({ label, hint, error, className, aside, children }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cx("field", className)}>
      <div className="field-top">
        <label htmlFor={id} className="field-label">
          {label}
        </label>
        {aside}
      </div>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
