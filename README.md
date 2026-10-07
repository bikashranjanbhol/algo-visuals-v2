# AlgoVisuals

**Learn algorithms by watching them work.** AlgoVisuals is a modern, responsive tutorial website for
algorithms and data structures. It has interactive visualizers, a three-level learning path
(Tutorials → Chapters → Topics), progress tracking, sign-in, and full Progressive Web App support.
It is built with Next.js and runs on Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbikashranjanbhol%2Falgo-visuals-v2&project-name=algo-visuals&env=AUTH_SECRET&envDescription=Secret%20used%20to%20sign%20session%20cookies.%20Generate%20one%20with%3A%20openssl%20rand%20-base64%2032&envLink=https%3A%2F%2Fauthjs.dev%2Fgetting-started%2Finstallation%23setup-environment)

## Features

### Layout

| Area                  | What it does                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Header**            | Logo and title; primary menus (Tutorials mega-menu, Visualizer, Dashboard, About); ⌘K search; GitHub link; theme toggle; **Sign in / Sign out** account menu |
| **Left sidebar**      | Collapsible **Tutorials → Chapters → Topics** tree, a topic filter, completion checkmarks and per-tutorial progress. Becomes a slide-out drawer on mobile. |
| **Main content**      | MDX articles with syntax-highlighted code (Python / JavaScript / Java tabs), callouts, quizzes and interactive visualizers                               |
| **Right sidebar**     | "On this page" **heading navigator** with scroll-spy, tutorial progress, and edit/report links. Becomes a sticky collapsible bar below `xl`.             |
| **Footer**            | Site links, tutorial list, install-app button and license info                                                                                          |

### Learning experience

- **4 tutorials and 28 topics**: Algorithms Fundamentals, Data Structures, Graph Algorithms and Dynamic Programming.
- **4 interactive visualizers**, all with play, pause, step and scrub controls:
  - sorting (bubble, selection, insertion, merge and quick sort)
  - binary search
  - BFS and DFS graph traversal
  - stacks and queues
- **Progress tracking**: mark topics complete, "continue where you left off", and a dashboard with stats.
  Progress is stored on the device, so it also works offline and without an account.
- **Search palette** (⌘K / Ctrl K or `/`) across topics, section headings and tutorials.
- **Shared code-language choice**: picking Python once switches every code sample on the site.
- **Quizzes** at the end of topics, with explanations.

### Platform

- **PWA**
  - web app manifest with maskable icons, shortcuts and screenshots
  - service worker with network-first pages, cache-first assets and an offline fallback page
  - **Save for offline** on any tutorial, which downloads every page and its assets
  - install prompt, with "Add to Home Screen" steps on iOS
  - online/offline status toasts
- **Authentication** with [Auth.js](https://authjs.dev):
  - GitHub and Google OAuth, each switched on by its environment variables
  - a password-less demo account, so the sign-in flow works right after deploying
  - a protected `/dashboard`, checked on the server
- **Fast and static**: every tutorial page is prerendered at build time. The session is read on the client, so
  pages stay CDN-cacheable.
- **Responsive and accessible**:
  - layouts for phone, tablet and desktop
  - keyboard navigation and visible focus states
  - skip link and ARIA labels
  - respects `prefers-reduced-motion`
- **Light, dark and system themes**, with no flash on load.
- **SEO**: per-page metadata, Open Graph image, sitemap, robots.txt, and JSON-LD for breadcrumbs and articles.

## Tech stack

Next.js 16 (App Router, Cache Components, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 ·
MDX (`@mdx-js/mdx`) with Shiki via `rehype-pretty-code` · Auth.js v5 · Lucide icons · Geist font

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local   # then fill in AUTH_SECRET (see below)
npm run dev                  # http://localhost:3000
```

In development the demo sign-in works even without `AUTH_SECRET`. The service worker registers only in
production builds. To try the PWA locally:

```bash
npm run build && npm start
```

### Scripts

| Command                 | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| `npm run dev`           | Start the dev server                                           |
| `npm run build`         | Production build (prerenders every tutorial page)              |
| `npm start`             | Serve the production build                                     |
| `npm run lint`          | ESLint                                                         |
| `npm run typecheck`     | TypeScript type check                                          |
| `npm run check:content` | Validate `content/` (meta files, frontmatter, MDX compilation) |
| `npm run icons`         | Regenerate the favicon and PWA icons from the SVG design       |

## Environment variables

| Variable                                   | Required       | Description                                                                                       |
| ------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------- |
| `AUTH_SECRET`                              | In production  | Signs session cookies. Generate with `npx auth secret` or `openssl rand -base64 32`.             |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`    | No             | Enables "Continue with GitHub". Callback URL: `https://<domain>/api/auth/callback/github`         |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`    | No             | Enables "Continue with Google". Callback URL: `https://<domain>/api/auth/callback/google`         |
| `AUTH_DEMO_LOGIN`                          | No             | Set to `false` to hide the password-less demo account.                                           |
| `NEXT_PUBLIC_SITE_URL`                     | No             | Canonical URL for metadata and the sitemap. Defaults to the Vercel production URL.               |

## Deploying to Vercel

1. Click **Deploy with Vercel** above, or import this repository at [vercel.com/new](https://vercel.com/new).
   Vercel detects Next.js automatically, so no build settings are needed.
2. Add `AUTH_SECRET` when prompted, under **Settings → Environment Variables**.
3. *(Optional)* Create a GitHub OAuth app or Google OAuth client and add its credentials, using the callback URLs
   in the table above.
4. Deploy. Every push to the production branch redeploys, and each pull request gets a preview URL.

The site needs HTTPS for the service worker and install prompt, and Vercel provides it automatically.

## Project structure

```
content/tutorials/          Tutorial content: meta.json + MDX topics (see content/README.md)
public/sw.js                Service worker (offline caching, "save for offline")
public/icons/               PWA icons (generated by scripts/generate-icons.mjs)
src/app/                    Routes: home, tutorials/[tutorial]/[chapter]/[topic], visualizer,
                            dashboard, signin, offline, about, manifest, sitemap, robots, OG image
src/auth.ts                 Auth.js configuration (providers switched on by environment variables)
src/components/layout/      Header, primary nav, mobile drawer, search palette, theme toggle, footer
src/components/docs/        Sidebar tree, table of contents, breadcrumbs, pager, progress UI
src/components/mdx/         Components available inside MDX (Callout, Tabs, Quiz, code blocks…)
src/components/visualizers/ Sorting, binary search, graph traversal, stack/queue visualizers
src/components/pwa/         Service worker registration, install prompt, offline UI
src/lib/content.ts          Reads the content tree and compiles MDX at build time
```

## Writing tutorials

Tutorials are plain MDX files, and adding one needs no code changes. Create
`content/tutorials/<tutorial>/<chapter>/<topic>.mdx`, list it in the tutorial's `meta.json`, and run
`npm run check:content`. [`content/README.md`](content/README.md) documents the format and every available
component.
