"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TutorialNav } from "@/components/docs/tutorial-nav";
import { LogoMark, TutorialIcon } from "@/components/icons";
import type { TutorialSummary } from "@/lib/content-types";
import { useLockBodyScroll } from "@/lib/hooks";
import { primaryNav, siteConfig } from "@/lib/site";
import { useCurrentTutorialNav } from "@/lib/tutorial-nav-store";
import { accentStyles, cn } from "@/lib/utils";
import { ThemeSwitcher } from "./theme-toggle";

/** How many tutorials the menu lists outside a tutorial before linking to the full catalog. */
const LIST_LIMIT = 8;

export function MobileNav({ tutorials }: { tutorials: TutorialSummary[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Set by the tutorial layout while a tutorial is open.
  const current = useCurrentTutorialNav();
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
      >
        <Menu className="size-5" />
      </button>
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[90] lg:hidden">
            <div className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-sm" onClick={close} aria-hidden />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] animate-slide-in-left flex-col border-r border-border bg-background shadow-2xl"
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
                <Link href="/" onClick={close} className="flex items-center gap-2 font-bold">
                  <LogoMark className="size-7" />
                  {siteConfig.name}
                </Link>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4">
                <nav aria-label="Primary" className="md:hidden">
                  <ul className="grid grid-cols-2 gap-1.5">
                    {primaryNav.map((item) => {
                      const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={close}
                            className={cn(
                              "block rounded-lg border px-3 py-2 text-sm font-medium",
                              active ? "border-brand/40 bg-brand-soft text-brand" : "border-border hover:bg-muted",
                            )}
                          >
                            {item.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
                {current ? (
                  <div className="mt-6 md:mt-0">
                    <TutorialNav tutorial={current.tutorial} tutorials={current.tutorials} onNavigate={close} />
                  </div>
                ) : (
                  <TutorialList tutorials={tutorials} onNavigate={close} />
                )}
              </div>
              <div className="shrink-0 border-t border-border p-4">
                <ThemeSwitcher />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function TutorialList({ tutorials, onNavigate }: { tutorials: TutorialSummary[]; onNavigate: () => void }) {
  return (
    <div className="mt-6 md:mt-0">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tutorials</p>
      <ul className="space-y-0.5">
        {tutorials.slice(0, LIST_LIMIT).map((t) => (
          <li key={t.slug}>
            <Link
              href={t.href}
              onClick={onNavigate}
              className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium hover:bg-muted"
            >
              <span className={cn("grid size-7 shrink-0 place-items-center rounded-md bg-gradient-to-br text-white", accentStyles[t.accent].gradient)}>
                <TutorialIcon name={t.icon} className="size-4" />
              </span>
              <span className="truncate">{t.title}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/tutorials"
        onClick={onNavigate}
        className="mt-2 flex items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-brand hover:bg-brand-soft"
      >
        {tutorials.length > LIST_LIMIT ? `Browse all ${tutorials.length} tutorials` : "Browse all tutorials"}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
