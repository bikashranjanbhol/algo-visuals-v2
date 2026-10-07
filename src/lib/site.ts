export const siteConfig = {
  name: "AlgoVisuals",
  shortName: "AlgoVisuals",
  tagline: "Learn algorithms by watching them work",
  description:
    "Interactive, visual tutorials on algorithms and data structures. Step-by-step chapters, animated visualizers, quizzes and offline support.",
  url: process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000",
  repo: "https://github.com/bikashranjanbhol/algo-visuals-v2",
  contentPath: "https://github.com/bikashranjanbhol/algo-visuals-v2/blob/main/content/tutorials",
} as const;

export type NavLink = {
  title: string;
  href: string;
  description?: string;
};

export const primaryNav: NavLink[] = [
  { title: "Tutorials", href: "/tutorials" },
  { title: "Visualizer", href: "/visualizer" },
  { title: "Dashboard", href: "/dashboard" },
  { title: "About", href: "/about" },
];
