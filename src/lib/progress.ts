"use client";

import { useSyncExternalStore } from "react";

/**
 * Learning progress is stored in the browser so it works offline and without
 * an account. Components read it through useProgress(), which re-renders on
 * changes from this tab and from other tabs.
 */
export type ProgressState = {
  /** topic id -> timestamp it was completed */
  completed: Record<string, number>;
  lastVisited?: { id: string; href: string; title: string; at: number };
};

const STORAGE_KEY = "algo-visuals:progress:v1";
const EMPTY: ProgressState = { completed: {} };
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedState: ProgressState = EMPTY;

function read(): ProgressState {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cachedRaw) return cachedState;
  cachedRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as ProgressState) : EMPTY;
    cachedState = { completed: parsed.completed ?? {}, lastVisited: parsed.lastVisited };
  } catch {
    cachedState = EMPTY;
  }
  return cachedState;
}

function write(next: ProgressState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return;
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function setTopicComplete(id: string, complete: boolean) {
  const state = read();
  const completed = { ...state.completed };
  if (complete) completed[id] = Date.now();
  else delete completed[id];
  write({ ...state, completed });
}

export function markVisited(topic: { id: string; href: string; title: string }) {
  const state = read();
  if (state.lastVisited?.id === topic.id) return;
  write({ ...state, lastVisited: { ...topic, at: Date.now() } });
}

export function resetProgress() {
  write(EMPTY);
}

export function countCompleted(state: ProgressState, ids: string[]) {
  return ids.reduce((n, id) => n + (state.completed[id] ? 1 : 0), 0);
}
