"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DocsNavTree } from "@/components/docs/docs-nav-tree";
import { LogoMark } from "@/components/icons";
import type { NavTutorial } from "@/lib/content-types";
import { useLockBodyScroll } from "@/lib/hooks";
import { primaryNav, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./theme-toggle";

export function MobileNav({ tree }: { tree: NavTutorial[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
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
                <p className="mt-6 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:mt-0">
                  Tutorials
                </p>
                <DocsNavTree tree={tree} onNavigate={close} />
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
