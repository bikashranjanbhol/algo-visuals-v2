"use client";

import { ArrowRight, History } from "lucide-react";
import Link from "next/link";
import { useProgress } from "@/lib/progress";

/** Shows a "pick up where you left off" card once the reader has visited a topic. */
export function ContinueLearning() {
  const { lastVisited, completed } = useProgress();
  if (!lastVisited) return null;
  const count = Object.keys(completed).length;

  return (
    <Link
      href={lastVisited.href}
      className="group flex animate-fade-in items-center gap-4 rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur transition hover:border-brand/40 hover:shadow-md"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
        <History className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-muted-foreground">
          Pick up where you left off{count > 0 ? ` · ${count} topic${count === 1 ? "" : "s"} completed` : ""}
        </span>
        <span className="block truncate font-semibold group-hover:text-brand">{lastVisited.title}</span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-brand" />
    </Link>
  );
}
