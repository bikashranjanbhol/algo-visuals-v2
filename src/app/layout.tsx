import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Providers } from "@/components/providers";
import { PwaManager } from "@/components/pwa/pwa-manager";
import { getNavTree, getSearchIndex } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { themeScript } from "@/lib/theme-script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name}: ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: ["algorithms", "data structures", "tutorial", "visualization", "sorting", "graphs", "dynamic programming"],
  authors: [{ name: "AlgoVisuals contributors", url: siteConfig.repo }],
  appleWebApp: {
    capable: true,
    title: siteConfig.shortName,
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name}: ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name}: ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfcff" },
    { media: "(prefers-color-scheme: dark)", color: "#16141f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const tree = getNavTree();
  const searchIndex = getSearchIndex();

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <a
          href="#main"
          className="sr-only z-[100] rounded-lg bg-brand px-4 py-2 font-semibold text-brand-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <Providers>
          <SiteHeader tree={tree} searchIndex={searchIndex} />
          <div id="main" className="flex flex-1 flex-col">
            {children}
          </div>
          <SiteFooter tutorials={tree} />
          <PwaManager />
        </Providers>
      </body>
    </html>
  );
}
