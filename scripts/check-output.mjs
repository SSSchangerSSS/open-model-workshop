#!/usr/bin/env node
/**
 * CI post-build gate (T9) — runs AFTER the SSG build in deploy-pages.yml.
 * Fails the deploy when the published output is structurally broken:
 *  - every public route has a prerendered index.html
 *  - a real 404.html exists (noindex, NOT a home-page clone)
 *  - sitemap.xml + robots.txt ship
 *  - home + each route carry exactly one canonical, og:image and a title
 *  - transfer budget: entry JS + CSS gzip stays inside the round-2 measured
 *    baseline + guard band (NOT a license to grow: budgets = baseline ×1.15)
 */
import { readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const OUT = process.argv[2] ?? ".output/public";
let failed = 0;
const fail = (msg) => {
  failed++;
  console.error("✗", msg);
};
const ok = (msg) => console.log("✓", msg);

const ROUTES = ["", "services", "hardware", "compare", "showcase", "contact"];

// ---- 1. structure ----
for (const r of ROUTES) {
  const p = r === "" ? "index.html" : join(r, "index.html");
  try {
    statSync(join(OUT, p));
    ok(`route /${r} → ${p}`);
  } catch {
    fail(`missing prerendered page: ${p}`);
  }
}
try {
  const notFound = readFileSync(join(OUT, "404.html"), "utf-8");
  if (!/name="robots" content="noindex/.test(notFound)) fail("404.html lacks noindex");
  else if (/rel="canonical"/.test(notFound)) fail("404.html must not carry a canonical");
  else if (!/صفحه پیدا نشد/.test(notFound)) fail("404.html is not the Persian 404");
  else ok("404.html is the real noindex Persian 404");
} catch {
  fail("missing 404.html");
}
for (const f of ["sitemap.xml", "robots.txt", "og-cover.png", "favicon.ico"]) {
  try {
    statSync(join(OUT, f));
    ok(`asset ${f}`);
  } catch {
    fail(`missing asset: ${f}`);
  }
}

// ---- 2. per-page metadata ----
for (const r of ROUTES) {
  const file = r === "" ? "index.html" : join(r, "index.html");
  let html;
  try {
    html = readFileSync(join(OUT, file), "utf-8");
  } catch {
    continue;
  }
  const canon = [...html.matchAll(/rel="canonical" href="([^"]+)"/g)].map((m) => m[1]);
  if (canon.length !== 1) fail(`${file}: expected exactly 1 canonical, got ${canon.length}`);
  else if (!canon[0].startsWith("https://ssschangersss.github.io/open-model-workshop"))
    fail(`${file}: canonical off-domain: ${canon[0]}`);
  else ok(`${file}: canonical ${canon[0]}`);
  if (!/<title>[^<]{5,}<\/title>/.test(html)) fail(`${file}: missing title`);
  if (!/property="og:image" content="[^"]+"/.test(html)) fail(`${file}: missing og:image`);
  if (!/name="description" content="[^"]{20,}"/.test(html)) fail(`${file}: missing description`);
}

// ---- 3. transfer budget (gzip of the built entry JS + main CSS) ----
const gzipSize = (p) => Number(execFileSync("gzip", ["-c", p]).length);
const assets = join(OUT, "assets");
const listJs = [];
{
  const { readdirSync } = await import("node:fs");
  for (const f of readdirSync(assets)) {
    if (/^index-.*\.js$/.test(f)) listJs.push(join(assets, f));
    if (/^styles-.*\.css$/.test(f)) listJs.push(join(assets, f));
  }
}
if (listJs.length < 2) fail("entry JS or CSS chunk not found in assets/");
const BUDGETS = { js: 111_000 * 1.15, css: 20_000 * 1.15 }; // round-2 baseline +15%
for (const p of listJs) {
  const g = gzipSize(p);
  const isCss = p.endsWith(".css");
  const budget = isCss ? BUDGETS.css : BUDGETS.js;
  const name = p.split("/").pop();
  if (g > budget) fail(`${name} gzip ${g}B exceeds budget ${Math.round(budget)}B`);
  else ok(`${name} gzip ${(g / 1024).toFixed(1)}KB ≤ ${Math.round(budget / 1024)}KB`);
}

if (failed) {
  console.error(`\n${failed} check(s) FAILED — blocking deploy`);
  process.exit(1);
}
console.log("\nAll post-build checks passed.");
