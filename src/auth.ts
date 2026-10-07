import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

/**
 * Providers switch on based on environment variables, so the same code works
 * locally and on Vercel:
 *   GitHub: AUTH_GITHUB_ID + AUTH_GITHUB_SECRET
 *   Google: AUTH_GOOGLE_ID + AUTH_GOOGLE_SECRET
 *   Demo:   on unless AUTH_DEMO_LOGIN=false. Signs in with just a name and
 *           email, no password, so the flow can be tried without OAuth apps.
 */
const providers: Provider[] = [];

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) providers.push(GitHub);
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) providers.push(Google);
if (process.env.AUTH_DEMO_LOGIN !== "false") {
  providers.push(
    Credentials({
      id: "demo",
      name: "Demo account",
      credentials: {
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "email" },
      },
      authorize(credentials) {
        const name = String(credentials?.name ?? "").trim().slice(0, 60);
        const email = String(credentials?.email ?? "").trim().toLowerCase().slice(0, 120);
        if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
        return { id: email, name, email };
      },
    }),
  );
}

/** Public provider list for the sign-in page. User options (like the demo id) live under `options`. */
export const authProviders = providers.map((provider) => {
  const p = typeof provider === "function" ? provider() : provider;
  const options = (p as { options?: { id?: string; name?: string } }).options;
  return { id: options?.id ?? p.id, name: options?.name ?? p.name, type: p.type };
});

/** In production a real AUTH_SECRET is required; development uses a throwaway one. */
export const isAuthConfigured = Boolean(process.env.AUTH_SECRET) || process.env.NODE_ENV !== "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  secret: process.env.AUTH_SECRET ?? (process.env.NODE_ENV !== "production" ? "dev-only-secret-not-for-production" : undefined),
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/signin" },
});
