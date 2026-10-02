import { Switch as S } from "radix-ui";
import { cx } from "@/lib/utils";

export function Switch({ className, ...props }) {
  return (
    <S.Root className={cx("switch", className)} {...props}>
      <S.Thumb className="switch-thumb" />
    </S.Root>
  );
}
