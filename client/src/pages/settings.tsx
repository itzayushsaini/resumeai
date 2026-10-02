import { useState, type FormEvent, type ReactNode } from "react";
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
import { useTheme, type ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { EXPERIENCE_LEVELS } from "@/features/profile/options";
import { PasswordInput } from "@/features/auth/password-input";

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="grid gap-5 border-t border-line py-8 first:border-t-0 first:pt-0 md:grid-cols-[240px_minmax(0,1fr)] md:gap-10">
      <div>
        <h2 className="text-[14.5px] font-semibold">{title}</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
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
  const user = data!.user;
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.targetRole ?? "");
  const [level, setLevel] = useState(user.experienceLevel ?? "");
  const [pending, setPending] = useState(false);
  const changed = name !== user.name || role !== (user.targetRole ?? "") || level !== (user.experienceLevel ?? "");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return toast.error("Your name can't be empty.");
    setPending(true);
    const { error } = await authClient.updateUser({ name: name.trim(), targetRole: role.trim(), experienceLevel: level });
    setPending(false);
    if (error) return toast.error(error.message ?? "Couldn't save your profile.");
    toast.success("Profile saved");
  }

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Full name" className="sm:col-span-2">
            {(props) => <Input {...props} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}
          </Field>
          <Field label="Target role" hint="Checks and suggestions are tuned to this.">
            {(props) => <Input {...props} value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Data Analyst" />}
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
        <div className="flex items-center justify-between border-t border-line px-5 py-3">
          <span className="text-[12.5px] text-ink-3">{data!.user.email}</span>
          <Button type="submit" variant="primary" size="sm" loading={pending} disabled={!changed}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ThemeSwatch({ mode }: { mode: "light" | "dark" }) {
  const dark = mode === "dark";
  return (
    <div className={cn("flex h-[72px] overflow-hidden rounded-md border", dark ? "border-[#2a3040] bg-[#0d1016]" : "border-[#e2dfd7] bg-[#f5f4f0]")}>
      <div className={cn("w-7", dark ? "bg-[#090c11]" : "bg-[#10141e]")} />
      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <div className={cn("h-2 w-12 rounded-sm", dark ? "bg-[#eceef3]/70" : "bg-[#15171c]/70")} />
        <div className={cn("flex-1 rounded-[3px] border", dark ? "border-[#242a36] bg-[#141821]" : "border-[#e5e2da] bg-white")} />
      </div>
    </div>
  );
}

function AppearancePicker() {
  const { preference, setPreference } = useTheme();
  const options: { value: ThemePreference; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "Match system" },
  ];
  return (
    <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Theme">
      {options.map((option) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={preference === option.value}
          onClick={() => setPreference(option.value)}
          className={cn(
            "rounded-lg border bg-surface p-2 text-left transition-[border-color,box-shadow]",
            preference === option.value
              ? "border-brand shadow-[0_0_0_3px_color-mix(in_oklab,var(--brand)_14%,transparent)]"
              : "border-line hover:border-line-strong",
          )}
        >
          {option.value === "system" ? (
            <div className="grid grid-cols-2 overflow-hidden rounded-md">
              <div className="[&>div]:rounded-r-none [&>div]:border-r-0">
                <ThemeSwatch mode="light" />
              </div>
              <div className="[&>div]:rounded-l-none [&>div]:border-l-0">
                <ThemeSwatch mode="dark" />
              </div>
            </div>
          ) : (
            <ThemeSwatch mode={option.value} />
          )}
          <div className="px-1 pt-2 pb-0.5 text-[13px] font-medium">{option.label}</div>
        </button>
      ))}
    </div>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (next.length < 8) return toast.error("Use at least 8 characters for the new password.");
    setPending(true);
    const { error } = await authClient.changePassword({ currentPassword: current, newPassword: next, revokeOtherSessions: true });
    setPending(false);
    if (error) return toast.error(/invalid/i.test(error.message ?? "") ? "Your current password isn't right." : (error.message ?? "Couldn't change your password."));
    setCurrent("");
    setNext("");
    toast.success("Password updated. Other devices were signed out.");
  }

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Current password">
            {(props) => <PasswordInput {...props} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />}
          </Field>
          <Field label="New password" hint="At least 8 characters.">
            {(props) => <PasswordInput {...props} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />}
          </Field>
        </div>
        <div className="flex justify-end border-t border-line px-5 py-3">
          <Button type="submit" size="sm" loading={pending} disabled={!current || !next}>
            Update password
          </Button>
        </div>
      </form>
    </Card>
  );
}

function DeleteAccount({ hasPassword }: { hasPassword: boolean }) {
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
      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <div className="text-[14px] font-medium">Delete account</div>
          <div className="text-[13px] text-ink-3">Removes your account and every resume. This can't be undone.</div>
        </div>
        <Button variant="danger-ghost" size="sm" onClick={() => setOpen(true)} className="border border-bad/30">
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
                {(props) => <PasswordInput {...props} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />}
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
    <PageContainer className="max-w-[960px]">
      <PageHeader title="Settings" />
      <div className="mt-10">
        <Section title="Profile" description="Your name and goal. The target role decides which keywords and skills we check for.">
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
