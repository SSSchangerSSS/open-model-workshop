import { withBase } from "./base";

/**
 * Fallback HTML for catastrophic server-side failures (SSR mode only —
 * the GitHub Pages deployment is fully static and never executes this).
 * Persian + actionable, same tone as the client error boundary.
 */
export function renderErrorPage(): string {
  const home = withBase("/");
  return `<!doctype html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>این صفحه بارگذاری نشد | هوش برتر</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.7 system-ui, -apple-system, sans-serif; background: #071009; color: #e6ffef; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; color: #eafff2; }
      p { color: #9fb8aa; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.6rem 1.1rem; border-radius: 0.5rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #4dff88; color: #04140b; font-weight: 700; }
      .secondary { background: transparent; color: #eafff2; border-color: #2c4638; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>این صفحه بارگذاری نشد</h1>
      <p>مشکلی سمت ما پیش آمد. می‌توانید دوباره تلاش کنید یا به خانه برگردید.</p>
      <div class="actions">
        <button type="button" class="primary" onclick="location.reload()">تلاش دوباره</button>
        <a class="secondary" href="${home}">بازگشت به خانه</a>
      </div>
    </div>
  </body>
</html>`;
}
