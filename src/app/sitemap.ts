import type { MetadataRoute } from "next";
import { getTutorials } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/tutorials", "/visualizer", "/about"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const content = getTutorials().flatMap((tutorial) => [
    { url: `${siteConfig.url}${tutorial.href}`, changeFrequency: "weekly" as const, priority: 0.8 },
    ...tutorial.chapters.flatMap((chapter) => [
      { url: `${siteConfig.url}${chapter.href}`, changeFrequency: "monthly" as const, priority: 0.6 },
      ...chapter.topics.map((topic) => ({
        url: `${siteConfig.url}${topic.href}`,
        lastModified: topic.updated,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ]),
  ]);

  return [...pages, ...content];
}
