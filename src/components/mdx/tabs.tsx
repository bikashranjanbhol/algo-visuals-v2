"use client";

import { Children, isValidElement, useId, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// The chosen language is shared by every <Tabs> on the site, so picking
// "Python" once switches all code samples to Python.
const STORAGE_KEY = "algo-visuals:tab";
const EVENT = "algo-visuals:tab-change";

function readPreferred() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

function choose(label: string) {
  try {
    localStorage.setItem(STORAGE_KEY, label);
  } catch {
    // Ignore: the selection still applies via the event below.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function Tabs({ items, children }: { items: string[]; children: ReactNode }) {
  const id = useId();
  const panels = Children.toArray(children).filter(isValidElement);
  const preferred = useSyncExternalStore(subscribe, readPreferred, () => null);
  const activeIndex = Math.max(0, preferred ? items.indexOf(preferred) : 0);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = (activeIndex + delta + items.length) % items.length;
    choose(items[next]);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  }

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-border bg-[var(--code-bg)]">
      <div
        role="tablist"
        aria-label="Code language"
        onKeyDown={onKeyDown}
        className="scrollbar-thin flex gap-1 overflow-x-auto border-b border-border bg-muted/60 px-2 pt-2"
      >
        {items.map((item, i) => {
          const active = i === activeIndex;
          return (
            <button
              key={item}
              id={`${id}-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`${id}-panel-${i}`}
              tabIndex={active ? 0 : -1}
              onClick={() => choose(item)}
              className={cn(
                "relative whitespace-nowrap rounded-t-lg px-3.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--code-bg)] text-foreground shadow-[inset_0_2px_0_var(--brand)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item}
            </button>
          );
        })}
      </div>
      {panels.map((panel, i) => (
        <div
          key={i}
          id={`${id}-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== activeIndex}
          data-tabs-panel=""
        >
          {panel}
        </div>
      ))}
    </div>
  );
}

export function Tab({ children }: { children: ReactNode }) {
  return <div className="prose-article prose max-w-none dark:prose-invert">{children}</div>;
}
