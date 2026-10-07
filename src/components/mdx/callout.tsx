import { CircleAlert, Info, Lightbulb, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const variants = {
  note: {
    icon: Info,
    label: "Note",
    className: "border-sky-500/30 bg-sky-500/[0.06] [--callout:var(--color-sky-600)] dark:[--callout:var(--color-sky-300)]",
  },
  tip: {
    icon: Lightbulb,
    label: "Tip",
    className:
      "border-emerald-500/30 bg-emerald-500/[0.06] [--callout:var(--color-emerald-600)] dark:[--callout:var(--color-emerald-300)]",
  },
  warning: {
    icon: TriangleAlert,
    label: "Warning",
    className:
      "border-amber-500/40 bg-amber-500/[0.07] [--callout:var(--color-amber-600)] dark:[--callout:var(--color-amber-300)]",
  },
  danger: {
    icon: CircleAlert,
    label: "Careful",
    className: "border-rose-500/30 bg-rose-500/[0.06] [--callout:var(--color-rose-600)] dark:[--callout:var(--color-rose-300)]",
  },
} as const;

export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: keyof typeof variants;
  title?: string;
  children: ReactNode;
}) {
  const variant = variants[type] ?? variants.note;
  const Icon = variant.icon;
  return (
    <aside className={cn("my-6 flex gap-3 rounded-xl border px-4 py-3.5 text-[0.95rem]", variant.className)}>
      <Icon className="mt-1 size-[1.1rem] shrink-0 text-[var(--callout)]" aria-hidden />
      <div className="min-w-0 flex-1 [&>:first-child]:mt-0 [&>:last-child]:mb-0 [&_p]:my-2">
        <p className="!mt-0 !mb-1 font-semibold text-[var(--callout)]">{title ?? variant.label}</p>
        {children}
      </div>
    </aside>
  );
}
