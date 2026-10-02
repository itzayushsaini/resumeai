import { useState, type FormEvent } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
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
      setError(error.status === 401 || /invalid/i.test(error.message ?? "") ? "That email and password don't match." : (error.message ?? "Couldn't sign you in."));
      return;
    }
    navigate(next, { replace: true });
  }

  return (
    <div className="animate-slide-up">
      <h1 className="font-display text-[36px] leading-[1.08] tracking-[-0.01em]">Welcome back</h1>
      <p className="mt-2 text-[14.5px] text-ink-2">Sign in to pick up where you left off.</p>

      <div className="mt-8">
        <SocialButtons next={next} />
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field label="Email">
          {(props) => (
            <Input
              {...props}
              className="h-10"
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
            <PasswordInput {...props} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          )}
        </Field>

        {error ? <p className="rounded-md bg-bad-soft px-3 py-2 text-[13px] text-bad">{error}</p> : null}

        <Button type="submit" variant="primary" size="lg" loading={pending} className="mt-1 w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-[13.5px] text-ink-2">
        New here?{" "}
        <Link to="/sign-up" className="font-medium text-brand-text hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
