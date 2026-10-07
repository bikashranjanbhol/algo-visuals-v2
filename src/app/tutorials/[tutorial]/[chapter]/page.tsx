import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/docs/breadcrumbs";
import { DocsPage } from "@/components/docs/docs-page";
import { DocsSkeleton } from "@/components/docs/docs-skeleton";
import { TutorialProgress } from "@/components/docs/progress";
import { TopicList } from "@/components/docs/topic-list";
import { getChapter, getTutorials } from "@/lib/content";
import { accentStyles, cn, formatMinutes } from "@/lib/utils";

export function generateStaticParams() {
  return getTutorials().flatMap((t) => t.chapters.map((c) => ({ tutorial: t.slug, chapter: c.slug })));
}

export async function generateMetadata({ params }: PageProps<"/tutorials/[tutorial]/[chapter]">): Promise<Metadata> {
  const { tutorial, chapter } = await params;
  const found = getChapter(tutorial, chapter);
  if (!found) return {};
  return {
    title: `${found.chapter.title} · ${found.tutorial.title}`,
    description: found.chapter.description ?? found.tutorial.description,
    alternates: { canonical: found.chapter.href },
  };
}

export default function ChapterPage({ params }: PageProps<"/tutorials/[tutorial]/[chapter]">) {
  return (
    <Suspense fallback={<DocsSkeleton />}>
      <Chapter params={params} />
    </Suspense>
  );
}

async function Chapter({ params }: Pick<PageProps<"/tutorials/[tutorial]/[chapter]">, "params">) {
  const { tutorial: tutorialSlug, chapter: chapterSlug } = await params;
  const found = getChapter(tutorialSlug, chapterSlug);
  if (!found) notFound();

  const { tutorial, chapter } = found;
  const chapterIndex = tutorial.chapters.findIndex((c) => c.slug === chapter.slug);
  const prev = tutorial.chapters[chapterIndex - 1];
  const next = tutorial.chapters[chapterIndex + 1];
  const startIndex = tutorial.chapters.slice(0, chapterIndex).reduce((n, c) => n + c.topics.length, 0);
  const minutes = chapter.topics.reduce((n, t) => n + t.readingMinutes, 0);

  return (
    <DocsPage
      headings={chapter.topics.map((t) => ({ id: t.slug, text: t.title, depth: 2 as const }))}
      tocTitle="Topics"
    >
      <Breadcrumbs items={[{ title: tutorial.title, href: tutorial.href }, { title: chapter.title }]} />
      <header className="mb-8">
        <p className={cn("text-sm font-semibold", accentStyles[tutorial.accent].text)}>
          Chapter {chapterIndex + 1} of {tutorial.chapters.length}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{chapter.title}</h1>
        {chapter.description && <p className="mt-3 text-lg text-muted-foreground">{chapter.description}</p>}
        <p className="mt-3 text-sm text-muted-foreground">
          {chapter.topics.length} topics · {formatMinutes(minutes)}
        </p>
        <div className="mt-6 max-w-md">
          <TutorialProgress topics={chapter.topics.map(({ id, href, title }) => ({ id, href, title }))} />
        </div>
      </header>

      <TopicList topics={chapter.topics} startIndex={startIndex} />

      <nav aria-label="Chapters" className="mt-10 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link href={prev.href} className="group rounded-2xl border border-border p-4 hover:border-brand/40">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowLeft className="size-3.5" /> Previous chapter
            </span>
            <span className="mt-1 block font-semibold group-hover:text-brand">{prev.title}</span>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next && (
          <Link href={next.href} className="group rounded-2xl border border-border p-4 text-right hover:border-brand/40">
            <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
              Next chapter <ArrowRight className="size-3.5" />
            </span>
            <span className="mt-1 block font-semibold group-hover:text-brand">{next.title}</span>
          </Link>
        )}
      </nav>
    </DocsPage>
  );
}
