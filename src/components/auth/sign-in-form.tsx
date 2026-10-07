"use client";

import { ArrowRight, LoaderCircle, LogOut, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { GitHubIcon, GoogleIcon } from "@/components/icons";
import { Avatar } from "./user-menu";

type ProviderInfo = { id: string; name: string; type: string };

const errorMessages: Record<string, string> = {
  CredentialsSignin: "Please enter your name and a valid email address.",
  OAuthAccountNotLinked: "That email is already linked to a different sign-in method.",
  AccessDenied: "Access was denied.",
  Configuration: "Sign-in is not configured correctly on the server.",
};

/** Only allow redirects back into this site. */
function safeCallback(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export function SignInForm({ providers }: { providers: ProviderInfo[] }) {
  const params = useSearchParams();
  const { data: session, status } = useSession();
  const redirectTo = safeCallback(params.get("callbackUrl"));
  const error = params.get("error");
  const [pending, setPending] = useState<string | null>(null);

  const oauth = providers.filter((p) => p.type === "oauth" || p.type === "oidc");
  const demo = providers.find((p) => p.id === "demo");

  if (status === "authenticated" && session?.user) {
    return (
      <div className="text-center">
        <Avatar name={session.user.name} image={session.user.image} className="mx-auto size-16 text-lg" />
        <p className="mt-4 font-semibold">You&apos;re signed in as {session.user.name}</p>
        {session.user.email && <p className="text-sm text-muted-foreground">{session.user.email}</p>}
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href={redirectTo}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand font-semibold text-brand-foreground hover:opacity-90"
          >
            Continue <ArrowRight className="size-4" />
          </Link>
          <button
            type="button"
            onClick={() => signOut({ redirectTo: "/" })}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border font-semibold hover:bg-muted"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  async function onDemo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending("demo");
    await signIn("demo", { name: form.get("name"), email: form.get("email"), redirectTo });
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {errorMessages[error] ?? "Something went wrong. Please try again."}
        </p>
      )}

      {oauth.length > 0 && (
        <div className="grid gap-2.5">
          {oauth.map((provider) => (
            <button
              key={provider.id}
              type="button"
              disabled={pending !== null}
              onClick={() => {
                setPending(provider.id);
                signIn(provider.id, { redirectTo });
              }}
              className="inline-flex h-11 items-center justify-center gap-3 rounded-xl border border-border bg-card font-semibold transition hover:bg-muted disabled:opacity-60"
            >
              {pending === provider.id ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : provider.id === "github" ? (
                <GitHubIcon className="size-5" />
              ) : provider.id === "google" ? (
                <GoogleIcon className="size-5" />
              ) : null}
              Continue with {provider.name}
            </button>
          ))}
        </div>
      )}

      {oauth.length > 0 && demo && (
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or try a demo account <span className="h-px flex-1 bg-border" />
        </div>
      )}

      {demo && (
        <form onSubmit={onDemo} className="grid gap-3">
          <label className="grid gap-1.5 text-sm font-medium">
            Name
            <input
              name="name"
              required
              maxLength={60}
              autoComplete="name"
              placeholder="Ada Lovelace"
              className="h-11 rounded-xl border border-border bg-background px-3.5 font-normal placeholder:text-muted-foreground/70 focus:border-brand/50 focus:outline-none focus:ring-4 focus:ring-brand/15"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Email
            <input
              name="email"
              type="email"
              required
              maxLength={120}
              autoComplete="email"
              placeholder="ada@example.com"
              className="h-11 rounded-xl border border-border bg-background px-3.5 font-normal placeholder:text-muted-foreground/70 focus:border-brand/50 focus:outline-none focus:ring-4 focus:ring-brand/15"
            />
          </label>
          <button
            type="submit"
            disabled={pending !== null}
            className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand font-semibold text-brand-foreground shadow-lg shadow-brand/20 transition hover:opacity-90 disabled:opacity-60"
          >
            {pending === "demo" ? <LoaderCircle className="size-5 animate-spin" /> : <Sparkles className="size-4" />}
            {oauth.length > 0 ? "Continue with demo account" : "Sign in"}
          </button>
          <p className="text-center text-xs text-muted-foreground">No password needed. This demo account only lives in a signed cookie.</p>
        </form>
      )}

      {oauth.length === 0 && !demo && (
        <p className="text-center text-sm text-muted-foreground">No sign-in methods are enabled.</p>
      )}
    </div>
  );
}
