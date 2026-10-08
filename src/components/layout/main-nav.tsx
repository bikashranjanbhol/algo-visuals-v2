"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { TutorialIcon } from "@/components/icons";
import { PendingHint } from "@/components/ui/pending-hint";
import type { TutorialSummary } from "@/lib/content-types";
import { useDismiss } from "@/lib/hooks";
import { primaryNav } from "@/lib/site";
import { accentStyles, cn } from "@/lib/utils";

/** The menu shows this many tutorials; the rest are a click away on /tutorials. */
const MENU_LIMIT = 8;

export function MainNav({ tutorials }: { tutorials: TutorialSummary[] }) {
  // The active section comes from the router tree, not the URL. Unmatched URLs
  // are served the prerendered 404 page, whose segment is "/_not-found" on both
  // server and client, while the browser URL (e.g. /dashboard/settings) would
  // make a pathname check disagree with the server HTML during hydration.
  const segment = useSelectedLayoutSegment();
  const pathname = usePathname();
  // Remember which page the menu was opened on: after a click it stays open
  // (the link shows a spinner) until the new page arrives and the URL changes.
  const [openAt, setOpenAt] = useState<string | null>(null);
  // Forget it once the URL changes, so coming back to the same page (Back/
  // Forward) doesn't reopen it. Adjusting state during render is React's
  // recommended way to reset state when an input changes.
  if (openAt !== null && openAt !== pathname) setOpenAt(null);
  const open = openAt === pathname;
  const ref = useRef<HTMLLIElement>(null);
  const close = useCallback(() => setOpenAt(null), []);
  useDismiss(ref, open, close);
  // A link to the page already shown doesn't change the URL, so close for it.
  const closeIfCurrent = (href: string) => {
    if (href === pathname) close();
  };

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
                onClick={() => (open ? close() : setOpenAt(pathname))}
                aria-expanded={open}
                aria-haspopup="true"
                className={cn(linkClass(isActive(item.href) || open), "relative")}
              >
                {item.title}
                <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
                {isActive(item.href) && <ActiveDot />}
              </button>
              {open && (
                <div className="scrollbar-thin absolute top-full left-0 z-50 mt-2 max-h-[calc(100dvh-6rem)] w-[34rem] origin-top-left animate-scale-in overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-xl shadow-black/5 dark:shadow-black/40">
                  <ul className="grid grid-cols-2 gap-1">
                    {tutorials.slice(0, MENU_LIMIT).map((t) => (
                      <li key={t.slug}>
                        <Link
                          href={t.href}
                          onClick={() => closeIfCurrent(t.href)}
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
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold">{t.title}</span>
                            <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
                              {t.description}
                            </span>
                            <span className="mt-1.5 block text-[0.7rem] font-medium text-muted-foreground">
                              {t.level} · {t.topicCount} topics
                            </span>
                          </span>
                          <PendingHint className="mt-0.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/tutorials"
                    onClick={() => closeIfCurrent("/tutorials")}
                    className="mt-1 flex items-center justify-between rounded-xl bg-muted/60 px-4 py-2.5 text-sm font-medium hover:bg-muted"
                  >
                    {tutorials.length > MENU_LIMIT ? `Browse all ${tutorials.length} tutorials` : "Browse all tutorials"}
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
