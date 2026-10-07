"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { PlaybackControls, StatusMessage, VisualizerShell, usePlayback } from "./shared";

type Algorithm = "bfs" | "dfs";

const NODES: Record<string, { x: number; y: number }> = {
  A: { x: 70, y: 70 },
  B: { x: 230, y: 45 },
  C: { x: 400, y: 70 },
  D: { x: 545, y: 55 },
  E: { x: 95, y: 245 },
  F: { x: 260, y: 185 },
  G: { x: 420, y: 255 },
  H: { x: 560, y: 210 },
};

const EDGES: [string, string][] = [
  ["A", "B"],
  ["A", "E"],
  ["B", "C"],
  ["B", "F"],
  ["C", "D"],
  ["C", "G"],
  ["E", "F"],
  ["F", "G"],
  ["D", "H"],
  ["G", "H"],
];

const ADJ: Record<string, string[]> = Object.fromEntries(Object.keys(NODES).map((n) => [n, [] as string[]]));
for (const [u, v] of EDGES) {
  ADJ[u].push(v);
  ADJ[v].push(u);
}
Object.values(ADJ).forEach((list) => list.sort());

type Frame = {
  current?: string;
  edge?: [string, string];
  visited: string[];
  frontier: string[];
  tree: [string, string][];
  order: string[];
  container: string[];
  message: string;
};

function bfs(start: string): Frame[] {
  const frames: Frame[] = [];
  const discovered = new Set([start]);
  const visited: string[] = [];
  const tree: [string, string][] = [];
  const queue = [start];
  const snap = (f: Partial<Frame> & { message: string }) =>
    frames.push({
      visited: [...visited],
      frontier: queue.slice(),
      tree: tree.slice(),
      order: [...visited],
      container: queue.slice(),
      ...f,
    });

  snap({ message: `Start at ${start}: mark it discovered and add it to the queue.` });
  while (queue.length) {
    const u = queue.shift()!;
    visited.push(u);
    snap({ current: u, message: `Dequeue ${u} from the front and visit it.` });
    for (const v of ADJ[u]) {
      if (!discovered.has(v)) {
        discovered.add(v);
        queue.push(v);
        tree.push([u, v]);
        snap({ current: u, edge: [u, v], message: `${v} is undiscovered: mark it and enqueue it at the back.` });
      } else {
        snap({ current: u, edge: [u, v], message: `${v} was already discovered. Skip it.` });
      }
    }
  }
  snap({ message: `Queue is empty. BFS visited every reachable node level by level: ${visited.join(" → ")}.` });
  return frames;
}

function dfs(start: string): Frame[] {
  const frames: Frame[] = [];
  const visited: string[] = [];
  const tree: [string, string][] = [];
  const stack: string[] = [];
  const snap = (f: Partial<Frame> & { message: string }) =>
    frames.push({
      visited: [...visited],
      frontier: stack.slice(),
      tree: tree.slice(),
      order: [...visited],
      container: stack.slice(),
      ...f,
    });

  const visit = (u: string, parent?: string) => {
    visited.push(u);
    stack.push(u);
    if (parent) tree.push([parent, u]);
    snap({ current: u, message: parent ? `Visit ${u} and push it onto the call stack.` : `Start at ${start}: visit it and push it onto the call stack.` });
    for (const v of ADJ[u]) {
      if (!visited.includes(v)) {
        snap({ current: u, edge: [u, v], message: `${u} → ${v}: ${v} is unvisited, so go deeper.` });
        visit(v, u);
        snap({ current: u, message: `Back at ${u} after finishing ${v}. Keep checking ${u}'s neighbors.` });
      } else {
        snap({ current: u, edge: [u, v], message: `${u} → ${v}: ${v} is already visited. Skip it.` });
      }
    }
    stack.pop();
    snap({ current: stack[stack.length - 1], message: `${u} has no unvisited neighbors left. Pop it off the stack (backtrack).` });
  };

  visit(start);
  frames[frames.length - 1].message = `Stack is empty. DFS visit order: ${visited.join(" → ")}.`;
  return frames;
}

const isEdge = (edge: [string, string] | undefined, u: string, v: string) =>
  !!edge && ((edge[0] === u && edge[1] === v) || (edge[0] === v && edge[1] === u));

