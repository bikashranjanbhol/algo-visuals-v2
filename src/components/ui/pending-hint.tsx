"use client";

import { LoaderCircle } from "lucide-react";
import { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";

/**
 * Spinner for the inside of a <Link>. Tutorial pages read params outside
 * <Suspense> (so their content is in the static HTML), which means navigating
 * to one waits for its data unless it was prefetched; this shows that wait on
 * the link that was clicked. Always rendered so it never shifts layout.
 */
export function PendingHint({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  return (
    <LoaderCircle
      aria-hidden
      className={cn(
        "size-3.5 shrink-0 text-muted-foreground transition-opacity",
        pending ? "animate-spin opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}
