import { Link, Outlet } from "react-router";
import { Logo } from "@/components/brand/logo";
import { ResumeSheet } from "@/features/resume/showcase";

function MarginNote({
  tone,
  label,
  children,
  className,
}: {
  tone: "good" | "warn";
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`absolute w-[208px] rounded-lg border border-white/10 bg-[#181d29]/95 p-3 shadow-pop backdrop-blur ${className ?? ""}`}
    >
      <div className="flex items-center gap-1.5 text-[11.5px] font-semibold tracking-wide uppercase">
        <span className={`size-1.5 rounded-full ${tone === "good" ? "bg-[#4cc38a]" : "bg-[#e3a43c]"}`} />
        <span className={tone === "good" ? "text-[#7fd8ab]" : "text-[#f0c071]"}>{label}</span>
      </div>
      <p className="mt-1 text-[13px] leading-snug text-rail-ink">{children}</p>
    </div>
  );
}

export default function AuthLayout() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <Link to="/" className="self-start rounded-md">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[380px]">
            <Outlet />
          </div>
        </div>
        <p className="text-[12px] text-ink-4">© {new Date().getFullYear()} ResumeAI</p>
      </div>

      <div className="relative hidden overflow-hidden bg-rail lg:block">
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="max-w-[440px]">
            <p className="font-display text-[34px] leading-[1.12] text-rail-ink">
              Recruiters skim. Software filters.
              <span className="text-rail-ink-2"> Your resume has to work for both.</span>
            </p>
          </div>

          <div className="relative mx-auto mt-10 w-[430px]">
            <ResumeSheet width={430} className="rotate-0" />
            <MarginNote tone="good" label="Strong bullet" className="top-[166px] -right-[112px]">
              Result and a number up front. Keep it.
            </MarginNote>
            <MarginNote tone="warn" label="Missing keyword" className="top-[352px] -left-[112px]">
              The job asks for <span className="font-semibold">Kubernetes</span>. Add it if you've used it.
            </MarginNote>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-rail to-transparent" />
      </div>
    </div>
  );
}