export function GraphTraversalVisualizer({ algorithm = "bfs" }: { algorithm?: Algorithm }) {
  const [algo, setAlgo] = useState<Algorithm>(algorithm === "dfs" ? "dfs" : "bfs");
  const [start, setStart] = useState("A");
  const frames = useMemo(() => (algo === "bfs" ? bfs(start) : dfs(start)), [algo, start]);
  const playback = usePlayback(frames.length);
  const frame = frames[playback.step];

  return (
    <VisualizerShell
      title={algo === "bfs" ? "Breadth-first search" : "Depth-first search"}
      subtitle={`Time O(V + E) · Space O(V) · Uses a ${algo === "bfs" ? "queue (FIFO)" : "stack (LIFO)"}. Click a node to start there.`}
      toolbar={
        <div role="radiogroup" aria-label="Traversal algorithm" className="flex rounded-lg border border-border bg-card p-0.5">
          {(["bfs", "dfs"] as const).map((a) => (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={algo === a}
              onClick={() => {
                setAlgo(a);
                playback.reset();
              }}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold uppercase transition",
                algo === a ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {a}
            </button>
          ))}
        </div>
      }
      legend={[
        { label: "Unvisited", className: "bg-muted ring-1 ring-border" },
        { label: algo === "bfs" ? "In queue" : "On stack", className: "bg-amber-400" },
        { label: "Current", className: "bg-brand" },
        { label: "Visited", className: "bg-emerald-500" },
        { label: "Tree edge", className: "bg-emerald-500/60" },
      ]}
      footer={<PlaybackControls playback={playback} />}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_11rem]">
        <svg viewBox="0 0 630 300" className="w-full select-none" role="img" aria-label="Graph traversal diagram">
          {EDGES.map(([u, v]) => {
            const inTree = frame.tree.some(([a, b]) => (a === u && b === v) || (a === v && b === u));
            const active = isEdge(frame.edge, u, v);
            return (
              <line
                key={`${u}${v}`}
                x1={NODES[u].x}
                y1={NODES[u].y}
                x2={NODES[v].x}
                y2={NODES[v].y}
                strokeLinecap="round"
                strokeDasharray={active && !inTree ? "6 6" : undefined}
                className={cn(
                  "transition-all duration-300",
                  active ? "stroke-amber-400" : inTree ? "stroke-emerald-500/70" : "stroke-border",
                )}
                strokeWidth={active || inTree ? 4 : 2.5}
              />
            );
          })}
          {Object.entries(NODES).map(([id, { x, y }]) => {
            const isCurrent = frame.current === id;
            const isVisited = frame.visited.includes(id);
            const inFrontier = frame.frontier.includes(id);
            const isStart = id === start;
            return (
              <g
                key={id}
                role="button"
                tabIndex={0}
                aria-label={`Start traversal at ${id}`}
                onClick={() => {
                  setStart(id);
                  playback.reset();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setStart(id);
                    playback.reset();
                  }
                }}
                className="cursor-pointer outline-none [&:focus-visible>circle:first-of-type]:stroke-ring"
              >
                {isCurrent && <circle cx={x} cy={y} r={32} className="animate-pulse fill-brand/20" />}
                <circle
                  cx={x}
                  cy={y}
                  r={24}
                  strokeWidth={isStart ? 3.5 : 2}
                  strokeDasharray={isStart ? "4 3" : undefined}
                  className={cn(
                    "transition-all duration-300",
                    isCurrent
                      ? "fill-brand stroke-brand"
                      : inFrontier
                        ? "fill-amber-400 stroke-amber-500"
                        : isVisited
                          ? "fill-emerald-500 stroke-emerald-600"
                          : "fill-muted stroke-border",
                    isStart && !isCurrent && "stroke-foreground/60",
                  )}
                />
                <text
                  x={x}
                  y={y}
                  dy="0.35em"
                  textAnchor="middle"
                  className={cn(
                    "pointer-events-none text-[15px] font-bold",
                    isCurrent
                      ? "fill-brand-foreground"
                      : inFrontier
                        ? "fill-amber-950"
                        : isVisited
                          ? "fill-white"
                          : "fill-foreground",
                  )}
                >
                  {id}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex flex-col gap-3 text-sm">
          <div>
            <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
              {algo === "bfs" ? "Queue (front → back)" : "Call stack (bottom → top)"}
            </p>
            <div className="flex min-h-9 flex-wrap gap-1 rounded-lg border border-dashed border-border p-1.5">
              {frame.container.length === 0 ? (
                <span className="px-1 text-xs text-muted-foreground">empty</span>
              ) : (
                frame.container.map((n, i) => (
                  <span
                    key={`${n}-${i}`}
                    className="grid size-7 animate-scale-in place-items-center rounded-md bg-amber-400 font-mono text-xs font-bold text-amber-950"
                  >
                    {n}
                  </span>
                ))
              )}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">Visit order</p>
            <div className="flex min-h-9 flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1.5">
              {frame.order.length === 0 ? (
                <span className="px-1 text-xs text-muted-foreground">nothing yet</span>
              ) : (
                frame.order.map((n, i) => (
                  <span key={n} className="inline-flex items-center gap-1 font-mono text-xs font-semibold">
                    {i > 0 && <span className="text-muted-foreground">→</span>}
                    <span className="grid size-7 place-items-center rounded-md bg-emerald-500 text-white">{n}</span>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <StatusMessage>{frame.message}</StatusMessage>
      </div>
    </VisualizerShell>
  );
}
