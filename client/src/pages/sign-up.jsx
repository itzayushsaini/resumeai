import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/auth-client";
import { PasswordInput } from "@/features/auth/password-input";
import { SocialButtons } from "@/features/auth/social-buttons";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);

  function validate() {
    const next = {};
    if (!name.trim()) next.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    return next;
  }

  async function onSubmit(event) {
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
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-subtitle">Set up takes about a minute. Your first resume comes right after.</p>

      <SocialButtons next="/dashboard" />

      <form onSubmit={onSubmit} noValidate className="auth-fields">
        <Field label="Full name" error={errors.name}>
          {(props) => (
            <Input
              {...props}
              size="lg"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          )}
        </Field>
        <Field label="Email" error={errors.email}>
          {(props) => (
            <Input
              {...props}
              size="lg"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Field>
        <Field label="Password" hint="At least 8 characters." error={errors.password}>
          {(props) => (
            <PasswordInput
              {...props}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </Field>

        {errors.form ? <p className="form-error">{errors.form}</p> : null}

        <Button type="submit" variant="primary" size="lg" block loading={pending}>
          Create account
        </Button>
      </form>

      <p className="auth-switch">
        Already have an account?{" "}
        <Link to="/sign-in" className="link">
          Sign in
        </Link>
      </p>
    </div>
  );
}
