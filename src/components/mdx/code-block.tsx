"use client";

import { Check, Copy } from "lucide-react";
import { useRef, useState, type ComponentProps } from "react";

export function CodeBlock(props: ComponentProps<"pre">) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = ref.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text.replace(/\n$/, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be denied; nothing useful to do.
    }
  }

  return (
    <div className="group/code relative">
      <pre ref={ref} {...props} />
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-lg border border-border bg-card/90 text-muted-foreground opacity-0 shadow-sm backdrop-blur transition group-hover/code:opacity-100 hover:text-foreground focus-visible:opacity-100 max-md:opacity-100"
      >
        {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}
