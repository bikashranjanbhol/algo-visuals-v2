"use client";

import { RotateCw } from "lucide-react";

/** Goes back to the page that failed to load (passed as ?from= by the service worker). */
export function RetryButton() {
  return (
    <button
      type="button"
      onClick={() => {
        const from = new URLSearchParams(window.location.search).get("from");
        window.location.href = from && from.startsWith("/") && !from.startsWith("//") ? from : "/";
      }}
      className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground hover:opacity-90"
    >
      <RotateCw className="size-4" /> Try again
    </button>
  );
}
