"use client";

import { AlignLeft, ArrowUp, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import type { Heading } from "@/lib/content-types";
import { cn } from "@/lib/utils";

const OFFSET = 112;

/** Tracks which heading the reader is currently looking at. */
function useActiveHeading(headings: Heading[]) {
  // A string key keeps the effect from re-subscribing on every render.
  const key = headings.map((h) => h.id).join(" ");
  const [active, setActive] = useState<string | undefined>(headings[0]?.id);

  useEffect(() => {
    const ids = key ? key.split(" ") : [];
    if (ids.length === 0) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - OFFSET <= 0) current = id;
      }
      // At the very bottom, highlight the last heading even if it is short.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = ids[ids.length - 1];
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [key]);

  return active;
}

function TocList({ headings, active, onNavigate }: { headings: Heading[]; active?: string; onNavigate?: () => void }) {
  return (
    <ul className="relative space-y-0.5 border-l border-border text-sm">
      {headings.map((heading) => {
        const isActive = heading.id === active;
        return (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={onNavigate}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "-ml-px block border-l-2 py-1 leading-snug transition-colors",
                heading.depth === 3 ? "pl-6 text-[0.8rem]" : "pl-3.5",
                isActive
                  ? "border-brand font-medium text-brand"
                  : "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function TableOfContents({ headings, title = "On this page" }: { headings: Heading[]; title?: string }) {
  const active = useActiveHeading(headings);
  if (headings.length === 0) return null;

  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
        <AlignLeft className="size-3.5" /> {title}
      </p>
      <TocList headings={headings} active={active} />
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowUp className="size-3.5" /> Back to top
      </button>
    </div>
  );
}

/** Collapsible version shown above the article on screens without the right sidebar. */
export function MobileTableOfContents({ headings }: { headings: Heading[] }) {
  const [open, setOpen] = useState(false);
  const active = useActiveHeading(headings);
  if (headings.length === 0) return null;
  const current = headings.find((h) => h.id === active);

  return (
    <div className="sticky top-16 z-20 -mx-4 mb-6 border-y border-border bg-background/95 px-4 backdrop-blur-lg sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10 xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 py-2.5 text-left text-sm"
      >
        <AlignLeft className="size-4 shrink-0 text-muted-foreground" />
        <span className="shrink-0 font-medium whitespace-nowrap">On this page</span>
        {current && !open && <span className="truncate text-muted-foreground">· {current.text}</span>}
        <ChevronDown className={cn("ml-auto size-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="max-h-[60vh] overflow-y-auto pb-4">
          <TocList headings={headings} active={active} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-40 h-0.5" aria-hidden data-no-print>
      <div
        className="h-full origin-left bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
