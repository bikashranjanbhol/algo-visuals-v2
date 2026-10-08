"use client";

import { ArrowRight, Check, CircleCheck, Circle, Play, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { countCompleted, markVisited, setTopicComplete, useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

/** "Mark as complete" toggle shown at the end of each topic. Also records the visit. */
export function TopicCompleteButton({ id, href, title, nextHref }: { id: string; href: string; title: string; nextHref?: string }) {
  const progress = useProgress();
  const done = !!progress.completed[id];

  useEffect(() => {
    markVisited({ id, href, title });
  }, [id, href, title]);

  return (
    <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-border bg-gradient-to-br from-brand-soft via-transparent to-transparent p-5 sm:flex-row sm:items-center">
      <div className="flex-1">
        <p className="font-semibold">{done ? "Nice work, topic completed!" : "Finished this topic?"}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {done ? "Your progress is saved on this device." : "Mark it complete to track your progress across the tutorial."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTopicComplete(id, !done)}
          aria-pressed={done}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition",
            done
              ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300"
              : "bg-brand text-brand-foreground shadow-sm hover:opacity-90",
          )}
        >
          {done ? <CircleCheck className="size-4" /> : <Check className="size-4" />}
          {done ? "Completed" : "Mark as complete"}
        </button>
        {done && nextHref && (
          <Link
            href={nextHref}
            prefetch={true}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:bg-muted"
          >
            Next topic <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-[width] duration-500"
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  );
}

type TopicRef = { id: string; href: string; title: string };

/** Progress summary + "Start / Continue" call to action for one tutorial. */
export function TutorialProgress({ topics, compact = false }: { topics: TopicRef[]; compact?: boolean }) {
  const progress = useProgress();
  const done = countCompleted(progress, topics.map((t) => t.id));
  const ratio = topics.length ? done / topics.length : 0;
  const nextTopic = topics.find((t) => !progress.completed[t.id]) ?? topics[0];
  const finished = done === topics.length && topics.length > 0;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <ProgressBar value={ratio} className="h-1.5" />
        <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
          {done}/{topics.length}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Your progress</span>
          <span className="tabular-nums text-muted-foreground">
            {done} of {topics.length} topics · {Math.round(ratio * 100)}%
          </span>
        </div>
        <ProgressBar value={ratio} />
      </div>
      {nextTopic && (
        <Link
          href={nextTopic.href}
          className="group inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/20 transition hover:opacity-90"
        >
          {finished ? <RotateCcw className="size-4" /> : <Play className="size-4" />}
          {finished ? "Review from the start" : done > 0 ? `Continue: ${nextTopic.title}` : "Start learning"}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/** Small completion indicator for topic lists on overview pages. */
export function TopicStatus({ id }: { id: string }) {
  const progress = useProgress();
  return progress.completed[id] ? (
    <CircleCheck className="size-5 shrink-0 text-emerald-500" aria-label="Completed" />
  ) : (
    <Circle className="size-5 shrink-0 text-border" aria-hidden />
  );
}
