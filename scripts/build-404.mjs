#!/usr/bin/env node
/**
 * Real 404 page for GitHub Pages — replaces the old `cp index.html 404.html`
 * fallback which shipped the home page's body + metadata (title, canonical,
 * JSON-LD) for every unknown URL.
 *
 * Output: standalone, dependency-free Persian 404 with:
 *  - <meta name="robots" content="noindex"> (never indexed)
 *  - NO canonical tag (a 404 must not canonicalize to the home page)
 *  - working links back to the real routes
 *  - the site's dark/green identity, zero external requests
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.PAGES_BASE_PATH || "/open-model-workshop/";
const origin = process.env.SITE_URL || "https://ssschangersss.github.io";
const base = BASE.endsWith("/") ? BASE : `${BASE}/`;
const url = (p) => `${origin}${base}${p.replace(/^\/+/, "")}`;

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>۴۰۴ — صفحه پیدا نشد | هوش برتر</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: grid; place-items: center;
    background: #050c07; color: #e7fff2;
    font-family: "Vazirmatn", "Segoe UI", Tahoma, sans-serif;
    padding: 24px; text-align: center;
  }
  .term { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 12px; color: #4dff88; letter-spacing: .5px; }
  h1 { font-size: clamp(3rem, 12vw, 5.5rem); margin: 12px 0 4px; line-height: 1.1; }
  h1 span { color: #4dff88; }
  p.lead { color: rgba(231,255,242,.65); max-width: 34rem; margin: 0 auto 28px; line-height: 2; font-size: 14.5px; }
  .actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
  a.btn {
    display: inline-block; padding: 12px 22px; border-radius: 10px; font-size: 14px; font-weight: 700;
    text-decoration: none; transition: background .2s, border-color .2s;
  }
  a.solid { background: #4dff88; color: #04140b; }
  a.solid:hover { background: #6dff9f; }
  a.ghost { border: 1px solid rgba(77,255,136,.4); color: #4dff88; }
  a.ghost:hover { background: rgba(77,255,136,.1); }
  .foot { margin-top: 40px; font-size: 11px; color: rgba(231,255,242,.35); font-family: "JetBrains Mono", ui-monospace, monospace; }
</style>
</head>
<body>
<main>
  <p class="term" dir="ltr">&gt; grep -r "این صفحه" / --include="*.route" → no match_</p>
  <h1>۴۰۴ <span>— صفحه پیدا نشد</span></h1>
  <p class="lead">نشانی‌ای که باز کرده‌اید وجود ندارد یا جابه‌جا شده است. می‌توانید از خانه دوباره شروع کنید یا سراغ یکی از مسیرهای اصلی بروید.</p>
  <div class="actions">
    <a class="btn solid" href="${url("")}">بازگشت به خانه</a>
    <a class="btn ghost" href="${url("services")}">دیدن خدمات</a>
    <a class="btn ghost" href="${url("hardware")}">برآورد سخت‌افزار</a>
    <a class="btn ghost" href="${url("compare")}">مقایسهٔ مدل‌ها</a>
  </div>
  <p class="foot" dir="ltr">HOOSH-BARTAR // DC-01 // HTTP 404</p>
</main>
</body>
</html>
`;

const outDir = join(process.cwd(), ".output", "public");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "404.html"), html);
console.log(`404.html written (${html.length} bytes) — noindex, no canonical, real links`);
