import "./settings.css";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogBody, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/misc";
import { authClient, useSession } from "@/lib/auth-client";
import { useTheme } from "@/lib/theme";
import { EXPERIENCE_LEVELS } from "@/features/profile/options";
import { PasswordInput } from "@/features/auth/password-input";

function Section({ title, description, children }) {
  return (
    <section className="settings-section">
      <div>
        <h2 className="settings-section-title">{title}</h2>
        <p className="settings-section-desc">{description}</p>
      </div>
      <div style={{ minWidth: 0 }}>{children}</div>
    </section>
  );
}

function useHasPassword() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data } = await authClient.listAccounts();
      return (data ?? []).some((account) => account.providerId === "credential");
    },
  });
}

function ProfileForm() {
  const { data } = useSession();
  const user = data.user;
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.targetRole ?? "");
  const [level, setLevel] = useState(user.experienceLevel ?? "");
  const [pending, setPending] = useState(false);
  const changed = name !== user.name || role !== (user.targetRole ?? "") || level !== (user.experienceLevel ?? "");

  async function onSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return toast.error("Your name can't be empty.");
    setPending(true);
    const { error } = await authClient.updateUser({
      name: name.trim(),
      targetRole: role.trim(),
      experienceLevel: level,
    });
    setPending(false);
    if (error) return toast.error(error.message ?? "Couldn't save your profile.");
    toast.success("Profile saved");
  }

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <Field label="Full name" className="span-2">
            {(props) => <Input {...props} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}
          </Field>
          <Field label="Target role" hint="Checks and suggestions are tuned to this.">
            {(props) => (
              <Input
                {...props}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Data Analyst"
              />
            )}
          </Field>
          <Field label="Experience">
            {(props) => (
              <NativeSelect {...props} value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="">Not set</option>
                {EXPERIENCE_LEVELS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect>
            )}
          </Field>
        </div>
        <div className="card-footer">
          <span className="settings-email">{user.email}</span>
          <Button type="submit" variant="primary" size="sm" loading={pending} disabled={!changed}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function Swatch({ dark }) {
  return (
    <div className={dark ? "swatch is-dark" : "swatch"}>
      <div className="swatch-rail" />
      <div className="swatch-body">
        <div className="swatch-line" />
        <div className="swatch-card" />
      </div>
    </div>
  );
}

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Match system" },
];

function AppearancePicker() {
  const { preference, setPreference } = useTheme();
  return (
    <div className="theme-options" role="radiogroup" aria-label="Theme">
      {THEME_OPTIONS.map((option) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={preference === option.value}
          onClick={() => setPreference(option.value)}
          className="theme-option"
        >
          {option.value === "system" ? (
            <div className="swatch-split">
              <Swatch />
              <Swatch dark />
            </div>
          ) : (
            <Swatch dark={option.value === "dark"} />
          )}
          <div className="theme-option-label">{option.label}</div>
        </button>
      ))}
    </div>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (next.length < 8) return toast.error("Use at least 8 characters for the new password.");
    setPending(true);
    const { error } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true,
    });
    setPending(false);
    if (error) {
      return toast.error(
        /invalid/i.test(error.message ?? "")
          ? "Your current password isn't right."
          : (error.message ?? "Couldn't change your password."),
      );
    }
    setCurrent("");
    setNext("");
    toast.success("Password updated. Other devices were signed out.");
  }

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <Field label="Current password">
            {(props) => (
              <PasswordInput
                {...props}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                autoComplete="current-password"
              />
            )}
          </Field>
          <Field label="New password" hint="At least 8 characters.">
            {(props) => (
              <PasswordInput
                {...props}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
              />
            )}
          </Field>
        </div>
        <div className="card-footer" style={{ justifyContent: "flex-end" }}>
          <Button type="submit" size="sm" loading={pending} disabled={!current || !next}>
            Update password
          </Button>
        </div>
      </form>
    </Card>
  );
}

function DeleteAccount({ hasPassword }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function confirm() {
    setPending(true);
    const { error } = await authClient.deleteUser(hasPassword ? { password } : {});
    setPending(false);
    if (error) return toast.error(error.message ?? "Couldn't delete your account.");
    queryClient.clear();
    navigate("/", { replace: true });
    toast.success("Your account and resumes were deleted.");
  }

  return (
    <>
      <Card className="danger-card">
        <div>
          <div className="danger-title">Delete account</div>
          <div className="danger-text">Removes your account and every resume. This can't be undone.</div>
        </div>
        <Button variant="danger-ghost" size="sm" onClick={() => setOpen(true)}>
          Delete account
        </Button>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          title="Delete your account?"
          description="Your profile and all your resumes will be permanently deleted. Downloaded PDFs on your computer aren't affected."
        >
          {hasPassword ? (
            <DialogBody>
              <Field label="Enter your password to confirm">
                {(props) => (
                  <PasswordInput
                    {...props}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                )}
              </Field>
            </DialogBody>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="danger" loading={pending} disabled={hasPassword && !password} onClick={confirm}>
              Delete everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function SettingsPage() {
  const { data: hasPassword } = useHasPassword();
  const [signingOut, setSigningOut] = useState(false);

  return (
    <PageContainer narrow>
      <PageHeader title="Settings" />
      <div className="settings">
        <Section
          title="Profile"
          description="Your name and goal. The target role decides which keywords and skills we check for."
        >
          <ProfileForm />
        </Section>
        <Section title="Appearance" description="Resumes always print on white paper, whichever theme you pick here.">
          <AppearancePicker />
        </Section>
        {hasPassword ? (
          <Section title="Password" description="Changing it signs you out on every other device.">
            <PasswordForm />
          </Section>
        ) : null}
        <Section title="Sessions" description="Signed in on a shared or old computer? Sign out everywhere except here.">
          <Button
            loading={signingOut}
            onClick={async () => {
              setSigningOut(true);
              const { error } = await authClient.revokeOtherSessions();
              setSigningOut(false);
              if (error) toast.error(error.message ?? "Couldn't sign out other sessions.");
              else toast.success("Signed out of all other devices.");
            }}
          >
            Sign out other devices
          </Button>
        </Section>
        <Section title="Danger zone" description="Permanent actions on your account.">
          <DeleteAccount hasPassword={Boolean(hasPassword)} />
        </Section>
      </div>
    </PageContainer>
  );
}
