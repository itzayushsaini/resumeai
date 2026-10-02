import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/auth-client";
import { PasswordInput } from "@/features/auth/password-input";
import { SocialButtons } from "@/features/auth/social-buttons";

type Errors = Partial<Record<"name" | "email" | "password" | "form", string>>;

export default function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    return next;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setPending(true);
    const { error } = await signUp.email({ name: name.trim(), email: email.trim(), password });
    setPending(false);
    if (error) {
      const message = error.message ?? "Couldn't create your account.";
      setErrors(/exist/i.test(message) ? { email: "An account with this email already exists." } : { form: message });
      return;
    }
    navigate("/onboarding", { replace: true });
  }

  return (
    <div className="animate-slide-up">
      <h1 className="font-display text-[36px] leading-[1.08] tracking-[-0.01em]">Create your account</h1>
      <p className="mt-2 text-[14.5px] text-ink-2">Set up takes about a minute. Your first resume comes right after.</p>

      <div className="mt-8">
        <SocialButtons next="/dashboard" />
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field label="Full name" error={errors.name}>
          {(props) => (
            <Input {...props} className="h-10" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          )}
        </Field>
        <Field label="Email" error={errors.email}>
          {(props) => (
            <Input
              {...props}
              className="h-10"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Field>
        <Field label="Password" hint="At least 8 characters." error={errors.password}>
          {(props) => (
            <PasswordInput {...props} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          )}
        </Field>

        {errors.form ? <p className="rounded-md bg-bad-soft px-3 py-2 text-[13px] text-bad">{errors.form}</p> : null}

        <Button type="submit" variant="primary" size="lg" loading={pending} className="mt-1 w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-[13.5px] text-ink-2">
        Already have an account?{" "}
        <Link to="/sign-in" className="font-medium text-brand-text hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
