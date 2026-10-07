"use client";

import { CircleCheck, CircleHelp, CircleX, RotateCcw } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export function Quiz({
  question,
  options,
  answer,
  explanation,
}: {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}) {
  const id = useId();
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = submitted && selected === answer;

  return (
    <section
      aria-labelledby={`${id}-q`}
      className="not-prose my-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="flex items-center gap-2 border-b border-border bg-gradient-to-r from-brand-soft to-transparent px-5 py-3">
        <CircleHelp className="size-4 text-brand" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-brand">Quick check</span>
      </div>
      <div className="p-5">
        <p id={`${id}-q`} className="font-semibold leading-relaxed">
          {question}
        </p>
        <div role="radiogroup" aria-labelledby={`${id}-q`} className="mt-4 grid gap-2">
          {options.map((option, i) => {
            const isSelected = selected === i;
            const isAnswer = i === answer;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={submitted}
                onClick={() => setSelected(i)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
                  !submitted && "hover:border-brand/50 hover:bg-brand-soft/50",
                  !submitted && isSelected && "border-brand bg-brand-soft ring-2 ring-brand/20",
                  !submitted && !isSelected && "border-border",
                  submitted && isAnswer && "border-emerald-500/60 bg-emerald-500/10",
                  submitted && isSelected && !isAnswer && "border-rose-500/60 bg-rose-500/10",
                  submitted && !isSelected && !isAnswer && "border-border opacity-60",
                )}
              >
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                    isSelected && !submitted ? "border-brand bg-brand text-brand-foreground" : "border-border",
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{option}</span>
                {submitted && isAnswer && <CircleCheck className="size-5 text-emerald-500" aria-label="Correct answer" />}
                {submitted && isSelected && !isAnswer && <CircleX className="size-5 text-rose-500" aria-label="Your answer" />}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {!submitted ? (
            <button
              type="button"
              disabled={selected === null}
              onClick={() => setSubmitted(true)}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Check answer
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setSelected(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <RotateCcw className="size-3.5" aria-hidden /> Try again
            </button>
          )}
          <p aria-live="polite" className={cn("text-sm font-semibold", correct ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
            {submitted && (correct ? "Correct, nice work!" : "Not quite. The correct answer is highlighted.")}
          </p>
        </div>

        {submitted && explanation && (
          <p className="mt-4 animate-fade-in rounded-xl bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Why: </span>
            {explanation}
          </p>
        )}
      </div>
    </section>
  );
}
