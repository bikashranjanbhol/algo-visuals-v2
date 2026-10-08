// Types shared by server-side content loading and client components.

export type Level = "Beginner" | "Intermediate" | "Advanced";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type TutorialIcon = "binary" | "layers" | "network" | "brain" | "code" | "route" | "boxes";
export type Accent = "violet" | "sky" | "emerald" | "amber" | "rose";

export type Heading = {
  id: string;
  text: string;
  depth: 2 | 3;
};

export type TopicMeta = {
  /** Stable id used for progress tracking: `tutorial/chapter/topic`. */
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  updated?: string;
  readingMinutes: number;
  href: string;
  tutorialSlug: string;
  chapterSlug: string;
};

export type ChapterMeta = {
  slug: string;
  title: string;
  description?: string;
  href: string;
  topics: TopicMeta[];
};

export type TutorialMeta = {
  slug: string;
  title: string;
  description: string;
  order: number;
  level: Level;
  icon: TutorialIcon;
  accent: Accent;
  href: string;
  chapters: ChapterMeta[];
  topicCount: number;
  readingMinutes: number;
};

/** Just enough to list a tutorial (header menu, switcher, footer). Stays small as tutorials are added. */
export type TutorialSummary = {
  slug: string;
  title: string;
  description: string;
  level: Level;
  href: string;
  icon: TutorialIcon;
  accent: Accent;
  topicCount: number;
};

/** One tutorial's chapter/topic tree, sent to the sidebar for the tutorial being read. */
export type NavTutorial = TutorialSummary & {
  chapters: {
    slug: string;
    title: string;
    href: string;
    topics: { id: string; title: string; href: string }[];
  }[];
};

export type SearchEntry = {
  id: string;
  title: string;
  description: string;
  href: string;
  tutorial: string;
  chapter: string;
  headings: { id: string; text: string }[];
};
