import type { ComponentProps } from "react";
import { Switch as S } from "radix-ui";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: ComponentProps<typeof S.Root>) {
  return (
    <S.Root
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full bg-ink/15 transition-colors",
        "data-[state=checked]:bg-brand dark:bg-white/15 dark:data-[state=checked]:bg-brand",
        className,
      )}
      {...props}
    >
      <S.Thumb className="block size-3.5 translate-x-0.5 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.25)] transition-transform data-[state=checked]:translate-x-[15px]" />
    </S.Root>
  );
}
