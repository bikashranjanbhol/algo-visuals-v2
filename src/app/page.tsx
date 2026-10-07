import {
  ArrowRight,
  BookOpenCheck,
  Code2,
  LineChart,
  ListTree,
  MonitorSmartphone,
  MousePointerClick,
  Sparkles,
  WifiOff,
} from "lucide-react";
import Link from "next/link";
import { ContinueLearning } from "@/components/continue-learning";
import { InstallButton } from "@/components/pwa/install-button";
import { TutorialCard } from "@/components/tutorial-card";
import { SortingVisualizer } from "@/components/visualizers/sorting-visualizer";
import { getTutorials } from "@/lib/content";
import { siteConfig } from "@/lib/site";

const features = [
  {
    icon: MousePointerClick,
    title: "Interactive visualizers",
    body: "Play, pause and scrub through every comparison and swap. See exactly what the code is doing.",
  },
  {
    icon: ListTree,
    title: "A clear learning path",
    body: "Tutorials split into chapters and bite-sized topics, so you always know what to learn next.",
  },
  {
    icon: Code2,
    title: "Code in three languages",
    body: "Every implementation in Python, JavaScript and Java. Pick a language once and every sample follows.",
  },
  {
    icon: LineChart,
    title: "Track your progress",
    body: "Mark topics complete, pick up where you left off, and watch your tutorial progress bars fill up.",
  },
  {
    icon: WifiOff,
    title: "Works offline",
    body: "Install AlgoVisuals as an app and save whole tutorials to read on a plane, a train, or anywhere.",
  },
  {
    icon: BookOpenCheck,
    title: "Quizzes that stick",
    body: "Quick checks at the end of each topic make sure the ideas land before you move on.",
  },
];

export default function HomePage() {
  const tutorials = getTutorials();
  const topicCount = tutorials.reduce((n, t) => n + t.topicCount, 0);
  const first = tutorials[0]?.chapters[0]?.topics[0];

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div className="pointer-events-none absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-500/25 via-fuchsia-500/15 to-transparent blur-3xl" />
        <div className="container-page relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div className="max-w-2xl">
            <Link
              href="/visualizer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 py-1 pr-3 pl-1 text-sm shadow-sm backdrop-blur transition hover:border-brand/40"
            >
              <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-brand-foreground">New</span>
              <span className="text-muted-foreground">Graph traversal visualizer is live</span>
              <ArrowRight className="size-3.5 text-muted-foreground" />
            </Link>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Learn algorithms by{" "}
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-pink-400">
                watching them work
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              Clear, visual tutorials on algorithms and data structures. Step through animations, read code in
              your favorite language, and test yourself as you go. Free and available offline.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={first?.href ?? "/tutorials"}
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-6 font-semibold text-brand-foreground shadow-lg shadow-brand/25 transition hover:opacity-90"
              >
                Start learning
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/tutorials"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-card px-6 font-semibold transition hover:bg-muted"
              >
                Browse tutorials
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6">
              {[
                { label: "Tutorials", value: tutorials.length },
                { label: "Topics", value: topicCount },
                { label: "Visualizers", value: 4 },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                  <dd className="mt-1 text-3xl font-bold tracking-tight">{stat.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 max-w-lg">
              <ContinueLearning />
            </div>
          </div>
          <div className="relative min-w-0">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 blur-2xl" aria-hidden />
            <div className="relative [&>figure]:my-0 [&>figure]:shadow-2xl [&>figure]:shadow-brand/10">
              <SortingVisualizer algorithm="quick" selectable size={12} />
            </div>
          </div>
        </div>
      </section>

      {/* Tutorials */}
      <section className="container-page py-20">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-brand">Tutorials</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Pick a path and start exploring</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Start with the fundamentals or jump straight into graphs and dynamic programming. Every tutorial is
              organized into chapters and topics.
            </p>
          </div>
          <Link href="/tutorials" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
            View all tutorials <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {tutorials.map((tutorial) => (
            <TutorialCard key={tutorial.slug} tutorial={tutorial} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-muted/30">
        <div className="container-page py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-brand">Why AlgoVisuals</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Built for real understanding</h2>
            <p className="mt-3 text-muted-foreground">
              Reading about an algorithm is one thing. Watching it run, step by step, is how it finally clicks.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6 transition hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 px-6 py-14 text-white shadow-2xl shadow-fuchsia-500/20 sm:px-12">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-white/80">
                <MonitorSmartphone className="size-4" /> Progressive Web App
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Take {siteConfig.name} anywhere</h2>
              <p className="mt-3 max-w-xl text-white/80">
                Install it on your phone, tablet or desktop. It launches like a native app and keeps your saved
                tutorials available without a connection.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <InstallButton
                className="bg-white text-violet-700 hover:bg-white/90"
                fallback={
                  <Link
                    href="/tutorials"
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-violet-700 transition hover:bg-white/90"
                  >
                    Browse tutorials <ArrowRight className="size-4" />
                  </Link>
                }
              />
              <Link
                href="/signin"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/30 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Sparkles className="size-4" /> Create a free account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
