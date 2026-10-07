"use client";

import { ArrowDownToLine, ArrowUpFromLine, Eye, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { StatusMessage, VisualizerShell } from "./shared";

type Mode = "stack" | "queue";
type Item = { id: number; value: number };

const CAPACITY = 8;
const INITIAL: Item[] = [
  { id: 1, value: 12 },
  { id: 2, value: 7 },
  { id: 3, value: 25 },
];

export function StackQueueVisualizer({ mode = "stack" }: { mode?: Mode }) {
  const isStack = mode !== "queue";
  const [items, setItems] = useState<Item[]>(INITIAL);
  const [nextId, setNextId] = useState(INITIAL.length + 1);
  const [input, setInput] = useState("42");
  const [highlight, setHighlight] = useState<number | null>(null);
  const [message, setMessage] = useState(
    isStack
      ? "A stack is Last-In, First-Out (LIFO): you add and remove at the top, like a pile of plates."
      : "A queue is First-In, First-Out (FIFO): you join at the rear and leave from the front, like a line at a café.",
  );
  const [log, setLog] = useState<string[]>([]);

  const addLabel = isStack ? "Push" : "Enqueue";
  const removeLabel = isStack ? "Pop" : "Dequeue";

  function record(entry: string, text: string) {
    setLog((l) => [entry, ...l].slice(0, 6));
    setMessage(text);
  }

  function add(event?: FormEvent) {
    event?.preventDefault();
    const parsed = Number.parseInt(input, 10);
    const value = Number.isFinite(parsed) ? parsed : Math.floor(Math.random() * 99) + 1;
    if (items.length >= CAPACITY) {
      record(`${addLabel.toLowerCase()}(${value}) ✗`, `Overflow! This demo holds at most ${CAPACITY} items. ${removeLabel} something first.`);
      return;
    }
    setItems([...items, { id: nextId, value }]);
    setHighlight(nextId);
    setNextId(nextId + 1);
    setInput(String(Math.floor(Math.random() * 99) + 1));
    record(
      `${addLabel.toLowerCase()}(${value})`,
      isStack
        ? `Pushed ${value} onto the top. It will be the first one out. O(1).`
        : `Enqueued ${value} at the rear. It will leave after the ${items.length} item${items.length === 1 ? "" : "s"} ahead of it. O(1).`,
    );
  }

  function remove() {
    if (items.length === 0) {
      record(`${removeLabel.toLowerCase()}() ✗`, `Underflow! The ${mode} is empty, so there is nothing to ${removeLabel.toLowerCase()}.`);
      return;
    }
    const removed = isStack ? items[items.length - 1] : items[0];
    setItems(isStack ? items.slice(0, -1) : items.slice(1));
    setHighlight(null);
    record(
      `${removeLabel.toLowerCase()}() → ${removed.value}`,
      isStack
        ? `Popped ${removed.value} from the top, the most recently added item. O(1).`
        : `Dequeued ${removed.value} from the front, the oldest item. O(1).`,
    );
  }

  function peek() {
    if (items.length === 0) {
      record("peek() ✗", `The ${mode} is empty.`);
      return;
    }
    const item = isStack ? items[items.length - 1] : items[0];
    setHighlight(item.id);
    record(`peek() → ${item.value}`, `Peek looks at the ${isStack ? "top" : "front"} item (${item.value}) without removing it. O(1).`);
  }

  function clear() {
    setItems([]);
    setHighlight(null);
    record("clear()", `Cleared the ${mode}.`);
  }

  const buttonClass =
    "inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium transition hover:bg-muted";

  return (
    <VisualizerShell
      title={isStack ? "Stack (LIFO)" : "Queue (FIFO)"}
      subtitle={`${addLabel} O(1) · ${removeLabel} O(1) · Peek O(1)`}
      toolbar={
        <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground">
          size = {items.length}/{CAPACITY}
        </span>
      }
      footer={
        <form onSubmit={add} className="flex flex-wrap items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^0-9-]/g, "").slice(0, 3))}
            inputMode="numeric"
            aria-label="Value"
            className="h-9 w-20 rounded-lg border border-border bg-card px-2.5 font-mono text-sm"
          />
          <button
            type="submit"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-sm font-semibold text-brand-foreground shadow-sm hover:opacity-90"
          >
            <ArrowDownToLine className="size-4" /> {addLabel}
          </button>
          <button type="button" onClick={remove} className={buttonClass}>
            <ArrowUpFromLine className="size-4" /> {removeLabel}
          </button>
          <button type="button" onClick={peek} className={buttonClass}>
            <Eye className="size-4" /> Peek
          </button>
          <button type="button" onClick={clear} className={cn(buttonClass, "ml-auto")} aria-label="Clear">
            <Trash2 className="size-4" />
          </button>
        </form>
      }
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <div className="flex min-h-64 items-center justify-center rounded-xl bg-grid p-4">
          {isStack ? (
            <div className="flex w-40 flex-col-reverse items-stretch gap-1.5 rounded-b-xl border-x-2 border-b-2 border-foreground/25 px-2 pt-6 pb-2">
              {items.length === 0 && <span className="py-6 text-center text-xs text-muted-foreground">empty</span>}
              {items.map((item, i) => {
                const top = i === items.length - 1;
                return (
                  <div key={item.id} className="relative animate-scale-in">
                    <div
                      className={cn(
                        "rounded-lg border py-2 text-center font-mono text-sm font-bold shadow-sm transition-colors",
                        item.id === highlight
                          ? "border-brand bg-brand text-brand-foreground"
                          : "border-border bg-card",
                      )}
                    >
                      {item.value}
                    </div>
                    {top && (
                      <span className="absolute top-1/2 left-full ml-3 -translate-y-1/2 whitespace-nowrap font-mono text-xs font-bold text-brand">
                        ← top
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full">
              <div className="flex min-h-16 items-center gap-1.5 overflow-x-auto rounded-xl border-y-2 border-foreground/25 px-2 py-3">
                {items.length === 0 && <span className="w-full text-center text-xs text-muted-foreground">empty</span>}
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "grid size-12 shrink-0 animate-scale-in place-items-center rounded-lg border font-mono text-sm font-bold shadow-sm",
                      item.id === highlight ? "border-brand bg-brand text-brand-foreground" : "border-border bg-card",
                    )}
                  >
                    {item.value}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between font-mono text-xs font-bold text-brand">
                <span>↑ front (dequeue)</span>
                <span>rear (enqueue) ↑</span>
              </div>
            </div>
          )}
        </div>
        <div>
          <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">Operations</p>
          <ol className="space-y-1 font-mono text-xs">
            {log.length === 0 && <li className="text-muted-foreground">Try the buttons below.</li>}
            {log.map((entry, i) => (
              <li
                key={`${entry}-${log.length - i}`}
                className={cn("rounded-md px-2 py-1", i === 0 ? "bg-brand-soft text-foreground" : "text-muted-foreground")}
              >
                {entry}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="mt-4">
        <StatusMessage>{message}</StatusMessage>
      </div>
    </VisualizerShell>
  );
}
