#!/usr/bin/env node
// Validates everything under content/tutorials: meta.json shape, that every
// listed topic exists, frontmatter fields, and that each MDX file compiles and
// only uses components the site provides.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { compile } from "@mdx-js/mdx";
import matter from "gray-matter";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";

const ROOT = path.join(process.cwd(), "content", "tutorials");
const COMPONENTS = new Set([
  "Callout",
  "Tabs",
  "Tab",
  "Quiz",
  "SortingVisualizer",
  "BinarySearchVisualizer",
  "GraphTraversalVisualizer",
  "StackQueueVisualizer",
]);
const HTML_ALLOWED = new Set(["br", "sup", "sub", "kbd", "abbr", "mark", "details", "summary"]);
const LEVELS = new Set(["Beginner", "Intermediate", "Advanced"]);
const ICONS = new Set(["binary", "layers", "network", "brain", "code", "route", "boxes"]);
const ACCENTS = new Set(["violet", "sky", "emerald", "amber", "rose"]);
const DIFFICULTIES = new Set(["beginner", "intermediate", "advanced"]);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const errors = [];
const fail = (file, message) => errors.push(`${path.relative(process.cwd(), file)}: ${message}`);

function collectJsx(names) {
  return () => (tree) => {
    visit(tree, ["mdxJsxFlowElement", "mdxJsxTextElement"], (node) => {
      if (node.name) names.add(node.name);
      // Without blank lines, <summary> ends up inside a paragraph, which breaks the toggle.
      if (node.type === "mdxJsxTextElement" && (node.name === "details" || node.name === "summary")) {
        names.add("#inline-details");
      }
    });
    visit(tree, "heading", (node) => {
      if (node.depth === 1) names.add("#h1");
    });
  };
}

let topicCount = 0;
const tutorials = readdirSync(ROOT).filter((d) => statSync(path.join(ROOT, d)).isDirectory());

for (const tutorial of tutorials) {
  const dir = path.join(ROOT, tutorial);
  const metaPath = path.join(dir, "meta.json");
  if (!SLUG.test(tutorial)) fail(dir, "tutorial folder must be a kebab-case slug");
  if (!existsSync(metaPath)) {
    fail(dir, "missing meta.json");
    continue;
  }
  let meta;
  try {
    meta = JSON.parse(readFileSync(metaPath, "utf8"));
  } catch (e) {
    fail(metaPath, `invalid JSON: ${e.message}`);
    continue;
  }
  for (const key of ["title", "description"]) {
    if (typeof meta[key] !== "string" || !meta[key].trim()) fail(metaPath, `"${key}" is required`);
  }
  if (typeof meta.order !== "number") fail(metaPath, `"order" must be a number`);
  if (!LEVELS.has(meta.level)) fail(metaPath, `"level" must be one of ${[...LEVELS].join(", ")}`);
  if (!ICONS.has(meta.icon)) fail(metaPath, `"icon" must be one of ${[...ICONS].join(", ")}`);
  if (!ACCENTS.has(meta.accent)) fail(metaPath, `"accent" must be one of ${[...ACCENTS].join(", ")}`);
  if (!Array.isArray(meta.chapters) || meta.chapters.length === 0) {
    fail(metaPath, `"chapters" must be a non-empty array`);
    continue;
  }

  for (const chapter of meta.chapters) {
    if (!SLUG.test(chapter.slug ?? "")) fail(metaPath, `chapter slug "${chapter.slug}" is not kebab-case`);
    if (typeof chapter.title !== "string") fail(metaPath, `chapter "${chapter.slug}" needs a title`);
    if (!Array.isArray(chapter.topics) || chapter.topics.length === 0) {
      fail(metaPath, `chapter "${chapter.slug}" needs at least one topic`);
      continue;
    }
    for (const topic of chapter.topics) {
      const file = path.join(dir, chapter.slug, `${topic}.mdx`);
      if (!SLUG.test(topic)) fail(metaPath, `topic slug "${topic}" is not kebab-case`);
      if (!existsSync(file)) {
        fail(file, "listed in meta.json but the file does not exist");
        continue;
      }
      topicCount++;
      const { data, content } = matter(readFileSync(file, "utf8"));
      if (typeof data.title !== "string" || !data.title.trim()) fail(file, "frontmatter needs a title");
      if (typeof data.description !== "string" || !data.description.trim()) {
        fail(file, "frontmatter needs a description");
      } else if (data.description.length > 200) {
        fail(file, "description should be under 200 characters");
      }
      if (data.difficulty && !DIFFICULTIES.has(data.difficulty)) {
        fail(file, `difficulty must be one of ${[...DIFFICULTIES].join(", ")}`);
      }
      const names = new Set();
      try {
        await compile(content, { remarkPlugins: [remarkGfm, collectJsx(names)] });
      } catch (e) {
        const where = e.place?.start ?? e.place;
        fail(file, `MDX compile error${where?.line ? ` at line ${where.line}` : ""}: ${e.reason ?? e.message}`);
        continue;
      }
      for (const name of names) {
        if (name === "#h1") fail(file, "do not use a level-1 heading; the title comes from frontmatter");
        else if (name === "#inline-details") {
          fail(file, "put <details> and <summary> on their own lines, with blank lines around the answer (see content/README.md)");
        }
        else if (!COMPONENTS.has(name) && !HTML_ALLOWED.has(name)) fail(file, `unknown component <${name}>`);
      }
    }
  }

  // Flag stray topic files that are not listed in meta.json.
  const listed = new Set(meta.chapters.flatMap((c) => (c.topics ?? []).map((t) => `${c.slug}/${t}.mdx`)));
  for (const chapterDir of readdirSync(dir)) {
    const full = path.join(dir, chapterDir);
    if (!statSync(full).isDirectory()) continue;
    for (const f of readdirSync(full)) {
      if (f.endsWith(".mdx") && !listed.has(`${chapterDir}/${f}`)) {
        fail(path.join(full, f), "file exists but is not listed in meta.json");
      }
    }
  }
}

if (errors.length) {
  console.error(`✖ ${errors.length} problem(s) found:\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✔ ${tutorials.length} tutorials, ${topicCount} topics OK`);
