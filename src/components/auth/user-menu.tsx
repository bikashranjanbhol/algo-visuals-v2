"use client";

import { LayoutDashboard, LogIn, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useRef, useState } from "react";
import { useDismiss } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function Avatar({ name, image, className }: { name?: string | null; image?: string | null; className?: string }) {
  const initials = (name ?? "?")
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (image) {
    return (
      <Image src={image} alt="" width={36} height={36} unoptimized className={cn("size-8 rounded-full object-cover", className)} />
    );
  }
  return (
    <span
      className={cn(
        "grid size-8 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white",
        className,
      )}
      aria-hidden
    >
      {initials || <User className="size-4" />}
    </span>
  );
}

export function UserMenu() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  if (status === "loading") {
    return <div className="h-9 w-9 animate-pulse rounded-lg bg-muted sm:w-[5.5rem]" aria-hidden />;
  }

  if (!session?.user) {
    const callbackUrl = pathname && pathname !== "/signin" ? `?callbackUrl=${encodeURIComponent(pathname)}` : "";
    return (
      <Link
        href={`/signin${callbackUrl}`}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-2.5 text-sm font-semibold text-background shadow-sm transition hover:opacity-90 sm:px-3.5"
      >
        <LogIn className="size-4" />
        <span className="sr-only sm:not-sr-only">Sign in</span>
      </Link>
    );
  }

  const { user } = session;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="grid size-9 place-items-center rounded-full ring-2 ring-transparent transition hover:ring-brand/30 focus-visible:ring-brand"
      >
        <Avatar name={user.name} image={user.image} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-2 w-64 origin-top-right animate-scale-in overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/5 dark:shadow-black/40"
        >
          <div className="flex items-center gap-3 border-b border-border p-4">
            <Avatar name={user.name} image={user.image} className="size-10" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name ?? "Learner"}</p>
              {user.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
            </div>
          </div>
          <div className="p-1.5">
            <Link
              href="/dashboard"
              role="menuitem"
              onClick={close}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              <LayoutDashboard className="size-4 text-muted-foreground" /> My dashboard
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => signOut({ redirectTo: "/" })}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
