import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export function RouteError() {
  const error = useRouteError();
  const chunkFailed = error instanceof Error && /dynamically imported module|Loading chunk/i.test(error.message);
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  const title = notFound
    ? "Page not found"
    : chunkFailed
      ? "A new version is available"
      : "Something broke on this page";
  const body = notFound
    ? "The link may be old, or the page was moved."
    : chunkFailed
      ? "Reload to get the latest version of the app."
      : "Your work is saved. Reload the page, and if it keeps happening, go back to your dashboard.";

  if (!notFound && !chunkFailed) console.error(error);

  return (
    <div className="message-page">
      <Logo />
      <h1 className="message-title">{title}</h1>
      <p className="message-text">{body}</p>
      <div className="message-actions">
        <Button onClick={() => window.location.reload()}>Reload</Button>
        <Button variant="primary" asChild>
          <Link to="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
