import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Breadcrumbs({ items }: { items: { title: string; href?: string }[] }) {
  const all = [{ title: "Tutorials", href: "/tutorials" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.title,
      ...(item.href ? { item: `${siteConfig.url}${item.href}` } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <li>
          <Link href="/" aria-label="Home" className="grid size-6 place-items-center rounded hover:text-foreground">
            <Home className="size-3.5" />
          </Link>
        </li>
        {all.map((item, i) => (
          <li key={item.title} className="flex min-w-0 items-center gap-1">
            <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden />
            {item.href && i < all.length - 1 ? (
              <Link href={item.href} className="truncate transition-colors hover:text-foreground">
                {item.title}
              </Link>
            ) : (
              <span aria-current="page" className="truncate font-medium text-foreground">
                {item.title}
              </span>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </nav>
  );
}
