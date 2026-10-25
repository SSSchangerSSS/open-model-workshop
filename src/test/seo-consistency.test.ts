import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { PUBLIC_ROUTES, SITE_URL, absoluteUrl } from "@/lib/site";

/**
 * T6/T9 — the static sitemap must stay in lockstep with the shared site
 * config: same origin, exactly the public canonical routes, nothing else.
 * Catches domain changes / new routes silently diverging from sitemap.xml.
 */
describe("sitemap ↔ site config consistency", () => {
  const xml = readFileSync(join(process.cwd(), "public/sitemap.xml"), "utf-8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);

  it("uses the configured site origin (no stale domains, no doubled base)", () => {
    expect(locs.length).toBeGreaterThan(0);
    for (const loc of locs) {
      expect(loc.startsWith(`${SITE_URL}/`), `${loc} must start with ${SITE_URL}/`).toBe(true);
      expect(loc).not.toContain("open-model-workshop/open-model-workshop");
    }
  });

  it("lists exactly the public canonical routes — nothing else", () => {
    const expected = PUBLIC_ROUTES.map((r) => absoluteUrl(r.path)).sort();
    expect([...locs].sort()).toEqual(expected);
  });

  it("never contains QA params, 404/preview/error URLs", () => {
    for (const loc of locs) {
      expect(loc).not.toMatch(/[?&](tier|idle)=/);
      expect(loc).not.toContain("/404");
    }
  });

  it("no lastmod is fabricated from build time", () => {
    expect(xml).not.toContain("<lastmod>");
  });
});
