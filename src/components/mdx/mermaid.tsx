"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";

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

function renderDiagram(id: string, chart: string, dark: boolean) {
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
  const reactId = useId();
  const dark = useSyncExternalStore(subscribeToTheme, isDark, () => false);
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}-${dark ? "dark" : "light"}`;
    renderDiagram(id, chart, dark).then(
      (result) => {
        if (!cancelled) setSvg(result.svg);
      },
      () => {
        // Invalid diagram: keep showing the source text.
      },
    );
    return () => {
      cancelled = true;
    };
  }, [chart, dark, reactId]);

  const kind = chart.trim().split(/\s+/)[0];
  const label = diagramNames[kind] ?? "Diagram";

  return (
    <figure className="not-prose my-8 overflow-x-auto rounded-2xl border border-border bg-card p-4 sm:p-6">
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
