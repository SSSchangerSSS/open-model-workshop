/**
 * Single source of truth for the published site identity (T6).
 *
 * The canonical origin is a BUILD-TIME constant — it must never be derived
 * from `window.location`, otherwise preview hosts, LAN hosts or bot frames
 * would leak into canonical URLs / JSON-LD / sitemap. SSR and browser get
 * the exact same statically-injected value, so both agree.
 *
 * Default keeps the current GitHub Pages project-site URL (nothing fake —
 * this is where the site is actually published today). When a real domain
 * is configured, set VITE_SITE_URL (e.g. https://example.com) at build
 * time — every canonical/og:url/JSON-LD/sitemap entry follows it.
 *
 * NOTE: assets' base path (vite `base`, e.g. /open-model-workshop/) is a
 * SEPARATE concept. SITE_URL already carries the full published directory,
 * so SEO helpers must NOT append BASE_PATH again (that would double the
 * /open-model-workshop/ segment).
 */
const DEFAULT_SITE_URL = "https://ssschangersss.github.io/open-model-workshop";

function normalizeUrl(u: string): string {
  return u.replace(/\/+$/, "");
}

const rawEnv = (import.meta.env as { VITE_SITE_URL?: string } | undefined) ?? {};
export const SITE_URL: string = normalizeUrl(rawEnv["VITE_SITE_URL"]?.trim() || DEFAULT_SITE_URL);

export const SITE_NAME = "هوش برتر";
export const SITE_LOCALE = "fa_IR";
/** Default share image — must really exist in the build output (public/). */
export const OG_IMAGE_PATH = "/og-cover.png";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** Canonical absolute URL for a site path ("" or "/" → site root). */
export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return `${SITE_URL}/`;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

/** The six public, indexable routes — the sitemap's single source of truth. */
export const PUBLIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/services", changefreq: "monthly", priority: "0.9" },
  { path: "/hardware", changefreq: "weekly", priority: "0.9" },
  { path: "/compare", changefreq: "weekly", priority: "0.9" },
  { path: "/showcase", changefreq: "monthly", priority: "0.8" },
  { path: "/contact", changefreq: "yearly", priority: "0.7" },
] as const;
