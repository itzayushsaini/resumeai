import { useEffect, useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { fieldBase } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 60 }, (_, i) => String(THIS_YEAR + 4 - i));

interface MonthInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
}

/** "YYYY-MM" (or just "YYYY") picker built from two native selects. */
export function MonthInput({ value, onChange, disabled, id, ...rest }: MonthInputProps) {
  const [year = "", month = ""] = value.split("-");
  // Remember a month picked before the year, so the order of picking doesn't matter.
  const [pendingMonth, setPendingMonth] = useState(month);
  useEffect(() => setPendingMonth(month), [month]);

  const select = cn(fieldBase, "h-9 appearance-none bg-transparent pr-6 pl-2.5 text-sm tabular");

  return (
    <div className={cn("grid grid-cols-[1fr_1.1fr] gap-1.5", disabled && "opacity-50")} role="group" aria-label={rest["aria-label"]}>
      <div className="relative">
        <select
          id={id}
          className={select}
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
        <CaretDownIcon className="pointer-events-none absolute top-1/2 right-2 size-3 -translate-y-1/2 text-ink-3" />
      </div>
      <div className="relative">
        <select
          className={select}
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
        <CaretDownIcon className="pointer-events-none absolute top-1/2 right-2 size-3 -translate-y-1/2 text-ink-3" />
      </div>
    </div>
  );
}
