"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PAGES_CACHE } from "@/lib/pwa";

/** Lists the pages stored in the service worker cache. */
export function SavedPages({ titles }: { titles: Record<string, string> }) {
  const [paths, setPaths] = useState<string[] | null>(null);

  useEffect(() => {
    if (!("caches" in window)) return;
    caches
      .open(PAGES_CACHE)
      .then((cache) => cache.keys())
      .then((requests) => {
        const unique = [...new Set(requests.map((r) => new URL(r.url).pathname))];
        setPaths(unique.filter((p) => p !== "/offline").sort());
      })
      .catch(() => setPaths([]));
  }, []);

  if (paths === null) return null;
  if (paths.length === 0) {
    return <p className="text-sm text-muted-foreground">No pages saved yet. Pages you visit while online are saved automatically.</p>;
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {paths.map((path) => (
        <li key={path}>
          <Link href={path} className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 text-sm hover:border-brand/40">
            <FileText className="size-4 shrink-0 text-brand" />
            <span className="truncate">{titles[path] ?? path}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
