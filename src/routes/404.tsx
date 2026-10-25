import { createFileRoute } from "@tanstack/react-router";
import { NotFoundContent } from "@/components/NotFoundContent";
import { notFoundHead } from "@/lib/seo";

/**
 * A REAL, prerendered /404 page (T7).
 *
 * On GitHub Pages the deploy workflow copies the prerendered output of this
 * route to `404.html`, so unknown URLs get a genuine Persian error page with
 * `noindex` — not a copy of the home page (which used to serve the home
 * body + home canonical for every broken link, muddying crawl signals).
 * SSR builds also answer unknown paths with HTTP 404 via the router's
 * notFoundComponent (same visual, same status semantics).
 */
export const Route = createFileRoute("/404")({
  head: () => notFoundHead(),
  component: NotFoundContent,
});
