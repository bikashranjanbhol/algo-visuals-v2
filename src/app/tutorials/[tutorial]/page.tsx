import { BookOpen, Clock, Layers, Signal } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/docs/breadcrumbs";
import { DocsPage } from "@/components/docs/docs-page";
import { TutorialProgress } from "@/components/docs/progress";
import { TopicList } from "@/components/docs/topic-list";
import { TutorialIcon } from "@/components/icons";
import { SaveOfflineButton } from "@/components/pwa/save-offline-button";
import { getTutorial, getTutorials } from "@/lib/content";
import { accentStyles, cn, formatMinutes } from "@/lib/utils";

// Each page is prerendered for every known slug, so reading params directly
// keeps the article in the static HTML. A <Suspense> boundary around it would
// make React stream the content after a skeleton. Prev/next links prefetch the
// full page from the static cache, so navigation still feels instant.
export const instant = false;

export function generateStaticParams() {
  return getTutorials().map((t) => ({ tutorial: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tutorials/[tutorial]">): Promise<Metadata> {
  const tutorial = getTutorial((await params).tutorial);
  if (!tutorial) return {};
  return {
    title: tutorial.title,
    description: tutorial.description,
    alternates: { canonical: tutorial.href },
  };
}

export default async function TutorialPage({ params }: PageProps<"/tutorials/[tutorial]">) {
  const tutorial = getTutorial((await params).tutorial);
  if (!tutorial) notFound();

  const accent = accentStyles[tutorial.accent];
  const topics = tutorial.chapters.flatMap((c) => c.topics);
  const offlineUrls = [tutorial.href, ...tutorial.chapters.map((c) => c.href), ...topics.map((t) => t.href)];
  const chapterStarts = tutorial.chapters.map((_, i) =>
    tutorial.chapters.slice(0, i).reduce((n, c) => n + c.topics.length, 0),
  );

  return (
    <DocsPage
      headings={tutorial.chapters.map((c) => ({ id: c.slug, text: c.title, depth: 2 as const }))}
      tocTitle="Chapters"
    >
      <Breadcrumbs items={[{ title: tutorial.title }]} />

      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className={cn("pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-gradient-to-br opacity-20 blur-3xl", accent.gradient)} />
        <div className="relative">
          <span className={cn("grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg", accent.gradient)}>
            <TutorialIcon name={tutorial.icon} className="size-7" />
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{tutorial.title}</h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">{tutorial.description}</p>
          <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            {[
              { icon: Signal, label: "Level", value: tutorial.level },
              { icon: Layers, label: "Chapters", value: tutorial.chapters.length },
              { icon: BookOpen, label: "Topics", value: tutorial.topicCount },
              { icon: Clock, label: "Reading time", value: formatMinutes(tutorial.readingMinutes) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className={cn("size-4", accent.text)} />
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full max-w-md">
              <TutorialProgress topics={topics.map(({ id, href, title }) => ({ id, href, title }))} />
            </div>
            <SaveOfflineButton urls={offlineUrls} />
          </div>
        </div>
      </section>

      <div className="mt-12 space-y-12">
        {tutorial.chapters.map((chapter, chapterIndex) => {
          return (
            <section key={chapter.slug} aria-labelledby={chapter.slug}>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className={cn("text-xs font-semibold uppercase tracking-wider", accent.text)}>Chapter {chapterIndex + 1}</p>
                  <h2 id={chapter.slug} className="mt-1 scroll-mt-28 text-2xl font-bold tracking-tight">
                    <Link href={chapter.href} className="hover:text-brand">
                      {chapter.title}
                    </Link>
                  </h2>
                  {chapter.description && <p className="mt-1.5 text-muted-foreground">{chapter.description}</p>}
                </div>
              </div>
              <TopicList topics={chapter.topics} startIndex={chapterStarts[chapterIndex]} />
            </section>
          );
        })}
      </div>
    </DocsPage>
  );
}
