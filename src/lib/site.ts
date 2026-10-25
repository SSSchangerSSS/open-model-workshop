/**
 * Single source of truth for the deployment identity — the canonical origin,
 * the base path, and absolute URL builders used by SEO metadata.
 *
 * The production deployment is GitHub Pages under /open-model-workshop/.
 * Other environments (SSR preview, Lovable) can override the canonical
 * origin at build time with VITE_SITE_URL — `window.location` is NEVER used
 * so that SSR and the browser always agree and preview hosts can never leak
 * into canonical URLs.
 */

export const SITE_NAME = "هوش برتر";

const envUrl = (import.meta.env["VITE_SITE_URL"] as string | undefined)?.replace(/\/+$/, "");

/** Canonical site origin — overridable per environment, stable in SSR. */
export const SITE_URL = envUrl || "https://ssschangersss.github.io";

/** Base path: "/open-model-workshop/" on Pages, "/" elsewhere. */
export const BASE_PATH = import.meta.env.BASE_URL || "/";

/** Absolute URL for an in-site path, base-path aware, no trailing slash. */
export function absoluteUrl(path = ""): string {
  const base = BASE_PATH.endsWith("/") ? BASE_PATH : `${BASE_PATH}/`;
  const clean = path.replace(/^\/+/, "");
  const joined = clean ? `${base}${clean}` : base;
  // home keeps its trailing slash, sub-pages do not (matches host redirects)
  const trimmed = joined.replace(/\/+$/, "");
  return `${SITE_URL}${clean ? trimmed : trimmed + "/"}`;
}

/** Real screenshot of the production home page (1440px), used for og/twitter. */
export const OG_IMAGE = absoluteUrl("og-cover.png");
