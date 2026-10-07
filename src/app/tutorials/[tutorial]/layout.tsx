import { DocsNavTree } from "@/components/docs/docs-nav-tree";
import { getNavTree } from "@/lib/content";

/** Three-column docs shell: left navigation here, main + right TOC in each page. */
export default function TutorialLayout({ children }: LayoutProps<"/tutorials/[tutorial]">) {
  const tree = getNavTree();
  return (
    <div className="container-page flex flex-1 items-start">
      <aside
        aria-label="Tutorial navigation"
        className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-72 shrink-0 border-r border-border lg:block"
      >
        <div className="scrollbar-thin h-full overflow-y-auto py-8 pr-5">
          <DocsNavTree tree={tree} />
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
