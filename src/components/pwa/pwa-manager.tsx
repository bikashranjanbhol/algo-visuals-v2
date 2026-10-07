"use client";

import { Download, Wifi, WifiOff, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { LogoMark } from "@/components/icons";
import { initPwa, promptInstall, usePwa } from "@/lib/pwa";

const DISMISS_KEY = "algo-visuals:install-dismissed";
const subscribeNoop = () => () => {};

function readDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return true;
  }
}

/** Registers the service worker and shows connectivity + install prompts. */
export function PwaManager() {
  const { online, canInstall } = usePwa();
  const storedDismissed = useSyncExternalStore(subscribeNoop, readDismissed, () => true);
  const [dismissed, setDismissed] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    initPwa();
  }, []);

  // Track the offline → online transition to briefly confirm reconnection.
  if (!online && !wasOffline) setWasOffline(true);
  if (online && wasOffline) {
    setWasOffline(false);
    setShowBackOnline(true);
  }

  useEffect(() => {
    if (!showBackOnline) return;
    const id = setTimeout(() => setShowBackOnline(false), 3000);
    return () => clearTimeout(id);
  }, [showBackOnline]);

  const showInstall = canInstall && !dismissed && !storedDismissed;

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Not persisted; the banner stays hidden for this session.
    }
  }

  return (
    <>
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 left-4 z-[80] flex flex-col gap-2" data-no-print>
        {!online && (
          <div className="pointer-events-auto flex animate-scale-in items-center gap-2.5 rounded-full border border-amber-500/40 bg-card py-2 pr-4 pl-3 text-sm shadow-lg">
            <WifiOff className="size-4 text-amber-500" />
            <span>
              <span className="font-semibold">You&apos;re offline.</span>{" "}
              <span className="text-muted-foreground">Saved pages still work.</span>
            </span>
          </div>
        )}
        {online && showBackOnline && (
          <div className="pointer-events-auto flex animate-scale-in items-center gap-2.5 rounded-full border border-emerald-500/40 bg-card py-2 pr-4 pl-3 text-sm shadow-lg">
            <Wifi className="size-4 text-emerald-500" />
            <span className="font-semibold">Back online</span>
          </div>
        )}
      </div>

      {showInstall && (
        <div
          role="dialog"
          aria-label="Install app"
          className="fixed right-4 bottom-4 left-4 z-[80] animate-scale-in rounded-2xl border border-border bg-card p-4 shadow-2xl sm:left-auto sm:w-96"
          data-no-print
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute top-3 right-3 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
          <div className="flex gap-3 pr-6">
            <LogoMark className="size-11 shrink-0" />
            <div>
              <p className="font-semibold">Install AlgoVisuals</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Add it to your home screen for an app-like experience and offline reading.
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={dismiss} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
              Not now
            </button>
            <button
              type="button"
              onClick={() => promptInstall()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90"
            >
              <Download className="size-4" /> Install
            </button>
          </div>
        </div>
      )}
    </>
  );
}
