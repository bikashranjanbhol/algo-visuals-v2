"use client";

/**
 * An inline script that runs while the browser parses the server HTML, and is
 * inert (`text/plain`) whenever React renders it on the client. Browsers never
 * execute scripts inserted by React anyway; marking them as data avoids React's
 * "Encountered a script tag" warning, e.g. when a not-found page re-renders the
 * root layout in the browser. Pattern from the Next.js "preventing flash before
 * hydration" guide.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
