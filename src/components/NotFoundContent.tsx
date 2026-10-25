import { Link } from "@tanstack/react-router";

/**
 * Persian 404 body shared by:
 *  - the router's notFoundComponent (client-side/SSR unknown URLs)
 *  - the prerendered /404 route that becomes 404.html on GitHub Pages
 * No canonical is emitted here and the /404 route is noindex (T7): a 404
 * must never consolidate signals into the home page.
 */
export function NotFoundContent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs text-primary" dir="ltr">
          &gt; grep -r "این صفحه" / --include="*.route" → no match
        </p>
        <h1 className="mt-4 text-6xl md:text-7xl font-black text-foreground">
          ۴۰۴ <span className="text-gradient">— صفحه پیدا نشد</span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          نشانی‌ای که باز کرده‌اید وجود ندارد یا جابه‌جا شده است. می‌توانید از خانه دوباره شروع کنید
          یا سراغ یکی از مسیرهای اصلی بروید.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            بازگشت به خانه
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center justify-center rounded-md border border-primary/40 px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
          >
            دیدن خدمات
          </Link>
        </div>
      </div>
    </div>
  );
}
