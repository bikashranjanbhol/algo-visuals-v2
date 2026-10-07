import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { auth } from "@/auth";
import { DashboardView } from "@/components/dashboard-view";
import { getNavTree } from "@/lib/content";

export const metadata: Metadata = {
  title: "My dashboard",
  description: "Your learning progress across every AlgoVisuals tutorial.",
  robots: { index: false },
};

export default function DashboardPage() {
  return (
    <main className="container-page py-12 sm:py-16">
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </main>
  );
}

/** Reads the session at request time, so it streams in behind the Suspense boundary. */
async function Dashboard() {
  // Session checks use the request (and randomness), so opt out of prerendering here.
  await connection();
  let session = null;
  try {
    session = await auth();
  } catch {
    // Auth is not configured (e.g. AUTH_SECRET missing); treat as signed out.
  }
  if (!session?.user) redirect("/signin?callbackUrl=/dashboard");

  const { name, email, image } = session.user;
  return <DashboardView user={{ name, email, image }} tutorials={getNavTree()} />;
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-label="Loading dashboard">
      <div className="flex items-center gap-5">
        <div className="size-16 rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-28 rounded bg-muted" />
          <div className="h-8 w-64 rounded bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-72 rounded-2xl bg-muted" />
    </div>
  );
}
