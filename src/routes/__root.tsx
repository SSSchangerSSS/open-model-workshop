import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

/**
 * Deployment root: "/" (SSR / Lovable) or "/open-model-workshop/" (GitHub
 * Pages static build). Every hand-written absolute URL must go through
 * BASE_URL so BOTH deployments work.
 */
const BASE = import.meta.env.BASE_URL || "/";

/** The site's own home, correct under any base path. */
const homeHref = () => (BASE.endsWith("/") ? BASE : `${BASE}/`);

function NotFoundComponent() {
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

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs text-primary" dir="ltr">
          &gt; tail -f /var/log/error.log
        </p>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-foreground">
          این صفحه بارگذاری نشد
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          مشکلی سمت ما پیش آمد. می‌توانید دوباره تلاش کنید — اگر تکرار شد، از خانه شروع کنید یا صفحه
          را رفرش بگیرید.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            تلاش دوباره
          </button>
          <a
            href={homeHref()}
            className="inline-flex items-center justify-center rounded-md border border-primary/40 px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
          >
            بازگشت به خانه
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "هوش برتر" },
      { name: "description", content: "اتوماسیون و زیرساخت هوش مصنوعی" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "هوش برتر" },
      { property: "og:locale", content: "fa_IR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#050c07" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // JetBrains Mono is self-hosted (latin subset) inside the bundled CSS —
      // no third-party request, no render-blocking stylesheet round-trip.
      { rel: "icon", href: `${BASE}favicon.ico`, type: "image/x-icon" },
    ],
    scripts: [
      {
        // Runs BEFORE first paint: if the boot intro already played in this
        // session, hide it instantly (no flash on repeat visits / SPA navigations).
        children:
          "try{if(sessionStorage.getItem('intro'))document.documentElement.classList.add('intro-done')}catch(e){}",
      },
      {
        // Marks JS as available BEFORE first paint so `.reveal` blocks only
        // hide content when the IntersectionObserver can actually un-hide
        // them. Without JavaScript the markup stays fully visible.
        children: "document.documentElement.classList.add('js')",
      },
      {
        // Structured data for search engines
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "ProfessionalService",
              "@id": "https://ssschangersss.github.io/open-model-workshop/#org",
              name: "هوش برتر",
              url: "https://ssschangersss.github.io/open-model-workshop/",
              description:
                "اتوماسیون کسب‌وکار با n8n و Flowise، استقرار سرور هوش مصنوعی و بستن سخت‌افزار GPU",
              areaServed: "IR",
              knowsLanguage: ["fa", "en"],
            },
            {
              "@type": "WebSite",
              "@id": "https://ssschangersss.github.io/open-model-workshop/#site",
              url: "https://ssschangersss.github.io/open-model-workshop/",
              name: "هوش برتر",
              inLanguage: "fa-IR",
              publisher: { "@id": "https://ssschangersss.github.io/open-model-workshop/#org" },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <HeadContent />
        {/* No JavaScript → the boot intro must never cover the content. */}
        <noscript>
          <style>{`#boot-overlay{display:none !important}`}</style>
        </noscript>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
