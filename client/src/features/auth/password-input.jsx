import { forwardRef, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";

export const PasswordInput = forwardRef(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password">
      <Input ref={ref} type={visible ? "text" : "password"} size="lg" {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="password-toggle"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeSlashIcon /> : <EyeIcon />}
      </button>
    </div>
  );
});
