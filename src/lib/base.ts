/**
 * Base-path helpers for dual deployment (docs/ui-performance-audit.md §Deploy):
 * - GitHub Pages serves the site under /open-model-workshop/
 * - root-domain deploys serve it under /
 * Vite bakes `import.meta.env.BASE_URL` at build time from `vite.base`
 * (set via PAGES_BASE_PATH in the Pages workflow), so every generated
 * absolute asset/meta URL stays correct in BOTH deployments without any
 * runtime detection.
 */
export const BASE_URL: string = import.meta.env.BASE_URL || "/";

/** Prefix a site-absolute path with the configured base. */
export function withBase(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const base = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  return `${base}${path.replace(/^\/+/, "")}`;
}
