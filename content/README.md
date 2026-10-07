# Authoring tutorials

All tutorial content lives in this folder. The site reads it at build time, so adding
a topic means adding a file here and listing it in the tutorial's `meta.json`. No code
changes are needed.

```
content/
└── tutorials/
    └── <tutorial-slug>/
        ├── meta.json                    # tutorial info + chapter/topic order
        └── <chapter-slug>/
            └── <topic-slug>.mdx         # one topic page
```

URLs follow the same shape: `/tutorials/<tutorial>/<chapter>/<topic>`.

Run `npm run check:content` after editing. It validates every `meta.json`, checks that
every listed topic exists, and compiles every MDX file so you catch syntax errors early.

## `meta.json`

```json
{
  "title": "Algorithms Fundamentals",
  "description": "One or two sentences shown on tutorial cards and the overview page.",
  "order": 1,
  "level": "Beginner",
  "icon": "binary",
  "accent": "violet",
  "chapters": [
    {
      "slug": "getting-started",
      "title": "Getting Started",
      "description": "Optional one-line summary of the chapter.",
      "topics": ["introduction", "big-o-notation"]
    }
  ]
}
```

| Field    | Values                                                                 |
| -------- | ---------------------------------------------------------------------- |
| `level`  | `Beginner`, `Intermediate`, `Advanced`                                 |
| `icon`   | `binary`, `layers`, `network`, `brain`, `code`, `route`, `boxes`       |
| `accent` | `violet`, `sky`, `emerald`, `amber`, `rose`                            |
| `topics` | Topic slugs in reading order; each must match `<chapter>/<slug>.mdx`   |

## Topic frontmatter

```mdx
---
title: "Bubble Sort"
description: "A short summary (under 160 characters) used for SEO, search and cards."
difficulty: beginner
updated: 2026-10-07
---
```

`difficulty` is `beginner`, `intermediate` or `advanced`.

## Writing rules

- **Don't write an H1.** The page title comes from frontmatter. Start with an intro paragraph.
- Use `##` for sections and `###` for subsections. These headings build the
  "On this page" navigator in the right sidebar, so keep them short and descriptive.
- Code blocks need a language: ` ```python `, ` ```javascript `, ` ```java `, ` ```cpp `,
  ` ```typescript `, ` ```bash `, ` ```text `. Optional meta: `title="bubble_sort.py"`,
  line highlights `{2,4-6}`, `showLineNumbers`.
- MDX is stricter than Markdown:
  - Never put a raw `<` or `{` / `}` in prose. Wrap expressions in inline code
    (`` `i < n` ``) or use `&lt;`. Unicode is fine for math: O(n²), O(n log n), log₂ n.
  - No HTML comments. Use `{/* comment */}` if you really need one.
  - No `import` / `export` statements. The components below are available globally.
  - Inside a component that wraps Markdown (`Callout`, `Tab`), put a blank line after
    the opening tag and before the closing tag so the Markdown is parsed.

## Components

### Callout

```mdx
<Callout type="tip" title="Optional title">

Any **Markdown** here.

</Callout>
```

`type` is `note` (default), `tip`, `warning` or `danger`.

### Tabs (multi-language code)

````mdx
<Tabs items={["Python", "JavaScript", "Java"]}>
<Tab>

```python
print("hi")
```

</Tab>
<Tab>

```javascript
console.log("hi");
```

</Tab>
<Tab>

```java
System.out.println("hi");
```

</Tab>
</Tabs>
````

Provide one `<Tab>` per label, in the same order.

### Quiz

```mdx
<Quiz
  question="What is the worst-case time complexity of bubble sort?"
  options={["O(n)", "O(n log n)", "O(n²)", "O(1)"]}
  answer={2}
  explanation="Every pair may need to be compared and swapped, so the work grows quadratically."
/>
```

`answer` is the zero-based index of the correct option.

### Interactive visualizers

| Component                                        | Props                                                            |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| `<SortingVisualizer algorithm="bubble" />`        | `algorithm`: `bubble`, `selection`, `insertion`, `merge`, `quick` |
| `<BinarySearchVisualizer />`                      | none                                                             |
| `<GraphTraversalVisualizer algorithm="bfs" />`    | `algorithm`: `bfs`, `dfs`                                        |
| `<StackQueueVisualizer mode="stack" />`           | `mode`: `stack`, `queue`                                         |

Place a visualizer on its own line, with blank lines around it.
