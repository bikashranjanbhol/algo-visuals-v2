"use client";

import { CircleCheck, Download, Share, SquarePlus, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { promptInstall, usePwa } from "@/lib/pwa";
import { cn } from "@/lib/utils";

/**
 * Installs the PWA where the browser supports a prompt, and shows manual
 * "Add to Home Screen" steps on iOS, which has no install prompt.
 */
export function InstallButton({
  className,
  variant = "solid",
  fallback = null,
}: {
  className?: string;
  variant?: "solid" | "outline";
  /** Rendered when this browser offers no way to install the app. */
  fallback?: ReactNode;
}) {
  const { canInstall, installed, isIOS } = usePwa();
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  const base = cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition",
    variant === "solid"
      ? "bg-foreground text-background hover:opacity-90"
      : "border border-border bg-card hover:bg-muted",
    className,
  );

  if (installed) {
    return (
      <span className={cn(base, "pointer-events-none opacity-80")}>
        <CircleCheck className="size-4 text-emerald-500" /> App installed
      </span>
    );
  }

  if (canInstall) {
    return (
      <button type="button" onClick={() => promptInstall()} className={base}>
        <Download className="size-4" /> Install app
      </button>
    );
  }

  if (isIOS) {
    return (
      <span className="relative inline-flex">
        <button type="button" onClick={() => setShowIOSHelp((s) => !s)} className={base} aria-expanded={showIOSHelp}>
          <Download className="size-4" /> Install app
        </button>
        {showIOSHelp && (
          <span
            role="dialog"
            aria-label="How to install"
            className="absolute bottom-full left-0 z-50 mb-2 w-72 animate-scale-in rounded-xl border border-border bg-card p-4 text-left text-sm shadow-xl"
          >
            <button
              type="button"
              onClick={() => setShowIOSHelp(false)}
              aria-label="Close"
              className="absolute top-2 right-2 rounded p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="size-3.5" />
            </button>
            <span className="block font-semibold">Install on iPhone or iPad</span>
            <span className="mt-2 flex items-center gap-2 text-muted-foreground">
              1. Tap <Share className="size-4 text-foreground" /> Share in Safari
            </span>
            <span className="mt-1 flex items-center gap-2 text-muted-foreground">
              2. Choose <SquarePlus className="size-4 text-foreground" /> Add to Home Screen
            </span>
          </span>
        )}
      </span>
    );
  }

  return fallback;
}
