"use client";

import { ArrowRight, Check, ChevronsUpDown, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useId, useRef, useState } from "react";
import { TutorialIcon } from "@/components/icons";
import type { TutorialSummary } from "@/lib/content-types";
import { useDismiss } from "@/lib/hooks";
import { accentStyles, cn } from "@/lib/utils";

/** Beyond this many tutorials the switcher gets a filter box. */
const FILTER_THRESHOLD = 6;

/** Shows the tutorial being read and lets the reader jump to another one. */
export function TutorialSwitcher({
  current,
  tutorials,
  onNavigate,
}: {
  current: TutorialSummary;
  tutorials: TutorialSummary[];
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();
  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);
  useDismiss(ref, open, close);

  const accent = accentStyles[current.accent];
  const q = query.trim().toLowerCase();
  const visible = q ? tutorials.filter((t) => `${t.title} ${t.description}`.toLowerCase().includes(q)) : tutorials;

  function select() {
    close();
    onNavigate?.();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Current tutorial: ${current.title}. Switch tutorial`}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl border bg-card p-2.5 text-left shadow-sm transition",
          open ? "border-brand/40 ring-4 ring-brand/10" : "border-border hover:border-foreground/20",
        )}
      >
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white shadow-sm", accent.gradient)}>
          <TutorialIcon name={current.icon} className="size-[1.1rem]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-sm leading-snug font-semibold">{current.title}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {current.level} · {current.topicCount} topics
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </button>

      {open && (
        <div
          id={listId}
          className="absolute inset-x-0 top-full z-30 mt-2 animate-scale-in overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/5 dark:shadow-black/40"
        >
          {tutorials.length > FILTER_THRESHOLD && (
            <div className="relative border-b border-border">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a tutorial…"
                aria-label="Find a tutorial"
                className="h-10 w-full bg-transparent pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
              />
            </div>
          )}
          <ul className="scrollbar-thin max-h-72 overflow-y-auto p-1.5" aria-label="Tutorials">
            {visible.length === 0 && <li className="px-3 py-4 text-center text-sm text-muted-foreground">No tutorials match.</li>}
            {visible.map((t) => {
              const isCurrent = t.slug === current.slug;
              return (
                <li key={t.slug}>
                  <Link
                    href={t.href}
                    onClick={select}
                    aria-current={isCurrent ? "true" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors",
                      isCurrent ? "bg-brand-soft" : "hover:bg-muted",
                    )}
                  >
                    <span className={cn("grid size-7 shrink-0 place-items-center rounded-md bg-gradient-to-br text-white", accentStyles[t.accent].gradient)}>
                      <TutorialIcon name={t.icon} className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate font-medium", isCurrent && "text-brand")}>{t.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {t.level} · {t.topicCount} topics
                      </span>
                    </span>
                    {isCurrent && <Check className="size-4 shrink-0 text-brand" aria-hidden />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/tutorials"
            onClick={select}
            className="flex items-center justify-between border-t border-border px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Browse all tutorials <ArrowRight className="size-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
