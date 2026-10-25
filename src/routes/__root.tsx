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
// Critical above-the-fold fonts, preloaded with their real hashed URLs so
// the swap happens before first text paint instead of after (T8 — the
// lab-measured dominant CLS cause was the Vazirmatn swap reflow).
import vazirmatnRegularUrl from "../assets/fonts/Vazirmatn-Regular-sub.woff2?url";
import vazirmatnBoldUrl from "../assets/fonts/Vazirmatn-Bold-sub.woff2?url";
import vazirMatrixBoldUrl from "../assets/fonts/VazirMatrix-Bold-sub.woff2?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SITE_LOCALE, SITE_NAME, absoluteUrl } from "@/lib/site";
import { NotFoundContent } from "@/components/NotFoundContent";

/**
 * Deployment root: "/" (SSR / Lovable) or "/open-model-workshop/" (GitHub
 * Pages static build). Every hand-written absolute URL must go through
 * BASE_URL so BOTH deployments work.
 */
const BASE = import.meta.env.BASE_URL || "/";

/** The site's own home, correct under any base path. */
const homeHref = () => (BASE.endsWith("/") ? BASE : `${BASE}/`);

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
      { title: SITE_NAME },
      { name: "description", content: "اتوماسیون و زیرساخت هوش مصنوعی" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: SITE_LOCALE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#050c07" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // Exactly three preloads: the fonts the first viewport actually needs
      // (body regular + headings bold + brand matrix). Everything else
      // (Medium, JetBrains Mono, Vazir Matrix Regular) stays discovery-based.
      {
        rel: "preload",
        href: vazirmatnRegularUrl,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: vazirmatnBoldUrl,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: vazirMatrixBoldUrl,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      // JetBrains Mono is self-hosted (latin subset) inside the bundled CSS —
      // no third-party request, no render-blocking stylesheet round-trip.
      { rel: "icon", href: `${BASE}favicon.ico`, type: "image/x-icon" },
    ],
    scripts: [
      {
        // Structured data for search engines — URLs/ids from the shared site
        // config so every deployment target stays consistent (T6).
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "ProfessionalService",
              "@id": absoluteUrl("/#org"),
              name: SITE_NAME,
              url: absoluteUrl("/"),
              description:
                "اتوماسیون کسب‌وکار با n8n و Flowise، استقرار سرور هوش مصنوعی و بستن سخت‌افزار GPU",
              areaServed: "IR",
              knowsLanguage: ["fa", "en"],
            },
            {
              "@type": "WebSite",
              "@id": absoluteUrl("/#site"),
              url: absoluteUrl("/"),
              name: SITE_NAME,
              inLanguage: "fa-IR",
              publisher: { "@id": absoluteUrl("/#org") },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundContent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <HeadContent />
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
