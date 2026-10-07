import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { TopicMeta } from "@/lib/content-types";

export function Pager({ prev, next }: { prev?: TopicMeta; next?: TopicMeta }) {
  if (!prev && !next) return null;
  return (
    <nav aria-label="Previous and next topics" className="mt-12 grid gap-3 sm:grid-cols-2" data-no-print>
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-col rounded-2xl border border-border p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" /> Previous
          </span>
          <span className="mt-1 font-semibold group-hover:text-brand">{prev.title}</span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next && (
        <Link
          href={next.href}
          className="group flex flex-col items-end rounded-2xl border border-border p-4 text-right transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            Next <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="mt-1 font-semibold group-hover:text-brand">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
