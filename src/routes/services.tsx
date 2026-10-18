import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, services } from "@/components/Shell";
import { Reveal } from "@/components/Reveal";
import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

const DatacenterScene = lazy(() => import("@/components/DatacenterScene"));

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "خدمات | هوش برتر" },
      {
        name: "description",
        content:
          "اتوماسیون n8n، Flowise، استقرار سرور AI، بستن سخت‌افزار GPU و راه‌اندازی مدل‌های open-weight.",
      },
      { property: "og:title", content: "خدمات هوش برتر" },
      { property: "og:description", content: "فهرست کامل خدمات اتوماسیون و زیرساخت هوش مصنوعی." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Services,
});

function Services() {
  return (
    <Shell>
      {/* 3D showroom behind the page (camera parked mid-corridor) */}
      <div className="scene-fixed" aria-hidden>
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <DatacenterScene mode="fixed" model={-1} />
          </Suspense>
        </ClientOnly>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <p className="font-mono text-xs text-primary" dir="ltr">
          &gt; cd /showroom && ./list-services --verbose
        </p>
        <h1 className="mt-4 text-4xl font-black">شوروم خدمات</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          در راهروی دیتاسنتر قدم بزنید و ماژول موردنظرتان را بردارید؛ از ایده تا اجرا روی زیرساخت
          خودتان.
        </p>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <Reveal key={s.tag} delay={i * 80}>
              <article className="rack-card p-6 h-full hover:border-primary/70 transition group">
                {/* rack faceplate */}
                <div className="flex items-center gap-1 mb-5" aria-hidden>
                  <span className="status-dot" />
                  <span className="font-mono text-[10px] text-primary/70 tracking-widest" dir="ltr">
                    UNIT-{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="ms-auto flex gap-1">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <span
                        key={j}
                        className={`h-1 w-1 rounded-full ${j % 3 === 0 ? "bg-primary" : "bg-primary/30"}`}
                      />
                    ))}
                  </span>
                </div>
                <span className="font-mono text-xs text-accent" dir="ltr">
                  #{s.tag}
                </span>
                <h3 className="mt-2 font-bold text-lg group-hover:text-primary transition-colors">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                <div
                  className="mt-5 font-mono text-[10px] text-muted-foreground border-t border-primary/15 pt-3"
                  dir="ltr"
                >
                  STATUS: <span className="text-primary">AVAILABLE</span> · SLA: 99.9%
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <div className="mt-14 panel-glass rounded-xl p-8 flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="font-mono text-xs text-primary" dir="ltr">
                &gt; deploy --to=your-infra
              </p>
              <h2 className="mt-2 text-2xl font-black">ماژول مناسب‌تان را پیدا کردید؟</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                در یک جلسه ۳۰ دقیقه‌ای معماری دقیقش را روی نقشه می‌کشیم.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold glow hover:scale-105 transition"
            >
              شروع پروژه
              <ArrowLeft />
            </Link>
          </div>
        </Reveal>
      </div>
    </Shell>
  );
}
