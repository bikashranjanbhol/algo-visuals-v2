import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { TableOfContents } from "@/components/docs/toc";
import { BinarySearchVisualizer } from "@/components/visualizers/binary-search-visualizer";
import { GraphTraversalVisualizer } from "@/components/visualizers/graph-traversal-visualizer";
import { SortingVisualizer } from "@/components/visualizers/sorting-visualizer";
import { StackQueueVisualizer } from "@/components/visualizers/stack-queue-visualizer";

export const metadata: Metadata = {
  title: "Algorithm visualizer",
  description:
    "Interactive visualizers for sorting algorithms, binary search, BFS and DFS graph traversal, stacks and queues.",
  alternates: { canonical: "/visualizer" },
};

const sections = [
  {
    id: "sorting",
    title: "Sorting algorithms",
    body: "Compare bubble, selection, insertion, merge and quick sort on the same input. Watch the comparison and write counters to feel the difference between O(n²) and O(n log n).",
    learn: "/tutorials/algorithms/sorting/bubble-sort",
    demo: <SortingVisualizer algorithm="merge" selectable size={16} />,
  },
  {
    id: "binary-search",
    title: "Binary search",
    body: "Pick any target and see how each comparison halves the search space. Sixteen items never need more than five checks.",
    learn: "/tutorials/algorithms/searching/binary-search",
    demo: <BinarySearchVisualizer />,
  },
  {
    id: "graph-traversal",
    title: "Graph traversal",
    body: "Switch between breadth-first and depth-first search, choose a starting node, and watch the queue or call stack drive the exploration.",
    learn: "/tutorials/graphs/traversal/breadth-first-search",
    demo: <GraphTraversalVisualizer algorithm="bfs" />,
  },
  {
    id: "stacks-and-queues",
    title: "Stacks & queues",
    body: "Push, pop, enqueue and dequeue to build intuition for LIFO and FIFO. Every operation runs in constant time.",
    learn: "/tutorials/data-structures/linear/stacks",
    demo: (
      <div className="grid gap-0 xl:grid-cols-2 xl:gap-6">
        <StackQueueVisualizer mode="stack" />
        <StackQueueVisualizer mode="queue" />
      </div>
    ),
  },
];

export default function VisualizerPage() {
  return (
    <main className="container-page flex items-start gap-10 py-12 sm:py-16">
      <div className="min-w-0 flex-1">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold text-brand">Visualizer</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">See algorithms in motion</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Every visualizer is interactive. Step forward and back, scrub the timeline, change the input, and read
            what happens at each step.
          </p>
          <nav aria-label="Visualizers" className="mt-6 flex flex-wrap gap-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium transition hover:border-brand/40 hover:text-brand"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </header>

        <div className="mt-12 space-y-16">
          {sections.map((section) => (
            <section key={section.id} aria-labelledby={section.id}>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div className="max-w-2xl">
                  <h2 id={section.id} className="scroll-mt-24 text-2xl font-bold tracking-tight">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-muted-foreground">{section.body}</p>
                </div>
                <Link
                  href={section.learn}
                  className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
                >
                  Read the tutorial <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="[&_figure]:mt-5 [&_figure]:mb-0">{section.demo}</div>
            </section>
          ))}
        </div>
      </div>
      <aside className="sticky top-24 hidden w-56 shrink-0 xl:block">
        <TableOfContents
          title="Visualizers"
          headings={sections.map((s) => ({ id: s.id, text: s.title, depth: 2 as const }))}
        />
      </aside>
    </main>
  );
}
