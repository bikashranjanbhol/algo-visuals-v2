import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { GitHubIcon } from "@/components/icons";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Why AlgoVisuals exists, how it's built, and how to contribute a tutorial.",
  alternates: { canonical: "/about" },
};

const stack = [
  { name: "Next.js 16", detail: "App Router, Cache Components, static prerendering" },
  { name: "React 19", detail: "Server Components with interactive client islands" },
  { name: "Tailwind CSS 4", detail: "Design tokens, dark mode and responsive layout" },
  { name: "MDX + Shiki", detail: "Tutorials written in Markdown with build-time syntax highlighting" },
  { name: "Auth.js", detail: "GitHub, Google and demo sign-in with JWT sessions" },
  { name: "Service worker", detail: "Installable PWA with offline reading" },
];

const faqs = [
  {
    q: "Is AlgoVisuals free?",
    a: "Yes. Every tutorial and visualizer is free to use.",
  },
  {
    q: "Do I need an account?",
    a: "No. You can read everything and track progress without signing in; progress is saved in your browser. Signing in unlocks your personal dashboard.",
  },
  {
    q: "How does offline mode work?",
    a: "Pages you visit are cached automatically by the service worker. On any tutorial overview, choose “Save for offline” to download the whole tutorial at once. Installing the app gives you a home-screen icon and a full-screen window.",
  },
  {
    q: "Which programming languages are covered?",
    a: "Implementations are shown in Python, JavaScript and Java. Pick a tab once and every code sample on the site switches to that language.",
  },
  {
    q: "Can I contribute a tutorial?",
    a: "Please do! Tutorials are MDX files in the content folder. The authoring guide in the repository explains the format and the components you can use.",
  },
];

export default function AboutPage() {
  return (
    <main className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold text-brand">About</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Making algorithms visible</h1>
        <div className="prose prose-article mt-6 max-w-none text-lg dark:prose-invert">
          <p>
            Algorithms are usually taught as static code and diagrams. But an algorithm is a process: something
            that <em>moves</em>. {siteConfig.name} pairs clear explanations with interactive visualizations so you can
            watch every comparison, swap and step, at your own pace.
          </p>
          <p>
            Each tutorial is a short path of chapters and topics. Topics end with a quick quiz, and your progress is
            tracked as you go so it&apos;s easy to come back later.
          </p>
        </div>

        <h2 className="mt-14 text-2xl font-bold tracking-tight">How it&apos;s built</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {stack.map((item) => (
            <li key={item.name} className="rounded-2xl border border-border bg-card p-4">
              <p className="font-semibold">{item.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-14 text-2xl font-bold tracking-tight">Frequently asked questions</h2>
        <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
          {faqs.map((faq) => (
            <details key={faq.q} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {faq.q}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 leading-relaxed text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start gap-4 rounded-2xl border border-border bg-muted/40 p-6 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="font-semibold">Built in the open</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Found a typo or want to add a topic? Contributions are welcome.
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={siteConfig.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background hover:opacity-90"
            >
              <GitHubIcon className="size-4" /> View on GitHub
            </a>
            <Link href="/tutorials" className="inline-flex h-10 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:bg-muted">
              Start learning
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
