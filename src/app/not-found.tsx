import { ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";
import { getTutorials } from "@/lib/content";

export default function NotFound() {
  const tutorials = getTutorials();
  return (
    <main className="container-page flex flex-1 items-center py-20">
      <div className="mx-auto max-w-xl text-center">
        <p className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent dark:from-violet-400 dark:to-fuchsia-400">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">This page took a wrong turn</h1>
        <p className="mt-3 text-muted-foreground">
          Even the best search algorithms come up empty sometimes. Try one of these tutorials, or press{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">/</kbd> to search.
        </p>
        <ul className="mt-8 grid gap-2 text-left sm:grid-cols-2">
          {tutorials.map((t) => (
            <li key={t.slug}>
              <Link href={t.href} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm font-medium hover:border-brand/40">
                <Compass className="size-4 text-brand" /> {t.title}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/" className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
          <ArrowLeft className="size-4" /> Back to home
        </Link>
      </div>
    </main>
  );
}
