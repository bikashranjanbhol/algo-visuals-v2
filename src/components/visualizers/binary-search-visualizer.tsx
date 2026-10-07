"use client";

import { Dices } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { PlaybackControls, Stat, StatusMessage, VisualizerShell, usePlayback } from "./shared";

const VALUES = [3, 8, 12, 17, 21, 26, 30, 34, 41, 47, 52, 58, 63, 71, 79, 86];

type Frame = {
  lo: number;
  hi: number;
  mid?: number;
  found?: number;
  message: string;
  comparisons: number;
};

function search(values: number[], target: number): Frame[] {
  const frames: Frame[] = [];
  let lo = 0;
  let hi = values.length - 1;
  let comparisons = 0;
  frames.push({ lo, hi, comparisons, message: `Search for ${target}. The whole array (indices 0–${hi}) is the search space.` });

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    frames.push({ lo, hi, mid, comparisons, message: `mid = ⌊(${lo} + ${hi}) / 2⌋ = ${mid}. Check values[${mid}] = ${values[mid]}.` });
    comparisons++;
    if (values[mid] === target) {
      frames.push({ lo, hi, mid, found: mid, comparisons, message: `${values[mid]} equals the target. Found it at index ${mid} after ${comparisons} comparison${comparisons > 1 ? "s" : ""}!` });
      return frames;
    }
    if (values[mid] < target) {
      frames.push({ lo, hi, mid, comparisons, message: `${values[mid]} < ${target}, so the target can only be to the right. Discard indices ${lo}–${mid}.` });
      lo = mid + 1;
    } else {
      frames.push({ lo, hi, mid, comparisons, message: `${values[mid]} > ${target}, so the target can only be to the left. Discard indices ${mid}–${hi}.` });
      hi = mid - 1;
    }
    if (lo <= hi) frames.push({ lo, hi, comparisons, message: `The search space is now indices ${lo}–${hi} (${hi - lo + 1} item${hi === lo ? "" : "s"}).` });
  }
  frames.push({ lo, hi, comparisons, message: `The search space is empty (lo > hi), so ${target} is not in the array.` });
  return frames;
}

export function BinarySearchVisualizer() {
  const [target, setTarget] = useState(58);
  const frames = useMemo(() => search(VALUES, target), [target]);
  const playback = usePlayback(frames.length);
  const frame = frames[playback.step];
  const linearSteps = VALUES.indexOf(target) === -1 ? VALUES.length : VALUES.indexOf(target) + 1;

  function pickTarget(value: number) {
    setTarget(value);
    playback.reset();
  }

  return (
    <VisualizerShell
      title="Binary search"
      subtitle="Time O(log n) · Space O(1) · Requires sorted input"
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <Stat label="Comparisons" value={frame.comparisons} />
          <Stat label="Linear search" value={linearSteps} />
        </div>
      }
      legend={[
        { label: "Search space", className: "bg-brand/25 ring-1 ring-brand/50" },
        { label: "Middle", className: "bg-amber-400" },
        { label: "Found", className: "bg-emerald-500" },
        { label: "Discarded", className: "bg-muted" },
      ]}
      footer={
        <PlaybackControls
          playback={playback}
          extra={
            <div className="flex items-center gap-1">
              <label className="flex items-center gap-1.5 text-sm">
                <span className="text-xs text-muted-foreground">Target</span>
                <input
                  type="number"
                  value={target}
                  min={0}
                  max={99}
                  onChange={(e) => pickTarget(Number(e.target.value))}
                  className="h-9 w-16 rounded-lg border border-border bg-card px-2 font-mono text-sm"
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  pickTarget(Math.random() < 0.8 ? VALUES[Math.floor(Math.random() * VALUES.length)] : 1 + Math.floor(Math.random() * 98))
                }
                aria-label="Random target"
                title="Random target"
                className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Dices className="size-4" />
              </button>
            </div>
          }
        />
      }
    >
      <div className="scrollbar-thin overflow-x-auto pb-2">
        <div className="grid min-w-[36rem] gap-1.5" style={{ gridTemplateColumns: `repeat(${VALUES.length}, minmax(0, 1fr))` }}>
          {VALUES.map((value, i) => {
            const inSpace = i >= frame.lo && i <= frame.hi;
            const isMid = frame.mid === i;
            const isFound = frame.found === i;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => pickTarget(value)}
                  title={`Search for ${value}`}
                  className={cn(
                    "grid aspect-square w-full place-items-center rounded-lg border font-mono text-sm font-semibold transition-all duration-300",
                    isFound && "scale-110 border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
                    !isFound && isMid && "scale-105 border-amber-400 bg-amber-400 text-amber-950",
                    !isFound && !isMid && inSpace && "border-brand/50 bg-brand/15",
                    !isFound && !isMid && !inSpace && "border-transparent bg-muted text-muted-foreground/50",
                  )}
                >
                  {value}
                </button>
                <span className="font-mono text-[0.65rem] text-muted-foreground">{i}</span>
                <span className="h-4 font-mono text-[0.65rem] font-bold text-brand">
                  {[i === frame.lo && "lo", isMid && "mid", i === frame.hi && "hi"].filter(Boolean).join("·")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3">
        <StatusMessage>{frame.message}</StatusMessage>
      </div>
    </VisualizerShell>
  );
}
