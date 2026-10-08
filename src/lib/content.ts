import "server-only";

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { compile } from "@mdx-js/mdx";
import GithubSlugger from "github-slugger";
import matter from "gray-matter";
import type { Root } from "hast";
import { toString } from "hast-util-to-string";
import { cacheLife } from "next/cache";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import type {
  ChapterMeta,
  Difficulty,
  Heading,
  NavTutorial,
  SearchEntry,
  TopicMeta,
  TutorialMeta,
  TutorialSummary,
} from "./content-types";

const CONTENT_DIR = path.join(process.cwd(), "content", "tutorials");
const WORDS_PER_MINUTE = 220;

type RawMeta = Omit<TutorialMeta, "slug" | "href" | "chapters" | "topicCount" | "readingMinutes"> & {
  chapters: { slug: string; title: string; description?: string; topics: string[] }[];
};

function topicFile(tutorial: string, chapter: string, topic: string) {
  return path.join(CONTENT_DIR, tutorial, chapter, `${topic}.mdx`);
}

const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

function readingMinutes(source: string) {
  // Code is skimmed more than read, so it counts for a third of its words.
  const code = (source.match(/```[\s\S]*?```/g) ?? []).join(" ");
  const prose = source.replace(/```[\s\S]*?```/g, " ");
  const words = countWords(prose) + countWords(code) / 3;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function loadTutorials(): TutorialMeta[] {
  if (!existsSync(CONTENT_DIR)) return [];

  const tutorials = readdirSync(CONTENT_DIR)
    .filter((dir) => existsSync(path.join(CONTENT_DIR, dir, "meta.json")))
    .map((slug): TutorialMeta => {
      const raw = JSON.parse(readFileSync(path.join(CONTENT_DIR, slug, "meta.json"), "utf8")) as RawMeta;
      const href = `/tutorials/${slug}`;

      const chapters: ChapterMeta[] = raw.chapters.map((chapter) => ({
        slug: chapter.slug,
        title: chapter.title,
        description: chapter.description,
        href: `${href}/${chapter.slug}`,
        topics: chapter.topics
          .filter((topic) => existsSync(topicFile(slug, chapter.slug, topic)))
          .map((topic): TopicMeta => {
            const { data, content } = matter(readFileSync(topicFile(slug, chapter.slug, topic), "utf8"));
            return {
              id: `${slug}/${chapter.slug}/${topic}`,
              slug: topic,
              title: String(data.title ?? topic),
              description: String(data.description ?? ""),
              difficulty: (data.difficulty as Difficulty) ?? "beginner",
              updated: data.updated
                ? new Date(data.updated).toISOString().slice(0, 10)
                : undefined,
              readingMinutes: readingMinutes(content),
              href: `${href}/${chapter.slug}/${topic}`,
              tutorialSlug: slug,
              chapterSlug: chapter.slug,
            };
          }),
      }));

      const topics = chapters.flatMap((c) => c.topics);
      return {
        slug,
        title: raw.title,
        description: raw.description,
        order: raw.order,
        level: raw.level,
        icon: raw.icon,
        accent: raw.accent,
        href,
        chapters: chapters.filter((c) => c.topics.length > 0),
        topicCount: topics.length,
        readingMinutes: topics.reduce((sum, t) => sum + t.readingMinutes, 0),
      };
    })
    .filter((t) => t.topicCount > 0);

  return tutorials.sort((a, b) => a.order - b.order);
}

// Content only changes between deployments, so in production the tree is read
// once per server instance. In development it is re-read so edits show up.
let cached: TutorialMeta[] | undefined;
export function getTutorials(): TutorialMeta[] {
  if (process.env.NODE_ENV === "development") return loadTutorials();
  cached ??= loadTutorials();
  return cached;
}

export function getTutorial(slug: string) {
  return getTutorials().find((t) => t.slug === slug);
}

export function getChapter(tutorialSlug: string, chapterSlug: string) {
  const tutorial = getTutorial(tutorialSlug);
  const chapter = tutorial?.chapters.find((c) => c.slug === chapterSlug);
  return tutorial && chapter ? { tutorial, chapter } : undefined;
}

export function getTopic(tutorialSlug: string, chapterSlug: string, topicSlug: string) {
  const found = getChapter(tutorialSlug, chapterSlug);
  if (!found) return undefined;
  const { tutorial, chapter } = found;
  const topic = chapter.topics.find((t) => t.slug === topicSlug);
  if (!topic) return undefined;

  const all = tutorial.chapters.flatMap((c) => c.topics);
  const index = all.findIndex((t) => t.id === topic.id);
  return {
    tutorial,
    chapter,
    topic,
    prev: index > 0 ? all[index - 1] : undefined,
    next: index < all.length - 1 ? all[index + 1] : undefined,
    position: index + 1,
    total: all.length,
  };
}

export function getAllTopics(): TopicMeta[] {
  return getTutorials().flatMap((t) => t.chapters.flatMap((c) => c.topics));
}

function toSummary(t: TutorialMeta): TutorialSummary {
  return {
    slug: t.slug,
    title: t.title,
    description: t.description,
    level: t.level,
    href: t.href,
    icon: t.icon,
    accent: t.accent,
    topicCount: t.topicCount,
  };
}

function toNav(t: TutorialMeta): NavTutorial {
  return {
    ...toSummary(t),
    chapters: t.chapters.map((c) => ({
      slug: c.slug,
      title: c.title,
      href: c.href,
      topics: c.topics.map((topic) => ({ id: topic.id, title: topic.title, href: topic.href })),
    })),
  };
}

export function getTutorialSummaries(): TutorialSummary[] {
  return getTutorials().map(toSummary);
}

/** Chapter/topic tree for a single tutorial (the sidebar only shows the one being read). */
export function getNavTutorial(slug: string): NavTutorial | undefined {
  const tutorial = getTutorial(slug);
  return tutorial ? toNav(tutorial) : undefined;
}

/** Every tutorial's tree. Only for pages that summarize progress across all tutorials. */
export function getNavTree(): NavTutorial[] {
  return getTutorials().map(toNav);
}

/** Strips Markdown syntax from a heading line so it slugs like rehype-slug does. */
function plainHeading(text: string) {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export function getSearchIndex(): SearchEntry[] {
  return getTutorials().flatMap((tutorial) =>
    tutorial.chapters.flatMap((chapter) =>
      chapter.topics.map((topic) => {
        const { content } = matter(readFileSync(topicFile(tutorial.slug, chapter.slug, topic.slug), "utf8"));
        const slugger = new GithubSlugger();
        const headings: SearchEntry["headings"] = [];
        let inFence = false;
        for (const line of content.split("\n")) {
          if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
          if (inFence) continue;
          const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
          if (match) {
            const text = plainHeading(match[2]);
            headings.push({ id: slugger.slug(text), text });
          }
        }
        return {
          id: topic.id,
          title: topic.title,
          description: topic.description,
          href: topic.href,
          tutorial: tutorial.title,
          chapter: chapter.title,
          headings,
        };
      }),
    ),
  );
}

function rehypeCollectHeadings({ headings }: { headings: Heading[] }) {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if ((node.tagName === "h2" || node.tagName === "h3") && node.properties?.id) {
        headings.push({
          id: String(node.properties.id),
          text: toString(node),
          depth: node.tagName === "h2" ? 2 : 3,
        });
      }
    });
  };
}

const prettyCodeOptions: PrettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark-dimmed" },
  keepBackground: false,
  defaultLang: { block: "text" },
};

/**
 * Compiles a topic's MDX to a function body (evaluated with `run` at render
 * time) and collects its headings for the "On this page" navigator. Cached so
 * the work happens once, at build time.
 */
export async function getTopicContent(tutorialSlug: string, chapterSlug: string, topicSlug: string) {
  "use cache";
  cacheLife("max");

  const source = readFileSync(topicFile(tutorialSlug, chapterSlug, topicSlug), "utf8");
  const { content } = matter(source);
  const headings: Heading[] = [];

  const compiled = await compile(content, {
    outputFormat: "function-body",
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, [rehypeCollectHeadings, { headings }], [rehypePrettyCode, prettyCodeOptions]],
  });

  return { code: String(compiled), headings };
}
