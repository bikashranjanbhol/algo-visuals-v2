"use client";

import { ChevronRight, CircleCheck, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TutorialIcon } from "@/components/icons";
import type { NavTutorial } from "@/lib/content-types";
import { countCompleted, useProgress } from "@/lib/progress";
import { accentStyles, cn } from "@/lib/utils";

/**
 * Three-level navigation (Tutorials → Chapters → Topics) used by the desktop
 * sidebar and the mobile drawer.
 */
export function DocsNavTree({ tree, onNavigate }: { tree: NavTutorial[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const progress = useProgress();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("");
  const activeRef = useRef<HTMLAnchorElement>(null);
  const query = filter.trim().toLowerCase();

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  const toggle = (key: string, open: boolean) => setExpanded((e) => ({ ...e, [key]: !open }));

  const visible = tree
    .map((tutorial) => ({
      ...tutorial,
      chapters: tutorial.chapters
        .map((chapter) => ({
          ...chapter,
          topics: query
            ? chapter.topics.filter(
                (t) =>
                  t.title.toLowerCase().includes(query) ||
                  chapter.title.toLowerCase().includes(query) ||
                  tutorial.title.toLowerCase().includes(query),
              )
            : chapter.topics,
        }))
        .filter((chapter) => chapter.topics.length > 0),
    }))
    .filter((tutorial) => tutorial.chapters.length > 0);

  return (
    <nav aria-label="Tutorials" className="text-sm">
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter topics…"
          aria-label="Filter topics"
          className="h-9 w-full rounded-lg border border-border bg-background pr-8 pl-9 text-sm placeholder:text-muted-foreground focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20 [&::-webkit-search-cancel-button]:hidden"
        />
        {filter && (
          <button
            type="button"
            onClick={() => setFilter("")}
            aria-label="Clear filter"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {visible.length === 0 && <p className="px-2 py-4 text-muted-foreground">No topics match “{filter}”.</p>}

      <ul className="space-y-1">
        {visible.map((tutorial) => {
          const tutorialActive = pathname === tutorial.href || pathname.startsWith(`${tutorial.href}/`);
          const open = query ? true : (expanded[tutorial.slug] ?? tutorialActive);
          const ids = tutorial.chapters.flatMap((c) => c.topics.map((t) => t.id));
          const done = countCompleted(progress, ids);
          const accent = accentStyles[tutorial.accent];
          return (
            <li key={tutorial.slug}>
              <div
                className={cn(
                  "group flex items-center rounded-lg transition-colors",
                  tutorialActive ? "bg-muted" : "hover:bg-muted/60",
                )}
              >
                <Link
                  href={tutorial.href}
                  onClick={onNavigate}
                  aria-current={pathname === tutorial.href ? "page" : undefined}
                  className="flex min-w-0 flex-1 items-center gap-2.5 py-2 pl-2 font-semibold"
                >
                  <span className={cn("grid size-7 shrink-0 place-items-center rounded-md bg-gradient-to-br text-white shadow-sm", accent.gradient)}>
                    <TutorialIcon name={tutorial.icon} className="size-4" />
                  </span>
                  <span className="truncate">{tutorial.title}</span>
                </Link>
                {done > 0 && (
                  <span className="mr-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {done}/{ids.length}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => toggle(tutorial.slug, open)}
                  aria-expanded={open}
                  aria-label={`${open ? "Collapse" : "Expand"} ${tutorial.title}`}
                  className="mr-1 grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground"
                >
                  <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
                </button>
              </div>

              {open && (
                <ul className="mt-1 mb-3 ml-[1.35rem] space-y-0.5 border-l border-border pl-2">
                  {tutorial.chapters.map((chapter) => {
                    const key = `${tutorial.slug}/${chapter.slug}`;
                    const chapterActive = pathname === chapter.href || pathname.startsWith(`${chapter.href}/`);
                    const chapterOpen = query ? true : (expanded[key] ?? true);
                    return (
                      <li key={chapter.slug}>
                        <button
                          type="button"
                          onClick={() => toggle(key, chapterOpen)}
                          aria-expanded={chapterOpen}
                          className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                        >
                          <ChevronRight className={cn("size-3 transition-transform", chapterOpen && "rotate-90")} />
                          <span className={cn("truncate", chapterActive && "text-foreground")}>{chapter.title}</span>
                        </button>
                        {chapterOpen && (
                          <ul className="space-y-0.5 pb-1">
                            {chapter.topics.map((topic) => {
                              const active = pathname === topic.href;
                              const completed = !!progress.completed[topic.id];
                              return (
                                <li key={topic.id}>
                                  <Link
                                    ref={active ? activeRef : undefined}
                                    href={topic.href}
                                    onClick={onNavigate}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                      "relative flex items-center gap-2 rounded-md py-1.5 pr-2 pl-5 transition-colors",
                                      active
                                        ? "bg-brand-soft font-medium text-brand"
                                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                                    )}
                                  >
                                    {active && <span className="absolute top-1.5 bottom-1.5 left-1 w-0.5 rounded-full bg-brand" />}
                                    <span className="flex-1 truncate">{topic.title}</span>
                                    {completed && <CircleCheck className="size-3.5 shrink-0 text-emerald-500" aria-label="Completed" />}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
