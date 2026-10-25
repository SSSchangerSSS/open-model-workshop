import { OG_IMAGE, SITE_NAME, absoluteUrl } from "./site";

/**
 * Shared per-page SEO head — one canonical, matching og/twitter metadata,
 * absolute URLs built from src/lib/site.ts. Every route composes its own
 * title/description through this helper so the canonical policy (fixed URL,
 * no QA-parameter variants, no preview-host leakage) stays in one place.
 */
export function pageMeta({
  title,
  description,
  path,
  ogTitle,
  ogDescription,
}: {
  title: string;
  description: string;
  path: string;
  ogTitle?: string;
  ogDescription?: string;
}) {
  const url = absoluteUrl(path);
  const socialTitle = ogTitle ?? title;
  const socialDescription = ogDescription ?? description;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:title", content: socialTitle },
      { property: "og:description", content: socialDescription },
      { property: "og:url", content: url },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:site_name", content: SITE_NAME },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: socialTitle },
      { name: "twitter:description", content: socialDescription },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
