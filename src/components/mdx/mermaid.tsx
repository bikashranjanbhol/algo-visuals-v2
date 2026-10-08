"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Renders a ```mermaid code block as a diagram. The Mermaid library is large,
 * so it is only downloaded on pages that contain a diagram. Until it has
 * rendered (or without JavaScript) the diagram source is shown as text.
 */

function subscribeToTheme(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.classList.contains("dark");

// Mermaid's configuration is global, so render one diagram at a time.
let queue: Promise<unknown> = Promise.resolve();
// Mermaid removes any element that already has the id it renders with, so
// every render gets a new id rather than reusing the one on screen.
let renders = 0;

function renderDiagram(chart: string, dark: boolean) {
  const id = `mermaid-${++renders}`;
  const task = queue.then(async () => {
    const { default: mermaid } = await import("mermaid");
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      suppressErrorRendering: true,
      theme: dark ? "dark" : "default",
      fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
    });
    return mermaid.render(id, chart);
  });
  queue = task.catch(() => {});
  return task;
}

const diagramNames: Record<string, string> = {
  flowchart: "Flowchart",
  graph: "Flowchart",
  stateDiagram: "State diagram",
  "stateDiagram-v2": "State diagram",
  sequenceDiagram: "Sequence diagram",
  classDiagram: "Class diagram",
  erDiagram: "Entity relationship diagram",
};

export function Mermaid({ chart }: { chart: string }) {
  const dark = useSyncExternalStore(subscribeToTheme, isDark, () => false);
  const [diagram, setDiagram] = useState<{ key: string; svg: string } | null>(null);
  const key = `${dark ? "dark" : "light"}\n${chart}`;
  const shownKey = diagram?.key;

  useEffect(() => {
    // Effects run again when a hidden page is shown again; the diagram is still there.
    if (shownKey === key) return;
    let cancelled = false;
    renderDiagram(chart, dark).then(
      (result) => {
        if (!cancelled) setDiagram({ key, svg: result.svg });
      },
      () => {
        // Invalid diagram: keep showing the source text.
      },
    );
    return () => {
      cancelled = true;
    };
  }, [chart, dark, key, shownKey]);

  const svg = diagram?.svg;

  const kind = chart.trim().split(/\s+/)[0];
  const label = diagramNames[kind] ?? "Diagram";

  return (
    // overflow-anchor: the figure grows when the diagram replaces the source text; it must
    // not be the scroll anchor, or a jump to a heading just below it ends up too far down.
    <figure className="not-prose my-8 overflow-x-auto rounded-2xl border border-border bg-card p-4 [overflow-anchor:none] sm:p-6">
      {svg ? (
        <>
          <div
            role="img"
            aria-label={label}
            className="flex justify-center [&_svg]:h-auto [&_svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <pre className="sr-only">{chart}</pre>
        </>
      ) : (
        <pre aria-label={`${label} (source)`} className="overflow-x-auto font-mono text-xs leading-relaxed text-muted-foreground">
          {chart}
        </pre>
      )}
    </figure>
  );
}
