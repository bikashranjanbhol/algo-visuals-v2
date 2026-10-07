"use client";

import { useSyncExternalStore } from "react";

/** Must match the cache name used in public/sw.js. */
export const PAGES_CACHE = "algo-visuals-pages-v1";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type PwaState = {
  canInstall: boolean;
  installed: boolean;
  isIOS: boolean;
  online: boolean;
  swReady: boolean;
};

const SERVER_STATE: PwaState = { canInstall: false, installed: false, isIOS: false, online: true, swReady: false };

let state: PwaState = SERVER_STATE;
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let initialized = false;
const listeners = new Set<() => void>();

function update(patch: Partial<PwaState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

/** Wires up browser PWA events once. Called by <PwaManager /> in the root layout. */
export function initPwa() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  update({
    installed: standalone,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    online: navigator.onLine,
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    update({ canInstall: true });
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    update({ canInstall: false, installed: true });
  });
  window.addEventListener("online", () => update({ online: true }));
  window.addEventListener("offline", () => update({ online: false }));

  if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then(() => navigator.serviceWorker.ready)
      .then(() => update({ swReady: true }))
      .catch(() => {
        // Registration fails on insecure origins; the site still works without it.
      });
  }
}

export async function promptInstall() {
  if (!deferredPrompt) return false;
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  update({ canInstall: false, installed: outcome === "accepted" || state.installed });
  return outcome === "accepted";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePwa() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE,
  );
}
