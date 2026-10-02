import { useEffect, useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { cx } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 60 }, (_, i) => String(THIS_YEAR + 4 - i));

/** "YYYY-MM" (or just "YYYY") picker built from two native selects. */
export function MonthInput({ value, onChange, disabled, id, ...rest }) {
  const [year = "", month = ""] = value.split("-");
  // Remember a month picked before the year, so the order of picking doesn't matter.
  const [pendingMonth, setPendingMonth] = useState(month);
  useEffect(() => setPendingMonth(month), [month]);

  return (
    <div className={cx("month", disabled && "is-disabled")} role="group" aria-label={rest["aria-label"]}>
      <div className="select-wrap">
        <select
          id={id}
          className="select"
          value={year ? month : pendingMonth}
          disabled={disabled}
          aria-label="Month"
          onChange={(e) => {
            const m = e.target.value;
            setPendingMonth(m);
            if (year) onChange(m ? `${year}-${m}` : year);
          }}
        >
          <option value="">Month</option>
          {MONTHS.map((label, i) => (
            <option key={label} value={String(i + 1).padStart(2, "0")}>
              {label}
            </option>
          ))}
        </select>
        <CaretDownIcon className="select-caret" />
      </div>
      <div className="select-wrap">
        <select
          className="select"
          value={year}
          disabled={disabled}
          aria-label="Year"
          onChange={(e) => {
            const y = e.target.value;
            onChange(y ? (pendingMonth ? `${y}-${pendingMonth}` : y) : "");
          }}
        >
          <option value="">Year</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <CaretDownIcon className="select-caret" />
      </div>
    </div>
  );
}
