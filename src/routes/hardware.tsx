import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { Shell } from "@/components/Shell";
import { Reveal } from "@/components/Reveal";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  CATEGORIES,
  CATEGORY_MAP,
  GPUS,
  MAX_USERS,
  MODELS,
  USER_PRESETS,
  sizeFor,
  type ModelCategory,
} from "@/lib/sizing";

const GalaxyScene = lazy(() => import("@/components/GalaxyScene"));

export const Route = createFileRoute("/hardware")({
  head: () => ({
    meta: [
      { title: "کهکشان هوش | هوش برتر" },
      {
        name: "description",
        content:
          "کهکشان سه‌بعدی ۶۱ مدل متن‌باز در ۹ کهکشان — از Kimi K3، DeepSeek V4 و GLM-5.3 تا Wan، TRELLIS و Hunyuan؛ هر دسته یک کهکشان کامل، هر مدل یک ستاره. روی ستاره کلیک کنید، کاربران همزمان را تنظیم کنید و سخت‌افزار و قیمت دلاری را همان‌جا ببینید.",
      },
      { property: "og:title", content: "کهکشان هوش — سالن سه‌بعدی سخت‌افزار | هوش برتر" },
      {
        property: "og:description",
        content:
          "گردش میان کهکشان‌های مدل‌های متن‌باز؛ محاسبهٔ زندهٔ GPU و هزینهٔ استقرار از چت و ایجنت تا تصویر، ویدیو، صدا، تکست‌به‌مش و عکس‌به‌مش — بر اساس کاربران همزمان.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://ssschangersss.github.io/open-model-workshop/hardware" },
    ],
  }),
  component: HardwarePage,
});

const faDigits = (v: number | string) => {
  const FA = "۰۱۲۳۴۵۶۷۸۹";
  return String(v).replace(/\d/g, (d) => FA[Number(d)] ?? d);
};

const catCount = (c: ModelCategory) => MODELS.filter((m) => m.cat === c).length;
const faNum = (n: number) => faDigits(n.toLocaleString("en-US"));

