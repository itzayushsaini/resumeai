import { Navigate, Outlet, useLocation, useSearchParams } from "react-router";
import { useSession } from "@/lib/auth-client";
import { LogoMark } from "@/components/brand/logo";
import { Spinner } from "@/components/ui/spinner";

export function FullPageLoader() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="flex items-center gap-2.5 text-ink-3">
        <LogoMark className="size-5 opacity-80" />
        <Spinner className="size-4" />
      </div>
    </div>
  );
}

/** Only renders child routes for signed-in users who finished onboarding. */
export function RequireAuth({ allowUnonboarded = false }: { allowUnonboarded?: boolean }) {
  const { data, isPending } = useSession();
  const location = useLocation();

  if (isPending) return <FullPageLoader />;
  if (!data) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/sign-in?next=${next}`} replace />;
  }
  if (!allowUnonboarded && !data.user.onboarded) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

/** Keeps signed-in users away from the sign-in and sign-up pages. */
export function RedirectIfAuthed() {
  const { data, isPending } = useSession();
  const [params] = useSearchParams();
  if (isPending) return <FullPageLoader />;
  if (data) return <Navigate to={safeNext(params.get("next"))} replace />;
  return <Outlet />;
}

/** Only allow in-app redirects. */
export function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}
