"use client";

import { CornerDownLeft, FileText, Hash, Layers, LoaderCircle, Search, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import type { SearchEntry, TutorialSummary } from "@/lib/content-types";
import { useLockBodyScroll } from "@/lib/hooks";
import { primaryNav } from "@/lib/site";
import { cn } from "@/lib/utils";

type Result = {
  key: string;
  href: string;
  title: string;
  subtitle?: string;
  kind: "page" | "tutorial" | "topic" | "section";
};

const kindIcon = { page: Sparkles, tutorial: Layers, topic: FileText, section: Hash };

const subscribeNoop = () => () => {};
const useIsMac = () =>
  useSyncExternalStore(subscribeNoop, () => /Mac|iPhone|iPad/.test(navigator.userAgent), () => true);

function normalize(text: string) {
  return text.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

function search(query: string, entries: SearchEntry[], tutorials: TutorialSummary[]): Result[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) {
    return [
      ...primaryNav.map((p) => ({ key: p.href, href: p.href, title: p.title, kind: "page" as const })),
      ...tutorials.map((t) => ({
        key: t.href,
        href: t.href,
        title: t.title,
        subtitle: `${t.level} · ${t.topicCount} topics`,
        kind: "tutorial" as const,
      })),
    ];
  }

  const matchesAll = (text: string) => terms.every((t) => text.includes(t));
  const q = normalize(query.trim());

  const topics = entries
    .map((entry) => {
      const title = normalize(entry.title);
      const haystack = normalize(
        [entry.title, entry.description, entry.tutorial, entry.chapter, ...entry.headings.map((h) => h.text)].join(" "),
      );
      if (!matchesAll(haystack)) return null;
      let score = 0;
      if (title === q) score += 100;
      if (title.startsWith(q)) score += 40;
      for (const term of terms) {
        if (title.includes(term)) score += 12;
        if (normalize(entry.description).includes(term)) score += 4;
        if (normalize(`${entry.tutorial} ${entry.chapter}`).includes(term)) score += 2;
      }
      return { entry, score };
    })
    .filter((x): x is { entry: SearchEntry; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ entry }) => ({
      key: entry.id,
      href: entry.href,
      title: entry.title,
      subtitle: `${entry.tutorial} › ${entry.chapter}`,
      kind: "topic" as const,
    }));

  const sections = entries
    .flatMap((entry) =>
      entry.headings
        .filter((h) => matchesAll(normalize(h.text)))
        .map((h) => ({
          key: `${entry.id}#${h.id}`,
          href: `${entry.href}#${h.id}`,
          title: h.text,
          subtitle: entry.title,
          kind: "section" as const,
        })),
    )
    .slice(0, 6);

  const pages = [
    ...primaryNav.map((p) => ({ key: p.href, href: p.href, title: p.title, kind: "page" as const })),
    ...tutorials.map((t) => ({ key: t.href, href: t.href, title: t.title, subtitle: t.description, kind: "tutorial" as const })),
  ].filter((p) => matchesAll(normalize(p.title)));

  return [...pages, ...topics, ...sections];
}

export function CommandPalette({ entries, tutorials }: { entries: SearchEntry[]; tutorials: TutorialSummary[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const isMac = useIsMac();
  // Remember which page the palette was opened on. After choosing a result it
  // stays open with a spinner until the new page arrives (tutorial pages load
  // their data on navigation), then closes by itself when the URL changes.
  const [openAt, setOpenAt] = useState<string | null>(null);
  // Forget it once the URL changes, so coming back to the same page (Back/
  // Forward) doesn't reopen it. Adjusting state during render is React's
  // recommended way to reset state when an input changes.
  if (openAt !== null && openAt !== pathname) setOpenAt(null);
  const open = openAt === pathname;
  const [isPending, startTransition] = useTransition();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const results = useMemo(() => search(query, entries, tutorials), [query, entries, tutorials]);
  useLockBodyScroll(open);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        if (open) {
          setOpenAt(null);
        } else {
          setQuery("");
          setActive(0);
          setOpenAt(pathname);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pathname]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function openPalette() {
    setQuery("");
    setActive(0);
    setOpenAt(pathname);
  }

  function close() {
    setOpenAt(null);
    setQuery("");
    setActive(0);
  }

  function go(result: Result | undefined) {
    if (!result) return;
    if (new URL(result.href, window.location.href).pathname === pathname) {
      // Same page (e.g. a section heading): the URL path won't change, so close now.
      close();
      router.push(result.href);
      return;
    }
    setPendingKey(result.key);
    startTransition(() => router.push(result.href));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[active]);
    } else if (event.key === "Escape") {
      close();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        className="hidden h-9 w-56 items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground lg:flex xl:w-64"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search tutorials…</span>
        <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[0.65rem] font-medium">
          {isMac ? "⌘" : "Ctrl"} K
        </kbd>
      </button>
      <button
        type="button"
        onClick={openPalette}
        aria-label="Search"
        className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
      >
        <Search className="size-[1.1rem]" />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[10vh] sm:pt-[14vh]">
            <div className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-sm" onClick={close} aria-hidden />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              className="relative flex max-h-[70vh] w-full max-w-xl animate-scale-in flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-border px-4">
                <Search className="size-5 shrink-0 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onKeyDown}
                  placeholder="Search topics, sections, tutorials…"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="search-results"
                  aria-activedescendant={results[active] ? `search-result-${active}` : undefined}
                  className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                />
                <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground">Esc</kbd>
              </div>
              <ul id="search-results" ref={listRef} role="listbox" className="scrollbar-thin overflow-y-auto p-2">
                {results.length === 0 && (
                  <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No results for “{query}”. Try “sort”, “queue” or “graph”.
                  </li>
                )}
                {results.map((result, i) => {
                  const Icon = kindIcon[result.kind];
                  const showGroup = i === 0 || results[i - 1].kind !== result.kind;
                  return (
                    <li key={result.key} role="presentation">
                      {showGroup && (
                        <p className="px-3 pt-3 pb-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                          {{ page: "Pages", tutorial: "Tutorials", topic: "Topics", section: "Sections" }[result.kind]}
                        </p>
                      )}
                      <div
                        id={`search-result-${i}`}
                        data-index={i}
                        role="option"
                        aria-selected={i === active}
                        onMouseMove={() => setActive(i)}
                        onClick={() => go(result)}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5",
                          i === active ? "bg-brand-soft" : "",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-8 shrink-0 place-items-center rounded-lg border border-border",
                            i === active ? "border-brand/30 bg-card text-brand" : "text-muted-foreground",
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{result.title}</span>
                          {result.subtitle && (
                            <span className="block truncate text-xs text-muted-foreground">{result.subtitle}</span>
                          )}
                        </span>
                        {isPending && pendingKey === result.key ? (
                          <LoaderCircle className="size-4 shrink-0 animate-spin text-muted-foreground" aria-label="Opening" />
                        ) : (
                          i === active && <CornerDownLeft className="size-4 shrink-0 text-muted-foreground" />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="flex items-center gap-4 border-t border-border bg-muted/40 px-4 py-2 text-[0.7rem] text-muted-foreground">
                <span><kbd className="font-mono">↑↓</kbd> navigate</span>
                <span><kbd className="font-mono">↵</kbd> open</span>
                <span className="ml-auto">{entries.length} topics indexed</span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
