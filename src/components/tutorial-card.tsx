import { ArrowRight, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { TutorialProgress } from "@/components/docs/progress";
import { TutorialIcon } from "@/components/icons";
import type { TutorialMeta } from "@/lib/content-types";
import { accentStyles, cn, formatMinutes } from "@/lib/utils";

export function TutorialCard({ tutorial, detailed = false }: { tutorial: TutorialMeta; detailed?: boolean }) {
  const accent = accentStyles[tutorial.accent];
  const topics = tutorial.chapters.flatMap((c) => c.topics.map(({ id, href, title }) => ({ id, href, title })));

  return (
    <Link
      href={tutorial.href}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-2xl hover:shadow-brand/10"
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-20 -right-20 size-56 rounded-full bg-gradient-to-br opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-25",
          accent.gradient,
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <span className={cn("grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg", accent.gradient)}>
          <TutorialIcon name={tutorial.icon} className="size-6" />
        </span>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", accent.soft, accent.text)}>{tutorial.level}</span>
      </div>
      <h3 className="relative mt-5 text-xl font-bold tracking-tight group-hover:text-brand">{tutorial.title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{tutorial.description}</p>

      {detailed && (
        <ul className="relative mt-5 space-y-2 text-sm">
          {tutorial.chapters.map((chapter, i) => (
            <li key={chapter.slug} className="flex items-center gap-2.5">
              <span className={cn("grid size-5 shrink-0 place-items-center rounded-md text-[0.65rem] font-bold", accent.soft, accent.text)}>
                {i + 1}
              </span>
              <span className="truncate">{chapter.title}</span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">{chapter.topics.length} topics</span>
            </li>
          ))}
        </ul>
      )}

      <div className="relative mt-auto pt-6">
        <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="size-3.5" /> {tutorial.topicCount} topics
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" /> {formatMinutes(tutorial.readingMinutes)}
          </span>
          <ArrowRight className="ml-auto size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
        </div>
        <TutorialProgress topics={topics} compact />
      </div>
    </Link>
  );
}
