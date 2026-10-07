import type { Metadata } from "next";
import { TutorialCard } from "@/components/tutorial-card";
import { getTutorials } from "@/lib/content";
import { formatMinutes } from "@/lib/utils";

export const metadata: Metadata = {
  title: "All tutorials",
  description: "Browse every AlgoVisuals tutorial: algorithms, data structures, graph algorithms and dynamic programming.",
  alternates: { canonical: "/tutorials" },
};

export default function TutorialsPage() {
  const tutorials = getTutorials();
  const topics = tutorials.reduce((n, t) => n + t.topicCount, 0);
  const minutes = tutorials.reduce((n, t) => n + t.readingMinutes, 0);

  return (
    <main className="container-page py-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold text-brand">Tutorials</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Everything you can learn here</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {tutorials.length} tutorials, {topics} topics and about {formatMinutes(minutes)} of reading. Follow them in
          order or jump to whatever you need today.
        </p>
      </header>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {tutorials.map((tutorial) => (
          <TutorialCard key={tutorial.slug} tutorial={tutorial} detailed />
        ))}
      </div>
    </main>
  );
}