function SizingPanel({
  index,
  users,
  setUsers,
  onClose,
}: {
  index: number;
  users: number;
  setUsers: (n: number) => void;
  onClose: () => void;
}) {
  const m = MODELS[index];
  if (!m) return null;
  const r = sizeFor(m, users);
  const cat = CATEGORY_MAP[m.cat];
  return (
    <div
      dir="rtl"
      className="absolute z-20 inset-x-3 bottom-3 md:inset-x-auto md:start-auto md:end-6 md:top-24 md:bottom-auto md:w-[400px] max-h-[56svh] md:max-h-[calc(100%-200px)] overflow-y-auto panel-glass rounded-xl p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-[11px] font-bold px-1.5 py-0.5 rounded"
              style={{
                color: cat.color,
                border: `1px solid color-mix(in oklab, ${cat.color} 45%, transparent)`,
                background: `color-mix(in oklab, ${cat.color} 12%, transparent)`,
              }}
            >
              {cat.fa}
            </span>
            <span
              className="font-mono text-[11px] px-1.5 py-0.5 rounded border border-primary/40 text-primary"
              dir="ltr"
            >
              {m.params}
            </span>
            <span
              className="font-mono text-[11px] px-1.5 py-0.5 rounded border border-accent/40 text-accent"
              dir="ltr"
            >
              {m.precision}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground" dir="ltr">
              {m.en}
            </span>
          </div>
          <h2 className="mt-2 text-xl font-black">{m.fa}</h2>
          <p
            className="mt-0.5 font-mono text-sm font-bold text-accent"
            dir="ltr"
            style={{ textShadow: `0 0 18px color-mix(in oklab, ${m.accent} 55%, transparent)` }}
          >
            {m.en}
          </p>
          <p className="text-xs text-primary mt-0.5">{m.tagFa}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="بستن"
          className="shrink-0 rounded-md border border-border p-1.5 text-muted-foreground hover:text-primary hover:border-primary/60 transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* کاربرد مدل — جواب مستقیم «این مدل برای چيست؟» */}
      <div
        className="mt-4 rounded-lg border p-3"
        style={{
          borderColor: `color-mix(in oklab, ${cat.color} 30%, transparent)`,
          background: `color-mix(in oklab, ${cat.color} 6%, transparent)`,
        }}
      >
        <p className="text-[11px] font-bold" style={{ color: cat.color }}>
          مناسب برای چه کارهایی؟
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{m.useForFa}</p>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.descFa}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {m.bestForFa.map((b) => (
          <span
            key={b}
            className="text-[11px] rounded-full border border-border bg-muted/40 px-2.5 py-1"
          >
            {b}
          </span>
        ))}
      </div>

      <div className="mt-5 border-t border-primary/15 pt-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold">کاربران همزمان</label>
          <span className="font-mono text-2xl font-black text-primary" dir="ltr">
            {faDigits(users)}
          </span>
        </div>
        <Slider
          dir="ltr"
          className="mt-3"
          value={[users]}
          min={1}
          max={MAX_USERS}
          step={1}
          onValueChange={(v) => setUsers(v[0] ?? 1)}
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {USER_PRESETS.map((n) => (
            <button
              key={n}
              onClick={() => setUsers(n)}
              className={`font-mono text-xs rounded-md border px-2.5 py-1 transition ${
                users === n
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-primary hover:border-primary/50"
              }`}
              dir="ltr"
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-primary/15 pt-4 space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">پردازندهٔ گرافیکی</span>
          <bdi dir="ltr" className="font-mono text-xs">
            {r.gpus}× {r.gpu.name} <span className="text-accent">({r.vramTotalGb}GB VRAM)</span>
          </bdi>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">پلتفرم سرور</span>
          <bdi dir="ltr" className="font-mono text-xs">
            {r.cpuCores}c CPU · {r.ramGb}GB RAM · {r.nvmeTb}TB NVMe
          </bdi>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">توان مصرفی</span>
          <bdi dir="ltr" className="font-mono text-xs">
            {(r.watts / 1000).toFixed(1)}kW · bill ≈ ${r.powerMonthlyUsd.toLocaleString("en-US")}/mo
          </bdi>
        </div>
        {r.nodes > 1 && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">خوشه</span>
            <bdi dir="ltr" className="font-mono text-xs text-accent">
              {r.nodes}× nodes + InfiniBand
            </bdi>
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-primary/25 pt-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">برآورد هزینهٔ سخت‌افزار</p>
            <bdi
              dir="ltr"
              className="block font-mono text-3xl font-black text-primary leading-tight"
            >
              ${r.priceTotal.toLocaleString("en-US")}
            </bdi>
          </div>
          <bdi dir="ltr" className="font-mono text-xs text-muted-foreground">
            ≈ ${r.pricePerUser.toLocaleString("en-US")}/user
          </bdi>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          شامل GPU، سرور، رم، ذخیره‌سازی و شبکه · {m.servingFa} · قیمت قطعات نو، تخمینی و بدون خدمات
          استقرار.
        </p>
        <Link
          to="/contact"
          className="mt-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-lg font-bold glow hover:scale-[1.02] transition"
        >
          دریافت پیش‌فاکتور و استقرار
          <ArrowLeft size={18} />
        </Link>
      </div>
    </div>
  );
}

function HardwarePage() {
  const [sel, setSel] = useState<number | null>(null);
  const [users, setUsers] = useState(10);
  const [catFilter, setCatFilter] = useState<ModelCategory | null>(null);

  const visibleIdx = MODELS.map((m, i) => ({ m, i }))
    .filter((x) => !catFilter || x.m.cat === catFilter)
    .map((x) => x.i);

  const pick = (i: number) => {
    setSel(i);
  };
  const cycle = (dir: 1 | -1) => {
    setSel((s) => {
      const list = visibleIdx;
      if (!list.length) return null;
      if (s === null) return list[0] ?? null;
      const p = list.indexOf(s);
      if (p === -1) return list[0] ?? null;
      return list[(p + dir + list.length) % list.length] ?? null;
    });
  };
  const toggleCat = (c: ModelCategory) => {
    const next = catFilter === c ? null : c;
    setCatFilter(next);
    setSel((s) => (s !== null && next !== null && MODELS[s]?.cat !== next ? null : s));
  };

  // When a galaxy is focused (or a star panel is open) the fixed header copy
  // collapses away so it never collides with the 3D labels underneath.
  const focused = catFilter !== null;
  const collapsed = focused || sel !== null;
  const activeCat = focused ? CATEGORY_MAP[catFilter] : null;

  return (
    <Shell>
      {/* ---------- 3D showroom viewport ---------- */}
      <section className="hw-viewport">
        <ClientOnly fallback={null}>
          <Suspense
            fallback={
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-mono text-primary text-xs animate-pulse">
                  booting galaxy…
                </span>
              </div>
            }
          >
            <GalaxyScene
              focus={sel ?? -1}
              catFilter={catFilter}
              onPick={pick}
              onCorePick={toggleCat}
            />
          </Suspense>
        </ClientOnly>

        {/* header copy over the scene — collapses when a galaxy/panel takes over */}
        <div className="pointer-events-none absolute top-5 inset-x-0 z-10">
          <div className="max-w-6xl mx-auto px-6">
            <div
              aria-hidden={collapsed}
              className={`transition-all duration-500 ease-out overflow-hidden ${
                collapsed
                  ? "max-h-0 opacity-0 -translate-y-3"
                  : "max-h-[560px] opacity-100 translate-y-0"
              }`}
            >
              <p className="font-mono text-xs text-primary" dir="ltr">
                &gt; cd /galaxy/models --explore
              </p>
              <h1 className="mt-2 text-3xl md:text-5xl font-black [text-shadow:0_0_32px_color-mix(in_oklab,var(--primary)_45%,transparent)]">
                کهکشان هوش
              </h1>
              <p className="mt-2 max-w-xl text-sm md:text-base text-muted-foreground">
                شصت‌ویک مدل متن‌باز در نُه کهکشان — هر دسته یک کهکشان کامل و هر مدل یک ستاره در آن؛
                از چت‌بات و استدلال تا تولید تصویر و ویدیو، صدا، و تکست‌به‌مش و عکس‌به‌مش. روی
                ستارهٔ هر مدل کلیک کنید، کاربران همزمانتان را بگویید و سخت‌افزار و قیمت دلاری را
                همان‌جا ببینید.
              </p>

              {/* category filter — پرواز میان کهکشان‌ها */}
              <div className="pointer-events-auto mt-3 flex flex-wrap items-center gap-1.5 max-w-2xl">
                <button
                  onClick={() => {
                    setCatFilter(null);
                    setSel(null);
                  }}
                  className={`text-[11px] font-bold rounded-full border px-2.5 py-1 transition ${
                    catFilter === null
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:text-primary hover:border-primary/50"
                  }`}
                >
                  همهٔ دسته‌ها
                </button>
                {CATEGORIES.map((c) => {
                  const active = catFilter === c.key;
                  return (
                    <button
                      key={c.key}
                      onClick={() => toggleCat(c.key)}
                      title={c.descFa}
                      className={`flex items-center gap-1.5 text-[11px] font-bold rounded-full border px-2.5 py-1 transition ${
                        active
                          ? "text-foreground"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                      style={
                        active
                          ? {
                              borderColor: c.color,
                              background: `color-mix(in oklab, ${c.color} 16%, transparent)`,
                              boxShadow: `0 0 12px color-mix(in oklab, ${c.color} 35%, transparent)`,
                            }
                          : undefined
                      }
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: c.color, boxShadow: `0 0 6px ${c.color}` }}
                      />
                      {c.fa}
                      <span className="font-mono text-[9px] opacity-70" dir="ltr">
                        ×{faDigits(catCount(c.key))}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 hidden md:block text-[10px] text-muted-foreground/70">
                روی یک کهکشان بزنید تا دوربین به همان کهکشان پرواز کند و بقیه کم‌نور شوند؛ با
                نگه‌داشتن نشانگر روی هستهٔ هر کهکشان، نام دسته را می‌بینید و کلیک روی هسته هم به
                همان کهکشان می‌برد. کاربرد هر مدل داخل پنل همان ستاره نوشته شده است.
              </p>
            </div>

            {/* focused mode — compact bar instead of the full copy:
                back to overview + name of the galaxy you are inside */}
            {focused && activeCat && (
              <div
                className="pointer-events-auto mt-3 flex flex-wrap items-center gap-2"
                style={{ animation: "fadeSlideDown 0.45s ease-out both" }}
              >
                <button
                  onClick={() => {
                    setCatFilter(null);
                    setSel(null);
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary backdrop-blur transition hover:bg-primary/20"
                >
                  <ChevronRight size={14} />
                  همهٔ کهکشان‌ها
                </button>
                <span
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold backdrop-blur"
                  style={{
                    color: activeCat.color,
                    borderColor: `color-mix(in oklab, ${activeCat.color} 45%, transparent)`,
                    background: `color-mix(in oklab, ${activeCat.color} 12%, transparent)`,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: activeCat.color,
                      boxShadow: `0 0 6px ${activeCat.color}`,
                    }}
                  />
                  {activeCat.fa}
                  <span className="font-mono text-[9px] opacity-70" dir="ltr">
                    ×{faDigits(catCount(catFilter!))}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* galaxy / star navigation */}
        <div
          className={`absolute z-10 inset-x-0 bottom-24 md:bottom-5 flex justify-center items-center gap-3 ${
            sel !== null ? "max-md:hidden" : ""
          }`}
        >
          <button
            onClick={() => cycle(1)}
            aria-label="ستارهٔ بعدی"
            className="panel-glass rounded-full p-2.5 text-primary hover:scale-110 transition"
          >
            <ChevronRight size={18} />
          </button>
          <div className="panel-glass rounded-full px-4 py-2.5 flex items-center gap-2.5">
            {catFilter === null
              ? CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => toggleCat(c.key)}
                    aria-label={c.fa}
                    title={`${c.fa} — ${catCount(c.key)} مدل`}
                    className="h-2.5 w-2.5 rounded-full transition-transform hover:scale-125"
                    style={{
                      background: c.color,
                      boxShadow: `0 0 9px ${c.color}`,
                    }}
                  />
                ))
              : MODELS.map((m, i) =>
                  m.cat === catFilter ? (
                    <button
                      key={m.id}
                      onClick={() => pick(i)}
                      aria-label={m.fa}
                      title={m.fa}
                      className="h-2.5 w-2.5 rounded-full transition-transform hover:scale-125"
                      style={
                        sel === i
                          ? { background: m.accent, boxShadow: `0 0 10px ${m.accent}` }
                          : {
                              border:
                                "1px solid color-mix(in oklab, var(--primary) 45%, transparent)",
                            }
                      }
                    />
                  ) : null,
                )}
            <span className="ms-1 ps-2 border-s border-primary/25 font-bold text-[10px] text-muted-foreground whitespace-nowrap">
              {catFilter === null
                ? `${faNum(MODELS.length)} ستاره در ${faNum(CATEGORIES.length)} کهکشان`
                : `${faNum(catCount(catFilter))} ستاره`}
            </span>
          </div>
          <button
            onClick={() => cycle(-1)}
            aria-label="ستارهٔ قبلی"
            className="panel-glass rounded-full p-2.5 text-primary hover:scale-110 transition"
          >
            <ChevronLeft size={18} />
          </button>
          <span
            className="hidden md:inline font-mono text-[10px] text-muted-foreground ms-2"
            dir="ltr"
          >
            DRAG TO ORBIT · CLICK A STAR
          </span>
        </div>

        {sel !== null && (
          <SizingPanel index={sel} users={users} setUsers={setUsers} onClose={() => setSel(null)} />
        )}
      </section>

      {/* ---------- reference table (SSG-rendered) ---------- */}
      <section
        className="cv-auto relative z-10 max-w-6xl mx-auto px-6 py-20"
        style={{ "--cv-size": "7000px" } as React.CSSProperties}
      >
        <Reveal>
          <p className="font-mono text-xs text-primary" dir="ltr">
            &gt; cat sizing-table.md
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-black">
            جدول مرجع: <span className="text-gradient">سخت‌افزار لازم</span> برای هر مدل
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            خلاصهٔ محاسبات کهکشان برای سه سناریوی ترافیک، به‌همراه دسته و کاربرد اصلی هر مدل. عدد
            دقیق و پیکربندی اختصاصی‌تان را داخل کهکشان‌ها و با اسلایدر کاربران همزمان بگیرید.
          </p>
        </Reveal>
        <Reveal delay={120}>
          {/* desktop: full table */}
          <div className="mt-8 overflow-x-auto panel-glass rounded-xl hidden md:block">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="border-b border-primary/25 text-xs text-muted-foreground">
                  <th className="p-3.5 text-start font-bold">مدل</th>
                  <th className="p-3.5 text-start font-bold">دسته</th>
                  <th className="p-3.5 text-start font-bold">کاربرد اصلی</th>
                  <th className="p-3.5 text-start font-bold">دقت</th>
                  <th className="p-3.5 text-start font-bold">۵ کاربر</th>
                  <th className="p-3.5 text-start font-bold">۲۵ کاربر</th>
                  <th className="p-3.5 text-start font-bold">۱۰۰ کاربر</th>
                </tr>
              </thead>
              <tbody>
                {MODELS.map((m) => {
                  const cat = CATEGORY_MAP[m.cat];
                  return (
                    <tr
                      key={m.id}
                      className="border-b border-border/60 hover:bg-primary/5 transition"
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ background: m.accent, boxShadow: `0 0 8px ${m.accent}` }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{m.fa}</span>
                              <span
                                className="font-mono text-[10px] text-muted-foreground"
                                dir="ltr"
                              >
                                {m.params}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-accent/90" dir="ltr">
                              {m.en}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            color: cat.color,
                            border: `1px solid color-mix(in oklab, ${cat.color} 40%, transparent)`,
                          }}
                        >
                          {cat.fa}
                        </span>
                      </td>
                      <td className="p-3.5 text-xs text-muted-foreground">{m.bestForFa[0]}</td>
                      <td className="p-3.5 font-mono text-xs" dir="ltr">
                        {m.precision}
                      </td>
                      {[5, 25, 100].map((u) => {
                        const r = sizeFor(m, u);
                        return (
                          <td key={u} className="p-3.5 whitespace-nowrap">
                            <bdi dir="ltr" className="font-mono text-xs">
                              {r.gpus}× {GPUS[m.gpu].name}
                            </bdi>
                            <bdi dir="ltr" className="block font-mono text-xs text-primary">
                              ${r.priceTotal.toLocaleString("en-US")}
                            </bdi>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* mobile: card list — no cramped table, no horizontal scroll */}
          <div className="mt-6 md:hidden grid gap-3">
            {MODELS.map((m) => {
              const cat = CATEGORY_MAP[m.cat];
              return (
                <article key={m.id} className="panel-glass rounded-xl p-4 border border-border/60">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: m.accent, boxShadow: `0 0 8px ${m.accent}` }}
                    />
                    <h3 className="font-bold text-sm">{m.fa}</h3>
                    <span className="font-mono text-[9px] text-muted-foreground" dir="ltr">
                      {m.params}
                    </span>
                    <span
                      className="ms-auto text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                      style={{
                        color: cat.color,
                        border: `1px solid color-mix(in oklab, ${cat.color} 40%, transparent)`,
                      }}
                    >
                      {cat.fa}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[10px] text-accent/90 text-start" dir="ltr">
                    {m.en} · {m.precision}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[5, 25, 100].map((u) => {
                      const r = sizeFor(m, u);
                      return (
                        <div
                          key={u}
                          className="rounded-lg bg-muted/30 border border-border/50 p-2 text-center"
                        >
                          <p className="font-mono text-[9px] text-muted-foreground" dir="ltr">
                            {u} USERS
                          </p>
                          <bdi dir="ltr" className="block font-mono text-[11px] font-bold mt-1">
                            {r.gpus}× {GPUS[m.gpu].name}
                          </bdi>
                          <bdi
                            dir="ltr"
                            className="block font-mono text-[11px] text-primary mt-0.5"
                          >
                            ${r.priceTotal.toLocaleString("en-US")}
                          </bdi>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </Reveal>

        {/* دسته‌بندی — راهنمای کوتاه دسته‌ها */}
        <Reveal delay={140}>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <div key={c.key} className="panel-glass rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }}
                  />
                  <h3 className="font-bold text-sm">{c.fa}</h3>
                  <span className="font-mono text-[10px] text-muted-foreground ms-auto" dir="ltr">
                    {c.en}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.descFa}</p>
                <p className="mt-2 font-mono text-[10px] text-primary" dir="ltr">
                  {MODELS.filter((m) => m.cat === c.key)
                    .map((m) => m.en.split(" · ")[0])
                    .join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-14 panel-glass rounded-xl p-8 flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="font-mono text-xs text-primary" dir="ltr">
                &gt; ./plan --hardware=done --next=automation
              </p>
              <h2 className="mt-2 text-2xl font-black">سخت‌افزارتان را انتخاب کردید؟</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                مرحلهٔ بعد، زنده کردن آن با n8n، Flowise و ایجنت‌های هوشمند است — یا ببینید مشتریان
                واقعی چه ساخته‌اند.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/showcase"
                className="inline-flex items-center gap-2 border border-primary/50 text-primary px-6 py-3.5 rounded-lg font-bold hover:bg-primary/10 transition"
              >
                نمونه‌کارهای واقعی
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-lg font-bold glow hover:scale-105 transition"
              >
                شروع پروژه
                <ArrowLeft size={18} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </Shell>
  );
}
