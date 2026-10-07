import { run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { mdxComponents } from "./mdx-components";

/** Evaluates MDX compiled with `outputFormat: "function-body"` and renders it. */
export async function MdxContent({ code }: { code: string }) {
  const { default: Content } = await run(code, { ...runtime, baseUrl: import.meta.url });
  return <Content components={mdxComponents} />;
}
