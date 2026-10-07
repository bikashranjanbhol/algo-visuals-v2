import type { Accent } from "./content-types";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Literal class names per accent so Tailwind can see them at build time. */
export const accentStyles: Record<
  Accent,
  { gradient: string; soft: string; text: string; ring: string; bar: string; dot: string }
> = {
  violet: {
    gradient: "from-violet-500 to-fuchsia-500",
    soft: "bg-violet-500/10 dark:bg-violet-400/10",
    text: "text-violet-600 dark:text-violet-300",
    ring: "ring-violet-500/20",
    bar: "bg-violet-500",
    dot: "bg-violet-500",
  },
  sky: {
    gradient: "from-sky-500 to-indigo-500",
    soft: "bg-sky-500/10 dark:bg-sky-400/10",
    text: "text-sky-600 dark:text-sky-300",
    ring: "ring-sky-500/20",
    bar: "bg-sky-500",
    dot: "bg-sky-500",
  },
  emerald: {
    gradient: "from-emerald-500 to-teal-500",
    soft: "bg-emerald-500/10 dark:bg-emerald-400/10",
    text: "text-emerald-600 dark:text-emerald-300",
    ring: "ring-emerald-500/20",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  amber: {
    gradient: "from-amber-500 to-orange-500",
    soft: "bg-amber-500/10 dark:bg-amber-400/10",
    text: "text-amber-600 dark:text-amber-300",
    ring: "ring-amber-500/20",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  rose: {
    gradient: "from-rose-500 to-pink-500",
    soft: "bg-rose-500/10 dark:bg-rose-400/10",
    text: "text-rose-600 dark:text-rose-300",
    ring: "ring-rose-500/20",
    bar: "bg-rose-500",
    dot: "bg-rose-500",
  },
};
