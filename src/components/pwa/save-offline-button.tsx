"use client";

import { CircleCheck, CloudDownload, LoaderCircle, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { PAGES_CACHE, usePwa } from "@/lib/pwa";
import { cn } from "@/lib/utils";

type Status = { kind: "idle" } | { kind: "saving"; done: number; total: number } | { kind: "saved" } | { kind: "error" };

/** Asks the service worker to download every page of a tutorial for offline reading. */
export function SaveOfflineButton({ urls, className }: { urls: string[]; className?: string }) {
  const { swReady } = usePwa();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const key = urls.join("\n");

  // If every page is already cached, say so right away.
  useEffect(() => {
    if (!swReady || !("caches" in window)) return;
    let cancelled = false;
    caches
      .open(PAGES_CACHE)
      .then((cache) => Promise.all(key.split("\n").map((url) => cache.match(url))))
      .then((matches) => {
        if (!cancelled && matches.every(Boolean)) setStatus({ kind: "saved" });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [swReady, key]);

  if (!swReady) return null;

  async function save() {
    const registration = await navigator.serviceWorker.ready;
    const worker = registration.active;
    if (!worker) {
      setStatus({ kind: "error" });
      return;
    }
    setStatus({ kind: "saving", done: 0, total: urls.length });
    const channel = new MessageChannel();
    channel.port1.onmessage = (event: MessageEvent<{ type: string; done: number; total: number; failed: number }>) => {
      const { type, done, total, failed } = event.data;
      if (type === "progress") setStatus({ kind: "saving", done, total });
      if (type === "done") setStatus(failed > 0 ? { kind: "error" } : { kind: "saved" });
    };
    worker.postMessage({ type: "CACHE_URLS", urls }, [channel.port2]);
  }

  const base = cn(
    "inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition",
    className,
  );

  if (status.kind === "saved") {
    return (
      <span className={cn(base, "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300")}>
        <CircleCheck className="size-4" /> Available offline
      </span>
    );
  }

  if (status.kind === "saving") {
    return (
      <span className={cn(base, "border-border bg-card")} aria-live="polite">
        <LoaderCircle className="size-4 animate-spin" /> Saving {status.done}/{status.total}…
      </span>
    );
  }

  return (
    <button type="button" onClick={save} className={cn(base, "border-border bg-card hover:bg-muted")}>
      {status.kind === "error" ? (
        <>
          <TriangleAlert className="size-4 text-amber-500" /> Retry offline download
        </>
      ) : (
        <>
          <CloudDownload className="size-4" /> Save for offline
        </>
      )}
    </button>
  );
}
