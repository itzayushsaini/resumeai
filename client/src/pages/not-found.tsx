import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Link to="/" className="mb-10">
        <Logo />
      </Link>
      <p className="text-[13px] font-medium text-ink-3 tabular">404</p>
      <h1 className="mt-1 font-display text-[38px] leading-tight">This page isn't here</h1>
      <p className="mt-2 max-w-sm text-ink-2">The link may be old, or the page was moved.</p>
      <Button variant="primary" className="mt-6" asChild>
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
