"use client";

import { ChevronRight, CircleCheck, LayoutGrid, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PendingHint } from "@/components/ui/pending-hint";
import type { NavTutorial, TutorialSummary } from "@/lib/content-types";
import { countCompleted, useProgress } from "@/lib/progress";
import { useRegisterTutorialNav } from "@/lib/tutorial-nav-store";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./progress";
import { TutorialSwitcher } from "./tutorial-switcher";

/**
 * Navigation for the tutorial being read: a switcher to change tutorials,
 * progress, and that tutorial's chapters → topics. Used by the desktop
 * sidebar and the mobile menu.
 */
export function TutorialNav({
  tutorial,
  tutorials,
  onNavigate,
}: {
  tutorial: NavTutorial;
  tutorials: TutorialSummary[];
  /** Called with the href of any link the reader clicks (the mobile menu uses it). */
  onNavigate?: (href: string) => void;
}) {
  const pathname = usePathname();
  const progress = useProgress();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("");
  const activeRef = useRef<HTMLAnchorElement>(null);
  const query = filter.trim().toLowerCase();

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  const ids = tutorial.chapters.flatMap((c) => c.topics.map((t) => t.id));
  const done = countCompleted(progress, ids);
  const chapters = tutorial.chapters
    .map((chapter) => ({
      ...chapter,
      topics: query
        ? chapter.topics.filter((t) => `${t.title} ${chapter.title}`.toLowerCase().includes(query))
        : chapter.topics,
    }))
    .filter((chapter) => chapter.topics.length > 0);
  const overviewActive = pathname === tutorial.href;

  return (
    <nav aria-label={`${tutorial.title} contents`} className="text-sm">
      <TutorialSwitcher current={tutorial} tutorials={tutorials} onNavigate={onNavigate} />

      <div className="mt-4 px-1">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium tabular-nums">
            {done}/{ids.length} topics
          </span>
        </div>
        <ProgressBar value={ids.length ? done / ids.length : 0} className="h-1.5" />
      </div>

      <div className="relative mt-5 mb-3">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter topics…"
          aria-label={`Filter topics in ${tutorial.title}`}
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

      {!query && (
        <Link
          href={tutorial.href}
          onClick={() => onNavigate?.(tutorial.href)}
          ref={overviewActive ? activeRef : undefined}
          aria-current={overviewActive ? "page" : undefined}
          className={cn(
            "relative mb-2 flex items-center gap-2 rounded-md px-2 py-1.5 font-medium transition-colors",
            overviewActive ? "bg-brand-soft text-brand" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          )}
        >
          <LayoutGrid className="size-4" aria-hidden />
          <span className="flex-1">Overview</span>
          <PendingHint />
        </Link>
      )}

      {chapters.length === 0 && <p className="px-2 py-4 text-muted-foreground">No topics match “{filter}”.</p>}

      <ul className="space-y-1">
        {chapters.map((chapter) => {
          const chapterActive = pathname === chapter.href || pathname.startsWith(`${chapter.href}/`);
          const open = query ? true : !collapsed[chapter.slug];
          return (
            <li key={chapter.slug}>
              <button
                type="button"
                onClick={() => setCollapsed((c) => ({ ...c, [chapter.slug]: open }))}
                aria-expanded={open}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className={cn("size-3 shrink-0 transition-transform", open && "rotate-90")} aria-hidden />
                <span className={cn("truncate", chapterActive && "text-foreground")}>{chapter.title}</span>
              </button>
              {open && (
                <ul className="mb-2 ml-[0.85rem] space-y-0.5 border-l border-border pl-2">
                  {chapter.topics.map((topic) => {
                    const active = pathname === topic.href;
                    const completed = !!progress.completed[topic.id];
                    return (
                      <li key={topic.id}>
                        <Link
                          ref={active ? activeRef : undefined}
                          href={topic.href}
                          onClick={() => onNavigate?.(topic.href)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "relative flex items-center gap-2 rounded-md py-1.5 pr-2 pl-3 transition-colors",
                            active
                              ? "bg-brand-soft font-medium text-brand"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                          )}
                        >
                          {active && <span className="absolute top-1.5 bottom-1.5 -left-[9px] w-0.5 rounded-full bg-brand" aria-hidden />}
                          <span className="line-clamp-2 flex-1 leading-snug">{topic.title}</span>
                          <PendingHint />
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
    </nav>
  );
}

/** Desktop sidebar instance; also shares the tutorial with the mobile menu. */
export function TutorialSidebarNav({ tutorial, tutorials }: { tutorial: NavTutorial; tutorials: TutorialSummary[] }) {
  useRegisterTutorialNav(tutorial, tutorials);
  return <TutorialNav tutorial={tutorial} tutorials={tutorials} />;
}
