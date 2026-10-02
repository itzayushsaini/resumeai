import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";

export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function PasswordInput(
  props,
  ref,
) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input ref={ref} type={visible ? "text" : "password"} className="h-10 pr-10" {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded text-ink-3 hover:text-ink"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeSlashIcon className="size-[18px]" /> : <EyeIcon className="size-[18px]" />}
      </button>
    </div>
  );
});
