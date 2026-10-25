#!/usr/bin/env node
/**
 * Static server that emulates GitHub Pages project-site behavior for the
 * SSG output in .output/public:
 *   - clean URLs:  /hardware  →  /hardware/index.html
 *   - base path:   /open-model-workshop/... (strip prefix before resolving)
 *   - REAL 404 for unknown paths (no SPA history fallback — routing errors
 *     must stay visible, exactly like the production host)
 * Usage: node scripts/static-server.mjs [port] [rootDir]
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import zlib from "node:zlib";
import { join, normalize, extname } from "node:path";

const port = Number(process.argv[2] ?? 4173);
const root = process.argv[3] ?? ".output/public";
const BASE = "/open-model-workshop/";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};

async function resolveFile(urlPath) {
  const clean = urlPath.split("?")[0].split("#")[0];
  let p = clean;
  if (p.startsWith(BASE)) p = p.slice(BASE.length - 1); // keep leading "/"
  const safe = normalize(p).replace(/^(\.\.[/\\])+/, "");
  // GitHub Pages emits a 301 for a directory URL without the trailing slash
  if (p !== "/" && !p.endsWith("/") && !extname(p)) {
    try {
      const s = await stat(join(root, safe.replace(/^\//, ""), "index.html"));
      if (s.isFile()) return { redirect: clean + "/" };
    } catch {
      /* not a directory */
    }
  }
  const candidates = [];
  if (p === "/" || p === "") candidates.push("index.html");
  else {
    candidates.push(safe.replace(/^\//, ""));
    candidates.push(join(safe.replace(/^\//, ""), "index.html"));
    candidates.push(safe.replace(/^\//, "") + ".html");
  }
  for (const c of candidates) {
    try {
      const full = join(root, c);
      const s = await stat(full);
      if (s.isFile()) return full;
    } catch {
      /* try next */
    }
  }
  return null;
}

const server = createServer(async (req, res) => {
  const file = await resolveFile(req.url ?? "/");
  if (file && typeof file === "object" && "redirect" in file) {
    res.writeHead(301, { location: file.redirect });
    res.end();
    return;
  }
  if (!file) {
    // GitHub Pages: serve /404.html with status 404 when present
    try {
      const body = await readFile(join(root, "404.html"));
      res.writeHead(404, { "content-type": MIME[".html"] });
      res.end(body);
      return;
    } catch {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("Not Found");
      return;
    }
  }
  // GitHub Pages compresses text assets (gzip/br) — the lab must measure
  // the same transfer behavior, otherwise absolute LCP/byte numbers are
  // inflated and useless against the numeric targets.
  const ext = extname(file);
  const compressible = [".html", ".js", ".css", ".svg", ".xml", ".txt", ".json"].includes(ext);
  const acceptGzip = String(req.headers["accept-encoding"] ?? "").includes("gzip");
  const body = await readFile(file);
  if (compressible && acceptGzip) {
    const gz = await new Promise((resolve) => zlib.gzip(body, (_, b) => resolve(b)));
    res.writeHead(200, {
      "content-type": MIME[ext] ?? "application/octet-stream",
      "content-encoding": "gzip",
      vary: "accept-encoding",
      "cache-control": ext === ".html" ? "no-cache" : "public, max-age=3600",
    });
    res.end(gz);
    return;
  }
  res.writeHead(200, {
    "content-type": MIME[ext] ?? "application/octet-stream",
    "cache-control": ext === ".html" ? "no-cache" : "public, max-age=3600",
  });
  res.end(body);
});

server.listen(port, "127.0.0.1", () =>
  console.log(`static-server on http://127.0.0.1:${port}${BASE}`),
);
