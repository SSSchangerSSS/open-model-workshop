import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  SITE_LOCALE,
  SITE_NAME,
  absoluteUrl,
} from "./site";

/**
 * Per-page SEO head builder (T6) — one place that guarantees:
 *  - unique title + description per route
 *  - ONE absolute canonical URL, stable (never window.location-derived)
 *  - og:title / og:description / og:url / real og:image with absolute URL
 * Root-level metadata (og:type, og:site_name, og:locale, twitter:card,
 * theme-color, JSON-LD) stays in __root.tsx so routes never duplicate it.
 */
export function pageHead(opts: {
  title: string;
  description: string;
  /** Canonical path, e.g. "/hardware" — QA params (tier, …) must NOT be part of it. */
  path: string;
  ogTitle?: string;
  ogDescription?: string;
}) {
  const canonical = absoluteUrl(opts.path);
  return {
    meta: [
      { title: opts.title },
      { name: "description", content: opts.description },
      { property: "og:title", content: opts.ogTitle ?? opts.title },
      { property: "og:description", content: opts.ogDescription ?? opts.description },
      { property: "og:url", content: canonical },
      { property: "og:image", content: absoluteUrl(OG_IMAGE_PATH) },
      { property: "og:image:width", content: String(OG_IMAGE_WIDTH) },
      { property: "og:image:height", content: String(OG_IMAGE_HEIGHT) },
      {
        property: "og:image:alt",
        content: `${SITE_NAME} — اتوماسیون و زیرساخت هوش مصنوعی`,
      },
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
}

/**
 * The 404 page head — noindex and deliberately NO canonical (a canonical
 * pointing anywhere from a non-indexable error page only muddies signals).
 */
export function notFoundHead() {
  return {
    meta: [
      { title: `۴۰۴ — صفحه پیدا نشد | ${SITE_NAME}` },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: `۴۰۴ — صفحه پیدا نشد | ${SITE_NAME}` },
      { property: "og:locale", content: SITE_LOCALE },
    ],
    links: [],
  };
}
