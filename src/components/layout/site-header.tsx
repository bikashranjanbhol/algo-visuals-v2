import Link from "next/link";
import { UserMenu } from "@/components/auth/user-menu";
import { GitHubIcon, LogoMark } from "@/components/icons";
import type { SearchEntry, TutorialSummary } from "@/lib/content-types";
import { siteConfig } from "@/lib/site";
import { CommandPalette } from "./command-palette";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader({ tutorials, searchIndex }: { tutorials: TutorialSummary[]; searchIndex: SearchEntry[] }) {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="container-page flex h-full items-center gap-2 sm:gap-4">
        <MobileNav tutorials={tutorials} />
        <Link href="/" className="group mr-2 flex shrink-0 items-center gap-2.5" aria-label={`${siteConfig.name} home`}>
          <LogoMark className="size-8 transition-transform group-hover:scale-105 group-hover:-rotate-3" />
          <span className="text-[1.05rem] font-bold tracking-tight">
            Algo<span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-fuchsia-400">Visuals</span>
          </span>
        </Link>
        <MainNav tutorials={tutorials} />
        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          <CommandPalette entries={searchIndex} tutorials={tutorials} />
          <a
            href={siteConfig.repo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="hidden size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:grid"
          >
            <GitHubIcon className="size-[1.1rem]" />
          </a>
          <ThemeToggle />
          <span className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
