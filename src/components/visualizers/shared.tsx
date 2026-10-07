"use client";

import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SPEEDS = [1000, 650, 400, 220, 90];

/** Step-through playback over a precomputed list of frames. */
export function usePlayback(total: number) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);

  const last = Math.max(0, total - 1);
  const current = Math.min(step, last);
  const atEnd = current >= last;
  const isPlaying = playing && !atEnd;
  const delay = SPEEDS[speed] ?? SPEEDS[2];

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setStep((s) => Math.min(s + 1, last)), delay);
    return () => clearInterval(id);
  }, [isPlaying, delay, last]);

  return {
    step: current,
    total,
    isPlaying,
    atEnd,
    speed,
    setSpeed,
    setStep: (n: number) => {
      setPlaying(false);
      setStep(Math.max(0, Math.min(n, last)));
    },
    toggle: () => {
      if (isPlaying) {
        setPlaying(false);
      } else {
        if (atEnd) setStep(0);
        setPlaying(true);
      }
    },
    next: () => {
      setPlaying(false);
      setStep(Math.min(current + 1, last));
    },
    prev: () => {
      setPlaying(false);
      setStep(Math.max(current - 1, 0));
    },
    reset: () => {
      setPlaying(false);
      setStep(0);
    },
  };
}

export type Playback = ReturnType<typeof usePlayback>;

export function VisualizerShell({
  title,
  subtitle,
  legend,
  toolbar,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  legend?: { label: string; className: string }[];
  toolbar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <figure
      className="not-prose my-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      aria-label={`${title} interactive visualization`}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border bg-muted/40 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-50" />
              <span className="relative inline-flex size-2 rounded-full bg-brand" />
            </span>
            {title}
          </p>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {toolbar}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
      {legend && legend.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-4 pb-3 text-xs text-muted-foreground sm:px-5">
          {legend.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5">
              <span className={cn("size-2.5 rounded-sm", item.className)} />
              {item.label}
            </span>
          ))}
        </div>
      )}
      {footer && <div className="border-t border-border bg-muted/30 px-4 py-3 sm:px-5">{footer}</div>}
    </figure>
  );
}

export function PlaybackControls({ playback, extra }: { playback: Playback; extra?: ReactNode }) {
  const { step, total, isPlaying, atEnd, speed, setSpeed, setStep, toggle, next, prev, reset } = playback;
  return (
    <div className="flex flex-col gap-3">
      <input
        type="range"
        min={0}
        max={Math.max(0, total - 1)}
        value={step}
        onChange={(e) => setStep(Number(e.target.value))}
        aria-label="Scrub through steps"
        className="h-1.5 w-full cursor-pointer accent-[var(--brand)]"
      />
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <IconButton label="Reset" onClick={reset}>
            <RotateCcw className="size-4" />
          </IconButton>
          <IconButton label="Previous step" onClick={prev} disabled={step === 0}>
            <SkipBack className="size-4" />
          </IconButton>
          <button
            type="button"
            onClick={toggle}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-sm font-semibold text-brand-foreground shadow-sm transition hover:opacity-90"
          >
            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
            {isPlaying ? "Pause" : atEnd && step > 0 ? "Replay" : "Play"}
          </button>
          <IconButton label="Next step" onClick={next} disabled={atEnd}>
            <SkipForward className="size-4" />
          </IconButton>
        </div>
        <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          Speed
          <input
            type="range"
            min={0}
            max={SPEEDS.length - 1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-20 cursor-pointer accent-[var(--brand)]"
          />
        </label>
        {extra}
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {step + 1}/{total}
        </span>
      </div>
    </div>
  );
}

export function IconButton({
  label,
  children,
  className,
  ...props
}: { label: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function StatusMessage({ children }: { children: ReactNode }) {
  return (
    <p aria-live="polite" className="min-h-[2.75rem] rounded-xl bg-muted/70 px-3.5 py-2.5 text-sm leading-snug text-foreground/90">
      {children}
    </p>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 px-3 py-1.5">
      <p className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-mono text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}
