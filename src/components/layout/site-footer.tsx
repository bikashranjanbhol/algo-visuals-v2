import { Heart } from "lucide-react";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { GitHubIcon, LogoMark } from "@/components/icons";
import { InstallButton } from "@/components/pwa/install-button";
import type { NavTutorial } from "@/lib/content-types";
import { siteConfig } from "@/lib/site";

// Cached so the year is fixed at build time instead of making the page dynamic.
async function CopyrightYear() {
  "use cache";
  cacheLife("max");
  return new Date().getFullYear();
}

export function SiteFooter({ tutorials }: { tutorials: NavTutorial[] }) {
  const columns = [
    {
      title: "Tutorials",
      links: tutorials.map((t) => ({ title: t.title, href: t.href })),
    },
    {
      title: "Learn",
      links: [
        { title: "All tutorials", href: "/tutorials" },
        { title: "Visualizer", href: "/visualizer" },
        { title: "My dashboard", href: "/dashboard" },
        { title: "About", href: "/about" },
      ],
    },
    {
      title: "Project",
      links: [
        { title: "Source code", href: siteConfig.repo, external: true },
        { title: "Report an issue", href: `${siteConfig.repo}/issues`, external: true },
        { title: "Write a tutorial", href: `${siteConfig.repo}/blob/main/content/README.md`, external: true },
        { title: "Offline pages", href: "/offline" },
      ],
    },
  ];

  return (
    <footer className="relative mt-auto border-t border-border bg-muted/30" data-no-print>
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-2.5 font-bold">
            <LogoMark className="size-8" />
            <span className="text-lg">{siteConfig.name}</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{siteConfig.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <InstallButton variant="outline" />
            <a
              href={siteConfig.repo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="grid size-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <GitHubIcon className="size-[1.1rem]" />
            </a>
          </div>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-sm font-semibold">{column.title}</p>
            <ul className="mt-3 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  {"external" in link && link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.title}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© <CopyrightYear /> {siteConfig.name}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="size-3.5 fill-rose-500 text-rose-500" aria-label="love" /> using Next.js · Hosted on Vercel
          </p>
        </div>
      </div>
    </footer>
  );
}
