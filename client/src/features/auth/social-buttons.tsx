import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/misc";

export interface AppConfig {
  socialProviders: string[];
  aiEnabled: boolean;
}

export function useAppConfig() {
  return useQuery({
    queryKey: ["config"],
    queryFn: () => api<AppConfig>("/config"),
    staleTime: Infinity,
  });
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.58-5.15 3.58-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.92l-3.86-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.28v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28v-3.1H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l3.99-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.43-3.43A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.28 6.62l3.99 3.1C6.22 6.88 8.87 4.77 12 4.77Z" />
    </svg>
  );
}

function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <path
        fill="#fff"
        d="M7.1 9.5H4.6v9.4h2.5V9.5ZM5.85 5.1a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9ZM19.4 13.4c0-2.5-1.33-3.9-3.4-3.9-1.25 0-2.06.6-2.45 1.25V9.5h-2.4v9.4h2.5v-4.9c0-1.25.5-2.15 1.6-2.15 1.03 0 1.6.72 1.6 2.15v4.9h2.55v-5.5Z"
      />
    </svg>
  );
}

const PROVIDERS = {
  google: { label: "Continue with Google", mark: GoogleMark },
  linkedin: { label: "Continue with LinkedIn", mark: LinkedInMark },
} as const;

export function SocialButtons({ next }: { next: string }) {
  const { data } = useAppConfig();
  const [pending, setPending] = useState<string | null>(null);
  const providers = (data?.socialProviders ?? []).filter((p): p is keyof typeof PROVIDERS => p in PROVIDERS);
  if (!providers.length) return null;

  return (
    <div className="flex flex-col gap-2.5">
      {providers.map((provider) => {
        const { label, mark: Mark } = PROVIDERS[provider];
        return (
          <Button
            key={provider}
            size="lg"
            className="w-full text-[14px]"
            loading={pending === provider}
            onClick={async () => {
              setPending(provider);
              const { error } = await signIn.social({
                provider,
                callbackURL: `${window.location.origin}${next}`,
                newUserCallbackURL: `${window.location.origin}/onboarding`,
              });
              if (error) {
                toast.error(error.message ?? "Couldn't start sign-in.");
                setPending(null);
              }
            }}
          >
            <Mark />
            {label}
          </Button>
        );
      })}
      <Divider label="or" className="my-2" />
    </div>
  );
}
