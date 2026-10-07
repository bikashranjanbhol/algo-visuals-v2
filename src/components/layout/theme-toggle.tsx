"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/** Single button that cycles light → dark → system. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const index = options.findIndex((o) => o.value === theme);
  const current = options[index] ?? options[2];
  const next = options[(index + 1) % options.length];
  const Icon = current.icon;

  return (
    <button
      type="button"
      onClick={() => setTheme(next.value)}
      aria-label={`Theme: ${current.label}. Switch to ${next.label.toLowerCase()}.`}
      title={`Theme: ${current.label}`}
      className={cn(
        "grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <Icon className="size-[1.1rem]" />
    </button>
  );
}

/** Segmented control used in the mobile menu. */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition",
            theme === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-3.5" /> {label}
        </button>
      ))}
    </div>
  );
}
