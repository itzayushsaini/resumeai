import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function NotFoundPage() {
  return (
    <div className="message-page">
      <Link to="/">
        <Logo />
      </Link>
      <p className="message-code">404</p>
      <h1 className="message-title">This page isn't here</h1>
      <p className="message-text">The link may be old, or the page was moved.</p>
      <div className="message-actions">
        <Button variant="primary" asChild>
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
