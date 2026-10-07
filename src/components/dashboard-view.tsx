"use client";

import { ArrowRight, BookOpen, CircleCheck, Flame, RotateCcw, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/auth/user-menu";
import { ContinueLearning } from "@/components/continue-learning";
import { ProgressBar } from "@/components/docs/progress";
import { TutorialIcon } from "@/components/icons";
import type { NavTutorial } from "@/lib/content-types";
import { countCompleted, resetProgress, useProgress } from "@/lib/progress";
import { accentStyles, cn } from "@/lib/utils";

type User = { name?: string | null; email?: string | null; image?: string | null };

export function DashboardView({ user, tutorials }: { user: User; tutorials: NavTutorial[] }) {
  const progress = useProgress();
  const topics = tutorials.flatMap((t) =>
    t.chapters.flatMap((c) => c.topics.map((topic) => ({ ...topic, tutorial: t.title, chapter: c.title }))),
  );
  const completedCount = countCompleted(progress, topics.map((t) => t.id));
  const started = tutorials.filter((t) => countCompleted(progress, t.chapters.flatMap((c) => c.topics.map((x) => x.id))) > 0).length;
  const overall = topics.length ? completedCount / topics.length : 0;
  const days = new Set(Object.values(progress.completed).map((ts) => new Date(ts).toDateString())).size;
  const recent = topics
    .filter((t) => progress.completed[t.id])
    .sort((a, b) => progress.completed[b.id] - progress.completed[a.id])
    .slice(0, 5);
  const firstName = user.name?.split(" ")[0] ?? "there";

  const stats = [
    { icon: CircleCheck, label: "Topics completed", value: `${completedCount}/${topics.length}` },
    { icon: Target, label: "Overall progress", value: `${Math.round(overall * 100)}%` },
    { icon: BookOpen, label: "Tutorials started", value: `${started}/${tutorials.length}` },
    { icon: Flame, label: "Active days", value: days },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar name={user.name} image={user.image} className="size-16 text-lg" />
        <div className="flex-1">
          <p className="text-sm font-medium text-brand">My dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {firstName}!</h1>
          {user.email && <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>}
        </div>
      </header>

      <div className="max-w-xl">
        <ContinueLearning />
      </div>

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="size-4 text-brand" /> {label}
            </dt>
            <dd className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <section aria-labelledby="tutorial-progress">
          <h2 id="tutorial-progress" className="text-xl font-bold tracking-tight">
            Tutorial progress
          </h2>
          <ul className="mt-4 space-y-3">
            {tutorials.map((tutorial) => {
              const ids = tutorial.chapters.flatMap((c) => c.topics.map((t) => t.id));
              const done = countCompleted(progress, ids);
              const next = tutorial.chapters.flatMap((c) => c.topics).find((t) => !progress.completed[t.id]);
              const accent = accentStyles[tutorial.accent];
              return (
                <li key={tutorial.slug} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white", accent.gradient)}>
                      <TutorialIcon name={tutorial.icon} className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link href={tutorial.href} className="font-semibold hover:text-brand">
                        {tutorial.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {done} of {ids.length} topics
                      </p>
                    </div>
                    {done === ids.length ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <Trophy className="size-3.5" /> Done
                      </span>
                    ) : (
                      next && (
                        <Link
                          href={next.href}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-brand hover:bg-brand-soft"
                        >
                          {done ? "Continue" : "Start"} <ArrowRight className="size-4" />
                        </Link>
                      )
                    )}
                  </div>
                  <ProgressBar value={ids.length ? done / ids.length : 0} className="mt-4" />
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="recent-activity">
          <h2 id="recent-activity" className="text-xl font-bold tracking-tight">
            Recently completed
          </h2>
          <div className="mt-4 rounded-2xl border border-border bg-card">
            {recent.length === 0 ? (
              <div className="p-6 text-center">
                <p className="font-medium">Nothing completed yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Finish a topic and press “Mark as complete” to see it here.
                </p>
                <Link
                  href={topics[0]?.href ?? "/tutorials"}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90"
                >
                  Start your first topic <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((topic) => (
                  <li key={topic.id}>
                    <Link href={topic.href} className="flex items-center gap-3 p-4 hover:bg-muted/50">
                      <CircleCheck className="size-5 shrink-0 text-emerald-500" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{topic.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {topic.tutorial} · {new Date(progress.completed[topic.id]).toLocaleDateString()}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {completedCount > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Reset all progress on this device? This can't be undone.")) resetProgress();
              }}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-rose-600"
            >
              <RotateCcw className="size-3.5" /> Reset progress
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
