import { TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { authProviders, isAuthConfigured } from "@/auth";
import { SignInForm } from "@/components/auth/sign-in-form";
import { LogoMark } from "@/components/icons";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to ${siteConfig.name} to access your learning dashboard.`,
  robots: { index: false },
};

export default function SignInPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-border bg-card/90 p-7 shadow-2xl shadow-brand/5 backdrop-blur sm:p-9">
          <div className="mb-7 text-center">
            <LogoMark className="mx-auto size-12" />
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Welcome to {siteConfig.name}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Sign in to open your dashboard and keep learning.</p>
          </div>
          {isAuthConfigured ? (
            <Suspense fallback={<div className="h-56 animate-pulse rounded-2xl bg-muted" />}>
              <SignInForm providers={authProviders} />
            </Suspense>
          ) : (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
              <p className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300">
                <TriangleAlert className="size-4" /> Sign-in isn&apos;t configured yet
              </p>
              <p className="mt-2 text-muted-foreground">
                Add an <code className="font-mono text-foreground">AUTH_SECRET</code> environment variable in your
                Vercel project settings and redeploy. See the README for optional GitHub and Google sign-in.
              </p>
            </div>
          )}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          You can read every tutorial without an account.{" "}
          <Link href="/tutorials" className="font-medium text-brand hover:underline">
            Browse tutorials
          </Link>
        </p>
      </div>
    </main>
  );
}
