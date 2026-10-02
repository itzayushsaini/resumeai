import "./auth-layout.css";
import { Link, Outlet } from "react-router";
import { Logo } from "@/components/brand/logo";
import { ResumeSheet } from "@/features/resume/showcase";

function MarginNote({ tone, label, children, style }) {
  return (
    <div className={`margin-note is-${tone}`} style={style}>
      <div className="margin-note-label">{label}</div>
      <p>{children}</p>
    </div>
  );
}

export default function AuthLayout() {
  return (
    <div className="auth">
      <div className="auth-form-side">
        <Link to="/">
          <Logo />
        </Link>
        <div className="auth-center">
          <div className="auth-box">
            <Outlet />
          </div>
        </div>
        <p className="auth-copyright">© {new Date().getFullYear()} ResumeAI</p>
      </div>

      <div className="auth-visual">
        <div className="auth-visual-inner">
          <p className="auth-quote">
            Recruiters skim. Software filters.
            <span> Your resume has to work for both.</span>
          </p>
          <div className="auth-sheet">
            <ResumeSheet width={430} />
            <MarginNote tone="good" label="Strong bullet" style={{ top: 166, right: -112 }}>
              Result and a number up front. Keep it.
            </MarginNote>
            <MarginNote tone="warn" label="Missing keyword" style={{ top: 352, left: -112 }}>
              The job asks for <strong>Kubernetes</strong>. Add it if you've used it.
            </MarginNote>
          </div>
        </div>
        <div className="auth-fade" />
      </div>
    </div>
  );
}
