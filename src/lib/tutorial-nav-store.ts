"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { NavTutorial, TutorialSummary } from "./content-types";

/**
 * The tutorial layout registers the tutorial being read so the mobile menu
 * (rendered by the root layout, outside that route) can show the same
 * single-tutorial navigation as the desktop sidebar.
 */
type Entry = { tutorial: NavTutorial; tutorials: TutorialSummary[] };

let current: Entry | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useRegisterTutorialNav(tutorial: NavTutorial, tutorials: TutorialSummary[]) {
  useEffect(() => {
    const entry: Entry = { tutorial, tutorials };
    current = entry;
    emit();
    return () => {
      // Another tutorial may have registered already (e.g. while this route is
      // being hidden after a navigation), so only clear our own entry.
      if (current === entry) {
        current = null;
        emit();
      }
    };
  }, [tutorial, tutorials]);
}

export function useCurrentTutorialNav() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}
