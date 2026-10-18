import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, services, SERVICE_GOALS } from "@/components/Shell";
import { Reveal } from "@/components/Reveal";
import { Tilt, Magnetic } from "@/components/Interactive";
import { lazy, Suspense, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { ArrowLeft, Check, ChevronDown, Clock, PackageCheck, Wrench } from "lucide-react";

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

type Service = (typeof services)[number];
type GoalKey = (typeof SERVICE_GOALS)[number]["key"];

/** تفاضل ماژول‌ها بر اساس هدف انتخابی؛ اگر هدفی انتخاب نشده همه روشن‌اند */
function matchGoal(s: Service, goal: GoalKey | null) {
  if (!goal) return true;
  return (s.goals as readonly string[]).includes(goal);
}

function ServiceCard({
  s,
  i,
  dimmed,
  matched,
}: {
  s: Service;
  i: number;
  dimmed: boolean;
  matched: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={i * 80} className="h-full">
      <Tilt max={6} className="h-full">
        <article
          className={`rack-card scan-hover lift p-6 h-full flex flex-col group transition-opacity duration-500 ${
            dimmed ? "opacity-35 saturate-0" : ""
          } ${matched && !dimmed ? "border-primary/60" : ""}`}
        >
          {/* rack faceplate */}
          <div className="flex items-center gap-1 mb-5" aria-hidden>
            <span className="status-dot" />
            <span className="font-mono text-[10px] text-primary/70 tracking-widest" dir="ltr">
              UNIT-{String(i + 1).padStart(2, "0")}
            </span>
            {matched && (
              <span className="font-mono text-[9px] text-primary border border-primary/50 rounded px-1.5 py-0.5 ms-2" dir="ltr">
                MATCH
              </span>
            )}
            <span className="ms-auto flex gap-1">
              {Array.from({ length: 8 }).map((_, j) => (
                <span
                  key={j}
                  className={`h-1 w-1 rounded-full transition-colors ${
                    j % 3 === 0 ? "bg-primary" : "bg-primary/30"
                  } group-hover:bg-primary/70`}
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
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>

          {/* expandable detail — features, tools, ETA */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="mt-4 flex items-center gap-2 text-sm font-bold text-primary/90 hover:text-primary transition"
            aria-expanded={open}
          >
            {open ? "بستن جزئیات" : "چه چیزی تحویل می‌گیرید؟"}
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            />
          </button>
          <div
            className="grid transition-[grid-template-rows] duration-400 ease-out"
            style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <ul className="mt-4 space-y-2.5">
                {s.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm leading-relaxed">
                    <span className="mt-0.5 grid place-items-center h-4.5 w-4.5 shrink-0 rounded-full border border-primary/50 text-primary">
                      <Check size={10} />
                    </span>
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-1.5" dir="ltr">
                {s.tools.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[10px] rounded border border-primary/30 bg-primary/5 text-primary px-1.5 py-0.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock size={13} className="text-accent" />
                زمان تحویل معمول: <b className="text-foreground">{s.eta}</b>
              </p>
            </div>
          </div>

          {/* footer: status + live load meter */}
          <div className="mt-auto pt-5">
            <div className="font-mono text-[10px] text-muted-foreground border-t border-primary/15 pt-3 space-y-2" dir="ltr">
              <div className="flex items-center justify-between">
                <span>
                  STATUS: <span className="text-primary">AVAILABLE</span> · SLA: 99.9%
                </span>
                <span className="flex items-center gap-1.5">
                  <Wrench size={10} className="text-accent" />
                  {s.eta}
                </span>
              </div>
              <div className="meter-bar" aria-hidden />
            </div>
          </div>
        </article>
      </Tilt>
    </Reveal>
  );
}

function Services() {
  const [goal, setGoal] = useState<GoalKey | null>(null);
  const activeGoal = SERVICE_GOALS.find((g) => g.key === goal);

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
        <h1 className="mt-4 text-4xl font-black">
          شوروم <span className="text-gradient">خدمات</span>
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
          در راهروی دیتاسنتر قدم بزنید و ماژول موردنظرتان را بردارید؛ هر ماژول قابل باز شدن است —
          لیست تحویلی‌ها، ابزارها و زمان تحویل را قبل از صحبت ببینید.
        </p>

        {/* هدف‌یاب — هدف را انتخاب کنید، ماژول‌های مرتبط روشن می‌شوند */}
        <Reveal delay={100}>
          <div className="mt-10 panel-glass rounded-xl p-5 md:p-6">
            <p className="flex items-center gap-2 text-sm font-bold">
              <PackageCheck size={16} className="text-primary" />
              امروز چه هدفی دارید؟
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              یک گزینه را انتخاب کنید؛ ماژول‌های مرتبط روشن و بقیه کم‌نور می‌شوند.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SERVICE_GOALS.map((g) => {
                const active = goal === g.key;
                return (
                  <button
                    key={g.key}
                    onClick={() => setGoal(active ? null : g.key)}
                    title={g.hint}
                    aria-pressed={active}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      active
                        ? "border-primary bg-primary/15 text-primary glow"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
              {goal && (
                <button
                  onClick={() => setGoal(null)}
                  className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition"
                >
                  نمایش همه
                </button>
              )}
            </div>
            {activeGoal && (
              <p className="mt-3 font-mono text-[11px] text-accent animate-in fade-in" dir="rtl">
                &gt; مسیر پیشنهادی: {activeGoal.hint}
              </p>
            )}
          </div>
        </Reveal>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, i) => {
            const matched = matchGoal(s, goal);
            return (
              <ServiceCard
                key={s.tag}
                s={s}
                i={i}
                dimmed={goal !== null && !matched}
                matched={matched}
              />
            );
          })}
        </div>

        {/* امار زنده شوروم */}
        <Reveal delay={120}>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ["۴۰+", "ورک‌فلوی فعال"],
              ["۶۱", "مدل آماده استقرار"],
              ["۹۹٫۹٪", "آپ‌تایم تضمینی"],
              ["< ۲ ساعت", "پاسخ پشتیبانی"],
            ].map(([v, l]) => (
              <div key={l} className="lift rack-card px-4 py-5 text-center">
                <div className="text-2xl font-black text-primary">{v}</div>
                <div className="mt-1 text-xs text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </Reveal>

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
            <Magnetic>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold glow hover:scale-105 transition"
              >
                شروع پروژه
                <ArrowLeft />
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </Shell>
  );
}
