import { WifiOff } from "lucide-react";
import type { Metadata } from "next";
import { RetryButton } from "@/components/pwa/retry-button";
import { SavedPages } from "@/components/pwa/saved-pages";
import { getTutorials } from "@/lib/content";

export const metadata: Metadata = {
  title: "Offline",
  description: "You're offline. Here are the pages saved on this device.",
  robots: { index: false },
};

export default function OfflinePage() {
  const titles: Record<string, string> = {
    "/": "Home",
    "/tutorials": "All tutorials",
    "/visualizer": "Visualizer",
    "/about": "About",
  };
  for (const tutorial of getTutorials()) {
    titles[tutorial.href] = tutorial.title;
    for (const chapter of tutorial.chapters) {
      titles[chapter.href] = `${tutorial.title} › ${chapter.title}`;
      for (const topic of chapter.topics) titles[topic.href] = topic.title;
    }
  }

  return (
    <main className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <span className="grid size-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-500">
          <WifiOff className="size-7" />
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">You&apos;re offline</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          This page hasn&apos;t been saved to your device yet. Reconnect to keep browsing, or open one of the pages
          below that are available offline.
        </p>
        <div className="mt-6">
          <RetryButton />
        </div>
        <h2 className="mt-10 mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Saved on this device</h2>
        <SavedPages titles={titles} />
      </div>
    </main>
  );
}
