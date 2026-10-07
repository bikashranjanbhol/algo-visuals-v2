"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { TutorialIcon } from "@/components/icons";
import type { NavTutorial } from "@/lib/content-types";
import { useDismiss } from "@/lib/hooks";
import { primaryNav } from "@/lib/site";
import { accentStyles, cn } from "@/lib/utils";

export function MainNav({ tutorials }: { tutorials: NavTutorial[] }) {
  // The active section comes from the router tree, not the URL. Unmatched URLs
  // are served the prerendered 404 page, whose segment is "/_not-found" on both
  // server and client, while the browser URL (e.g. /dashboard/settings) would
  // make a pathname check disagree with the server HTML during hydration.
  const segment = useSelectedLayoutSegment();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const isActive = (href: string) => segment === href.slice(1);
  const linkClass = (active: boolean) =>
    cn(
      "inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium transition-colors",
      active ? "text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  return (
    <nav aria-label="Primary" className="hidden md:block">
      <ul className="flex items-center gap-0.5">
        {primaryNav.map((item) =>
          item.href === "/tutorials" ? (
            <li key={item.href} ref={ref} className="relative">
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-haspopup="true"
                className={cn(linkClass(isActive(item.href) || open), "relative")}
              >
                {item.title}
                <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
                {isActive(item.href) && <ActiveDot />}
              </button>
              {open && (
                <div className="absolute top-full left-0 z-50 mt-2 w-[34rem] origin-top-left animate-scale-in rounded-2xl border border-border bg-card p-2 shadow-xl shadow-black/5 dark:shadow-black/40">
                  <ul className="grid grid-cols-2 gap-1">
                    {tutorials.map((t) => (
                      <li key={t.slug}>
                        <Link
                          href={t.href}
                          onClick={close}
                          className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
                        >
                          <span
                            className={cn(
                              "grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white shadow-sm",
                              accentStyles[t.accent].gradient,
                            )}
                          >
                            <TutorialIcon name={t.icon} className="size-[1.1rem]" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold">{t.title}</span>
                            <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
                              {t.description}
                            </span>
                            <span className="mt-1.5 block text-[0.7rem] font-medium text-muted-foreground">
                              {t.level} · {t.topicCount} topics
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/tutorials"
                    onClick={close}
                    className="mt-1 flex items-center justify-between rounded-xl bg-muted/60 px-4 py-2.5 text-sm font-medium hover:bg-muted"
                  >
                    Browse all tutorials
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              )}
            </li>
          ) : (
            <li key={item.href}>
              <Link href={item.href} className={cn(linkClass(isActive(item.href)), "relative")}>
                {item.title}
                {isActive(item.href) && <ActiveDot />}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}

function ActiveDot() {
  return <span className="absolute inset-x-3 -bottom-[14px] h-0.5 rounded-full bg-brand" aria-hidden />;
}
