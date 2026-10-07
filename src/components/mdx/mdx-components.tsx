import { ExternalLink, Hash } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { BinarySearchVisualizer } from "@/components/visualizers/binary-search-visualizer";
import { GraphTraversalVisualizer } from "@/components/visualizers/graph-traversal-visualizer";
import { SortingVisualizer } from "@/components/visualizers/sorting-visualizer";
import { StackQueueVisualizer } from "@/components/visualizers/stack-queue-visualizer";
import { Callout } from "./callout";
import { CodeBlock } from "./code-block";
import { Quiz } from "./quiz";
import { Tab, Tabs } from "./tabs";

function heading(Tag: "h2" | "h3") {
  return function Heading({ id, children, ...props }: ComponentProps<"h2"> & { children?: ReactNode }) {
    return (
      <Tag id={id} className="group relative" {...props}>
        {children}
        {id && (
          <a
            href={`#${id}`}
            aria-label="Link to this section"
            className="ml-2 inline-flex align-middle text-muted-foreground opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 no-underline"
          >
            <Hash className="size-4" />
          </a>
        )}
      </Tag>
    );
  };
}

function Anchor({ href = "", children, ...props }: ComponentProps<"a">) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
      <ExternalLink className="ml-0.5 inline size-3 align-baseline opacity-60" aria-hidden />
    </a>
  );
}

function Table(props: ComponentProps<"table">) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-border">
      <table {...props} />
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  h2: heading("h2"),
  h3: heading("h3"),
  a: Anchor,
  pre: CodeBlock,
  table: Table,
  Callout,
  Tabs,
  Tab,
  Quiz,
  SortingVisualizer,
  BinarySearchVisualizer,
  GraphTraversalVisualizer,
  StackQueueVisualizer,
};
