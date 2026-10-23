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
import { withBase } from "../lib/base";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <p className="font-mono text-xs text-primary" dir="ltr">
        &gt; find / --path=unknown — exit 1
      </p>
      <h1 className="mt-4 text-6xl font-black text-foreground">۴۰۴</h1>
      <h2 className="mt-3 text-xl font-semibold text-foreground">این صفحه پیدا نشد</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        نشانی‌ای که باز کرده‌اید وجود ندارد یا جابه‌جا شده است. می‌توانید از خانه ادامه دهید یا سراغ
        یکی از مسیرهای پرکاربرد بروید.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          بازگشت به خانه
        </Link>
        <Link
          to="/hardware"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-primary/50 px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
        >
          کهکشان سخت‌افزار
        </Link>
        <Link
          to="/compare"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary/50"
        >
          مقایسهٔ مدل‌ها
        </Link>
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <p className="font-mono text-xs text-primary" dir="ltr">
        &gt; render --failed — exit 1
      </p>
      <h1 className="mt-4 text-2xl font-black text-foreground">این صفحه بارگذاری نشد</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        مشکلی سمت ما پیش آمد. می‌توانید دوباره تلاش کنید یا به خانه برگردید؛ اگر تکرار شد، چند دقیقه
        بعد مراجعه کنید.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          تلاش دوباره
        </button>
        <a
          href={withBase("/")}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-accent"
        >
          بازگشت به خانه
        </a>
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
      // favicon MUST go through withBase(): a bare "/favicon.ico" 404s when
      // the site is deployed under /open-model-workshop/ (GitHub Pages).
      { rel: "icon", href: withBase("favicon.ico"), type: "image/x-icon" },
    ],
    scripts: [
      {
        // Runs BEFORE first paint. Two jobs:
        // 1) Arm the boot intro only when it is allowed to play (first visit
        //    of this session, JS on, desktop width, motion allowed). Without
        //    JS nothing is ever armed → the overlay stays display:none and
        //    never covers the content.
        // 2) On repeat visits add `intro-done` instantly (no flash).
        children:
          "try{" +
          "if(sessionStorage.getItem('intro')){document.documentElement.classList.add('intro-done')}" +
          "else if(!matchMedia('(prefers-reduced-motion: reduce)').matches && !matchMedia('(max-width: 767px)').matches){document.documentElement.classList.add('intro-armed')}" +
          "}catch(e){}",
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
