// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

/**
 * GitHub Pages support:
 * When PAGES_BASE_PATH is set (only in the GitHub Actions deploy workflow),
 * the build switches to a fully static, pre-rendered output so the site can
 * be hosted on GitHub Pages. Without it (Lovable builds / local dev),
 * the original SSR behavior is preserved untouched.
 */
const pagesBasePath = process.env["PAGES_BASE_PATH"];

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Static pre-rendering (SSG) — only for the GitHub Pages build.
    ...(pagesBasePath
      ? {
          prerender: {
            enabled: true,
            crawlLinks: true,
          },
        }
      : {}),
  },
  vite: {
    // e.g. "/open-model-workshop/" on GitHub Pages, "/" everywhere else.
    base: pagesBasePath || "/",
  },
});
