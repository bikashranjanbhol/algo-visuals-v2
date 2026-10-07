"use client";

import { Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { PlaybackControls, Stat, StatusMessage, VisualizerShell, usePlayback } from "./shared";
import { seededArray, sortingAlgorithms, type SortAlgorithm } from "./sorting-algorithms";

const SIZES = [8, 12, 16, 24];

export function SortingVisualizer({
  algorithm = "bubble",
  selectable = false,
  size = 12,
}: {
  algorithm?: SortAlgorithm;
  /** Show a picker to switch algorithms (used on the Visualizer page). */
  selectable?: boolean;
  size?: number;
}) {
  const [algo, setAlgo] = useState<SortAlgorithm>(sortingAlgorithms[algorithm] ? algorithm : "bubble");
  const [values, setValues] = useState(() => seededArray(size));
  const frames = useMemo(() => sortingAlgorithms[algo].run(values), [algo, values]);
  const playback = usePlayback(frames.length);
  const frame = frames[playback.step];
  const info = sortingAlgorithms[algo];
  const max = Math.max(...values);
  const showLabels = values.length <= 16;

  function shuffle(nextSize = values.length) {
    setValues(Array.from({ length: nextSize }, () => 5 + Math.floor(Math.random() * 95)));
    playback.reset();
  }

  return (
    <VisualizerShell
      title={info.name}
      subtitle={`Time ${info.time} · Space ${info.space} · ${info.stable ? "Stable" : "Not stable"}`}
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          {selectable && (
            <select
              value={algo}
              onChange={(e) => {
                setAlgo(e.target.value as SortAlgorithm);
                playback.reset();
              }}
              aria-label="Algorithm"
              className="h-8 rounded-lg border border-border bg-card px-2 text-sm"
            >
              {Object.entries(sortingAlgorithms).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.name}
                </option>
              ))}
            </select>
          )}
          <Stat label="Comparisons" value={frame.comparisons} />
          <Stat label="Writes" value={frame.writes} />
        </div>
      }
      legend={[
        { label: "Unsorted", className: "bg-brand/55" },
        { label: "Comparing", className: "bg-amber-400" },
        { label: "Swap / write", className: "bg-rose-500" },
        { label: algo === "insertion" ? "Key" : algo === "selection" ? "Minimum" : "Pivot", className: "bg-sky-500" },
        { label: "Sorted", className: "bg-emerald-500" },
      ]}
      footer={
        <PlaybackControls
          playback={playback}
          extra={
            <div className="flex items-center gap-1">
              <select
                value={values.length}
                onChange={(e) => shuffle(Number(e.target.value))}
                aria-label="Array size"
                className="h-9 rounded-lg border border-border bg-card px-2 text-sm"
              >
                {SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n} items
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => shuffle()}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium hover:bg-muted"
              >
                <Shuffle className="size-4" /> Shuffle
              </button>
            </div>
          }
        />
      }
    >
      <div className="relative flex h-56 items-end gap-[3px] sm:h-64 sm:gap-1" role="img" aria-label={`Array: ${frame.array.join(", ")}`}>
        {frame.array.map((value, i) => {
          const inRange = !frame.range || (i >= frame.range[0] && i <= frame.range[1]);
          const state = frame.write.includes(i)
            ? "write"
            : frame.compare.includes(i)
              ? "compare"
              : frame.pivot === i
                ? "pivot"
                : frame.sorted.includes(i)
                  ? "sorted"
                  : "idle";
          return (
            <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
              {showLabels && (
                <span
                  className={cn(
                    "font-mono text-[0.65rem] tabular-nums transition-colors sm:text-xs",
                    state === "idle" ? "text-muted-foreground" : "font-semibold text-foreground",
                  )}
                >
                  {value}
                </span>
              )}
              <div
                className={cn(
                  "w-full rounded-t-md transition-[height,background-color,opacity] duration-300 ease-out",
                  state === "idle" && "bg-brand/55",
                  state === "compare" && "bg-amber-400",
                  state === "write" && "bg-rose-500",
                  state === "pivot" && "bg-sky-500",
                  state === "sorted" && "bg-emerald-500",
                  !inRange && state !== "sorted" && "opacity-30",
                )}
                style={{ height: `${Math.max(4, (value / max) * (showLabels ? 86 : 100))}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <StatusMessage>{frame.message}</StatusMessage>
      </div>
    </VisualizerShell>
  );
}
