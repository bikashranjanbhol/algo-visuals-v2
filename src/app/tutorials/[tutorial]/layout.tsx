import { TutorialSidebarNav } from "@/components/docs/tutorial-nav";
import { getNavTutorial, getTutorialSummaries } from "@/lib/content";

// Every tutorial is prerendered, so reading params here costs nothing at
// request time and keeps the sidebar in the static HTML. Wrapping it in
// <Suspense> instead would make React stream it after the page shell.
export const instant = false;

/** Three-column docs shell: left navigation here, main + right TOC in each page. */
export default async function TutorialLayout({ children, params }: LayoutProps<"/tutorials/[tutorial]">) {
  const { tutorial: slug } = await params;
  // Only the current tutorial's tree is sent, so pages stay small however many tutorials exist.
  const tutorial = getNavTutorial(slug);

  return (
    <div className="container-page flex flex-1 items-start">
      <aside
        aria-label="Tutorial navigation"
        className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-72 shrink-0 border-r border-border lg:block"
      >
        <div className="scrollbar-thin h-full overflow-y-auto py-8 pr-5">
          {tutorial && <TutorialSidebarNav tutorial={tutorial} tutorials={getTutorialSummaries()} />}
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
