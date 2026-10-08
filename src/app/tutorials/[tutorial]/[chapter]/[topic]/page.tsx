import { CalendarDays, Clock, Gauge } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/docs/breadcrumbs";
import { DocsPage } from "@/components/docs/docs-page";
import { Pager } from "@/components/docs/pager";
import { TopicCompleteButton, TutorialProgress } from "@/components/docs/progress";
import { ReadingProgress } from "@/components/docs/toc";
import { MdxContent } from "@/components/mdx/mdx-content";
import { getAllTopics, getTopic, getTopicContent } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { accentStyles, cn, formatDate } from "@/lib/utils";

// Each page is prerendered for every known slug, so reading params directly
// keeps the article in the static HTML. A <Suspense> boundary around it would
// make React stream the content after a skeleton. Prev/next links prefetch the
// full page from the static cache, so navigation still feels instant.
export const instant = false;

export function generateStaticParams() {
  return getAllTopics().map((t) => ({ tutorial: t.tutorialSlug, chapter: t.chapterSlug, topic: t.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/tutorials/[tutorial]/[chapter]/[topic]">): Promise<Metadata> {
  const { tutorial, chapter, topic } = await params;
  const found = getTopic(tutorial, chapter, topic);
  if (!found) return {};
  const title = `${found.topic.title} · ${found.tutorial.title}`;
  return {
    title,
    description: found.topic.description,
    alternates: { canonical: found.topic.href },
    openGraph: { type: "article", title, description: found.topic.description, url: found.topic.href },
  };
}

const difficultyStyles = {
  beginner: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  intermediate: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  advanced: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export default async function TopicPage({ params }: PageProps<"/tutorials/[tutorial]/[chapter]/[topic]">) {
  const { tutorial: tutorialSlug, chapter: chapterSlug, topic: topicSlug } = await params;
  const found = getTopic(tutorialSlug, chapterSlug, topicSlug);
  if (!found) notFound();

  const { tutorial, chapter, topic, prev, next, position, total } = found;
  const { code, headings } = await getTopicContent(tutorial.slug, chapter.slug, topic.slug);
  const allTopics = tutorial.chapters.flatMap((c) => c.topics.map(({ id, href, title }) => ({ id, href, title })));
  const accent = accentStyles[tutorial.accent];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: topic.title,
    description: topic.description,
    dateModified: topic.updated,
    proficiencyLevel: topic.difficulty,
    isPartOf: { "@type": "Course", name: tutorial.title, url: `${siteConfig.url}${tutorial.href}` },
    url: `${siteConfig.url}${topic.href}`,
  };

  return (
    <>
      <ReadingProgress />
      <DocsPage
        headings={headings}
        editPath={`${tutorial.slug}/${chapter.slug}/${topic.slug}.mdx`}
        aside={
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className={cn("text-xs font-semibold uppercase tracking-wider", accent.text)}>{tutorial.title}</p>
            <p className="mt-1 mb-3 text-xs text-muted-foreground">
              Topic {position} of {total}
            </p>
            <TutorialProgress topics={allTopics} compact />
          </div>
        }
      >
        <Breadcrumbs
          items={[
            { title: tutorial.title, href: tutorial.href },
            { title: chapter.title, href: chapter.href },
            { title: topic.title },
          ]}
        />
        <header className="mb-8">
          <p className={cn("mb-2 text-sm font-semibold", accent.text)}>{chapter.title}</p>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{topic.title}</h1>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground text-pretty">{topic.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", difficultyStyles[topic.difficulty])}>
              <Gauge className="size-3.5" /> {topic.difficulty}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" /> {topic.readingMinutes} min read
            </span>
            {topic.updated && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" /> Updated <time dateTime={topic.updated}>{formatDate(topic.updated)}</time>
              </span>
            )}
          </div>
        </header>

        <div className="prose prose-article max-w-none dark:prose-invert prose-headings:font-semibold prose-h2:text-2xl prose-h3:text-xl">
          <MdxContent code={code} />
        </div>

        <TopicCompleteButton id={topic.id} href={topic.href} title={topic.title} nextHref={next?.href} />
        <Pager prev={prev} next={next} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      </DocsPage>
    </>
  );
}
