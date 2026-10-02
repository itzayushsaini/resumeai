import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden>
      <path
        d="M6 1.5h8.6l6.4 6.4V20a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 20V4A2.5 2.5 0 0 1 6 1.5Z"
        fill="#2f54e8"
      />
      <path d="M14.6 1.5v4.4a2 2 0 0 0 2 2H21" fill="#a9b8f5" />
      <path d="M7.6 13.2h7.6M7.6 17h4.6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, tone = "ink" }: { className?: string; tone?: "ink" | "light" }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span
        className={cn(
          "text-[15.5px] font-semibold tracking-[-0.02em]",
          tone === "light" ? "text-rail-ink" : "text-ink",
        )}
      >
        Resume<span className={tone === "light" ? "text-rail-ink-2" : "text-ink-3"}>AI</span>
      </span>
    </span>
  );
}
