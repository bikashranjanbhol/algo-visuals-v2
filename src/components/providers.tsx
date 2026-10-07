"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/**
 * The session is fetched on the client so every content page can stay fully
 * static (and cacheable by the CDN and the service worker).
 */
export function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
