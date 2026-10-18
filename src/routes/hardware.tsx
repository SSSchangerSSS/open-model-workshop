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

const HardwareScene = lazy(() => import("@/components/HardwareScene"));

export const Route = createFileRoute("/hardware")({
  head: () => ({
    meta: [
      { title: "سالن سخت‌افزار | هوش برتر" },
      {
        name: "description",
        content:
          "در سالن سه‌بعدی سرورهای ۱۵ مدل متن‌باز را در ۷ دسته ببینید — چت، ایجنت، استدلال، تصویر، ویدیو، صوت و RAG؛ کاربران همزمان را وارد کنید و سخت‌افزار و قیمت دلاری را همان‌جا ببینید.",
      },
      { property: "og:title", content: "سالن سخت‌افزار سه‌بعدی | هوش برتر" },
      {
        property: "og:description",
        content:
          "محاسبهٔ زندهٔ GPU و هزینهٔ استقرار مدل‌های متن‌باز — از چت و ایجنت تا تصویر، ویدیو و صوت — بر اساس کاربران همزمان.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HardwarePage,
});

const faDigits = (v: number | string) => String(v).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

const catCount = (c: ModelCategory) => MODELS.filter((m) => m.cat === c).length;

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
      if (s === null) return list[0];
      const p = list.indexOf(s);
      if (p === -1) return list[0];
      return list[(p + dir + list.length) % list.length];
    });
  };
  const toggleCat = (c: ModelCategory) => {
    const next = catFilter === c ? null : c;
    setCatFilter(next);
    setSel((s) => (s !== null && next !== null && MODELS[s].cat !== next ? null : s));
  };

  return (
    <Shell>
      {/* ---------- 3D showroom viewport ---------- */}
      <section className="hw-viewport">
        <ClientOnly fallback={null}>
          <Suspense
            fallback={
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-mono text-primary text-xs animate-pulse">
                  booting showroom…
                </span>
              </div>
            }
          >
            <HardwareScene focus={sel ?? -1} catFilter={catFilter} onPick={pick} />
          </Suspense>
        </ClientOnly>

        {/* header copy over the scene */}
        <div className="pointer-events-none absolute top-5 inset-x-0 z-10">
          <div className="max-w-6xl mx-auto px-6">
            <p className="font-mono text-xs text-primary" dir="ltr">
              &gt; cd /showroom/hardware --configure
            </p>
            <h1 className="mt-2 text-3xl md:text-5xl font-black [text-shadow:0_0_32px_color-mix(in_oklab,var(--primary)_45%,transparent)]">
              سالن سخت‌افزار
            </h1>
            <p className="mt-2 max-w-xl text-sm md:text-base text-muted-foreground">
              پانزده مدل متن‌باز در هفت دسته — از چت و عامل هوشمند تا تصویر، ویدیو و صوت. روی هر
              سرور کلیک کنید، کاربران همزمانتان را بگویید و سخت‌افزار و قیمت دلاری را همان‌جا
              ببینید.
            </p>

            {/* category filter — روشن/خاموش کردن بخش‌های سالن */}
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
              روی یک دسته بزنید تا فقط سرورهای همان بخش روشن بمانند؛ کاربرد هر مدل داخل پنل همان
              سرور نوشته شده است.
            </p>
          </div>
        </div>

        {/* pod navigation */}
        <div
          className={`absolute z-10 inset-x-0 bottom-24 md:bottom-5 flex justify-center items-center gap-3 ${
            sel !== null ? "max-md:hidden" : ""
          }`}
        >
          <button
            onClick={() => cycle(1)}
            aria-label="سرور بعدی"
            className="panel-glass rounded-full p-2.5 text-primary hover:scale-110 transition"
          >
            <ChevronRight size={18} />
          </button>
          <div className="panel-glass rounded-full px-4 py-2.5 flex items-center gap-2.5">
            {MODELS.map((m, i) => (
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
                        border: "1px solid color-mix(in oklab, var(--primary) 45%, transparent)",
                        opacity: catFilter && m.cat !== catFilter ? 0.25 : 1,
                      }
                }
              />
            ))}
          </div>
          <button
            onClick={() => cycle(-1)}
            aria-label="سرور قبلی"
            className="panel-glass rounded-full p-2.5 text-primary hover:scale-110 transition"
          >
            <ChevronLeft size={18} />
          </button>
          <span
            className="hidden md:inline font-mono text-[10px] text-muted-foreground ms-2"
            dir="ltr"
          >
            DRAG TO ORBIT · CLICK A POD
          </span>
        </div>

        {sel !== null && (
          <SizingPanel index={sel} users={users} setUsers={setUsers} onClose={() => setSel(null)} />
        )}
      </section>

      {/* ---------- reference table (SSG-rendered) ---------- */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <Reveal>
          <p className="font-mono text-xs text-primary" dir="ltr">
            &gt; cat sizing-table.md
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-black">
            جدول مرجع: <span className="text-gradient">سخت‌افزار لازم</span> برای هر مدل
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            خلاصهٔ محاسبات سالن سه‌بعدی برای سه سناریوی ترافیک، به‌همراه دسته و کاربرد اصلی هر مدل.
            عدد دقیق و پیکربندی اختصاصی‌تان را داخل سالن و با اسلایدر کاربران همزمان بگیرید.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-8 overflow-x-auto panel-glass rounded-xl">
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
                          <span className="font-bold">{m.fa}</span>
                          <span className="font-mono text-[10px] text-muted-foreground" dir="ltr">
                            {m.params}
                          </span>
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
        </Reveal>

        {/* دسته‌بندی — راهنمای کوتاه دسته‌ها */}
        <Reveal delay={140}>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
