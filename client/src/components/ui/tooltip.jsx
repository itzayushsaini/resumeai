import { Tooltip as T } from "radix-ui";

export const TooltipProvider = T.Provider;

export function Tooltip({ content, children, side = "top" }) {
  return (
    <T.Root>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content side={side} sideOffset={6} className="tooltip">
          {content}
        </T.Content>
      </T.Portal>
    </T.Root>
  );
}
