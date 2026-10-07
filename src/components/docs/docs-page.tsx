import { Bug, Pencil } from "lucide-react";
import type { ReactNode } from "react";
import type { Heading } from "@/lib/content-types";
import { siteConfig } from "@/lib/site";
import { MobileTableOfContents, TableOfContents } from "./toc";

/** Main column + right "On this page" sidebar shared by tutorial, chapter and topic pages. */
export function DocsPage({
  headings,
  tocTitle,
  editPath,
  aside,
  children,
}: {
  headings: Heading[];
  tocTitle?: string;
  /** Path under content/tutorials for the "Edit this page" link. */
  editPath?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start">
      <article className="min-w-0 flex-1 py-8 sm:px-2 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-3xl">
          <MobileTableOfContents headings={headings} />
          {children}
        </div>
      </article>
      <aside aria-label="On this page" className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 xl:block">
        <div className="scrollbar-thin flex h-full flex-col gap-8 overflow-y-auto py-10 pr-1 pl-4">
          <TableOfContents headings={headings} title={tocTitle} />
          {aside}
          {editPath && (
            <div className="space-y-2 border-t border-border pt-6 text-xs">
              <a
                href={`${siteConfig.contentPath}/${editPath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="size-3.5" /> Edit this page on GitHub
              </a>
              <a
                href={`${siteConfig.repo}/issues/new?title=${encodeURIComponent(`Feedback: ${editPath}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Bug className="size-3.5" /> Report an issue
              </a>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
