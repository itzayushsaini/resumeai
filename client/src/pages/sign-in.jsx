import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";
import { PasswordInput } from "@/features/auth/password-input";
import { SocialButtons } from "@/features/auth/social-buttons";
import { safeNext } from "@/components/app/guards";

export default function SignInPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setPending(true);
    setError(null);
    const { error } = await signIn.email({ email: email.trim(), password });
    setPending(false);
    if (error) {
      const wrong = error.status === 401 || /invalid/i.test(error.message ?? "");
      setError(wrong ? "That email and password don't match." : (error.message ?? "Couldn't sign you in."));
      return;
    }
    navigate(next, { replace: true });
  }

  return (
    <div className="animate-slide-up">
      <h1 className="auth-title">Welcome back</h1>
      <p className="auth-subtitle">Sign in to pick up where you left off.</p>

      <SocialButtons next={next} />

      <form onSubmit={onSubmit} noValidate className="auth-fields">
        <Field label="Email">
          {(props) => (
            <Input
              {...props}
              size="lg"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          )}
        </Field>
        <Field label="Password">
          {(props) => (
            <PasswordInput
              {...props}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </Field>

        {error ? <p className="form-error">{error}</p> : null}

        <Button type="submit" variant="primary" size="lg" block loading={pending}>
          Sign in
        </Button>
      </form>

      <p className="auth-switch">
        New here?{" "}
        <Link to="/sign-up" className="link">
          Create an account
        </Link>
      </p>
    </div>
  );
}
