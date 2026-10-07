import { Clock } from "lucide-react";
import Link from "next/link";
import type { TopicMeta } from "@/lib/content-types";
import { TopicStatus } from "./progress";

export function TopicList({ topics, startIndex = 0 }: { topics: TopicMeta[]; startIndex?: number }) {
  return (
    <ol className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
      {topics.map((topic, i) => (
        <li key={topic.id} id={topic.slug} className="scroll-mt-28">
          <Link href={topic.href} className="group flex items-start gap-4 p-4 transition-colors hover:bg-muted/50 sm:p-5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted font-mono text-sm font-semibold text-muted-foreground group-hover:bg-brand-soft group-hover:text-brand">
              {startIndex + i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold group-hover:text-brand">{topic.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{topic.description}</span>
              <span className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="capitalize">{topic.difficulty}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" /> {topic.readingMinutes} min
                </span>
              </span>
            </span>
            <TopicStatus id={topic.id} />
          </Link>
        </li>
      ))}
    </ol>
  );
}
