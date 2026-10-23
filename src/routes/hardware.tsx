import { createFileRoute, Link, ClientOnly, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import { Search, X, Box, List, ChevronLeft, ChevronRight, ArrowLeft, SearchX } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Reveal } from "@/components/Reveal";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { isCompactDevice } from "@/lib/device";
import { useIdleReveal } from "@/lib/use-idle-reveal";
import { saveHardwareInquiry } from "@/lib/contact";
import { SceneBoundary, SceneFailedNote } from "@/components/SceneBoundary";
import {
  CATEGORIES,
  CATEGORY_MAP,
  GPUS,
  MAX_USERS,
  MODELS,
  USER_PRESETS,
  clampUsers,
  sizeFor,
  type ModelCategory,
  type ModelSpec,
} from "@/lib/sizing";

const GalaxyScene = lazy(() => import("@/components/GalaxyScene"));

/* The three.js chunk (~950KB / ~240KB gzip) is the single heaviest asset on
   the site. It is NEVER part of the default view: phones (and anyone who
   chooses «فهرست») get a fully working calculator with zero WebGL bytes.
   The galaxy boots only on desktop idle OR an explicit user opt-in. */
const COMPACT = isCompactDevice();

type ViewMode = "auto" | "3d" | "list";

/** Pure-CSS deep-space placeholder — zero JS, zero WebGL, near-zero paint cost. */
function GalaxyPlaceholder({ booting }: { booting?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050c07]" aria-hidden>
      <div className="hw-stars" />
      <div
        className="hw-nebula"
        style={{
          inset: "12% 30% 30% 8%",
          background: "radial-gradient(closest-side, rgba(77,255,136,0.16), transparent)",
        }}
      />
      <div
        className="hw-nebula"
        style={{
          inset: "40% 8% 14% 55%",
          background: "radial-gradient(closest-side, rgba(147,197,253,0.13), transparent)",
        }}
      />
      <div
        className="hw-nebula"
        style={{
          inset: "55% 55% 8% 15%",
          background: "radial-gradient(closest-side, rgba(177,140,255,0.12), transparent)",
        }}
      />
      {booting && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-primary text-xs animate-pulse">
          booting galaxy…
        </span>
      )}
    </div>
  );
}

/** Explicit 3D boot — only rendered when the user (or desktop-idle auto)
 *  has asked for the galaxy. Loading failure never touches the calculator:
 *  the fallback is a usable static starfield, not an error. */
function GalaxyView(props: {
  focusIndex: number;
  catFilter: ModelCategory | null;
  pick: (i: number) => void;
  toggleCat: (c: ModelCategory) => void;
}) {
  return (
    <Suspense fallback={<GalaxyPlaceholder booting />}>
      <SceneBoundary fallback={<SceneFailedNote />}>
        <GalaxyScene
          focus={props.focusIndex}
          catFilter={props.catFilter}
          onPick={props.pick}
          onCorePick={props.toggleCat}
        />
      </SceneBoundary>
    </Suspense>
  );
}

export const Route = createFileRoute("/hardware")({
  head: () => ({
    meta: [
      { title: "کهکشان هوش | هوش برتر" },
      {
        name: "description",
        content:
          "۶۱ مدل متن‌باز در ۹ دسته — جست‌وجو، مقایسه و برآورد سخت‌افزار و هزینهٔ استقرار بر اساس کاربران همزمان؛ با نمای سه‌بعدی اختیاری.",
      },
      { property: "og:title", content: "کهکشان هوش — سالن سه‌بعدی سخت‌افزار | هوش برتر" },
      {
        property: "og:description",
        content:
          "محاسبهٔ زندهٔ GPU و هزینهٔ استقرار از چت و ایجنت تا تصویر، ویدیو، صدا و سه‌بعدی — بر اساس کاربران همزمان.",
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

/* ------------------------------------------------------------------ */
/* Sizing panel — desktop: side panel · mobile: bottom Sheet           */
/* ------------------------------------------------------------------ */

function UsersControl({ users, setUsers }: { users: number; setUsers: (n: number) => void }) {
  const [text, setText] = useState(String(users));
  const commit = (raw: string) => {
    const n = clampUsers(Number(raw));
    setUsers(n);
    setText(String(n));
  };
  // keep the text in sync when the slider/presets change the value
  const sync = (n: number) => {
    setUsers(n);
    setText(String(n));
  };
  return (
    <div className="mt-3">
      <div className="flex items-center gap-3">
        <Slider
          dir="ltr"
          className="flex-1"
          value={[clampUsers(users)]}
          min={1}
          max={MAX_USERS}
          step={1}
          onValueChange={(v) => sync(v[0] ?? 1)}
          aria-label="کاربران همزمان"
        />
        <label className="flex items-center gap-1.5 shrink-0">
          <span className="sr-only">تعداد کاربران همزمان (عدد)</span>
          <input
            type="number"
            dir="ltr"
            inputMode="numeric"
            min={1}
            max={MAX_USERS}
            step={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit((e.target as HTMLInputElement).value)}
            className="terminal-input w-20 text-center font-mono text-sm py-2"
            aria-describedby="users-range-hint"
          />
        </label>
      </div>
      <p
        id="users-range-hint"
        className="mt-1.5 font-mono text-[10px] text-muted-foreground"
        dir="ltr"
      >
        1 — {MAX_USERS} · presets:
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {USER_PRESETS.map((n) => (
          <button
            key={n}
            onClick={() => sync(n)}
            aria-pressed={users === n}
            className={`min-h-9 rounded-md border px-2.5 py-1 font-mono text-xs transition ${
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
  );
}

function SizingBody({
  m,
  users,
  setUsers,
  onQuote,
}: {
  m: ModelSpec;
  users: number;
  setUsers: (n: number) => void;
  onQuote: () => void;
}) {
  const r = sizeFor(m, users);
  const cat = CATEGORY_MAP[m.cat];
  return (
    <div dir="rtl">
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
      <p className="mt-0.5 font-mono text-sm font-bold text-accent" dir="ltr">
        {m.en}
      </p>
      <p className="text-xs text-primary mt-0.5">{m.tagFa}</p>

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
            {faDigits(clampUsers(users))}
          </span>
        </div>
        <UsersControl users={users} setUsers={setUsers} />
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
          برآورد آموزشی بر پایهٔ قیمت قطعات نو (تخمینی) — شامل GPU، سرور، رم، ذخیره‌سازی و شبکه؛
          بدون هزینهٔ خدمات استقرار، برق و نگهداری. {m.servingFa}
        </p>
        <button
          onClick={onQuote}
          className="mt-4 flex w-full min-h-12 items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-lg font-bold glow hover:scale-[1.02] transition"
        >
          دریافت پیش‌فاکتور و استقرار
          <ArrowLeft size={18} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Model list — the DEFAULT view: search + category + count + empty    */
/* ------------------------------------------------------------------ */

function ModelList({
  models,
  selId,
  onPick,
  total,
}: {
  models: ModelSpec[];
  selId: string | null;
  onPick: (id: string) => void;
  total: number;
}) {
  if (models.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-border bg-card/60 p-10 text-center">
        <SearchX size={28} className="mx-auto text-muted-foreground" />
        <p className="mt-3 font-bold">مدلی با این مشخصات پیدا نشد</p>
        <p className="mt-1 text-xs text-muted-foreground">
          عبارت جست‌وجو یا دستهٔ انتخابی را تغییر دهید — کل فهرست {faNum(total)} مدل است.
        </p>
      </div>
    );
  }
  return (
    <div className="mt-6 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      {models.map((m) => {
        const cat = CATEGORY_MAP[m.cat];
        const active = selId === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onPick(m.id)}
            aria-pressed={active}
            className={`group text-start rounded-xl border p-4 transition ${
              active
                ? "border-primary bg-primary/10"
                : "border-border/70 bg-card/50 hover:border-primary/50 hover:bg-card/80"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: m.accent, boxShadow: `0 0 8px ${m.accent}` }}
              />
              <h3 className="font-bold text-sm truncate">{m.fa}</h3>
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
            <p className="mt-1 font-mono text-[10px] text-accent/90" dir="ltr">
              {m.en} · {m.params} · {m.precision}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {m.useForFa}
            </p>
            <p className="mt-2 flex items-center gap-2 font-mono text-[10px] text-primary/80">
              <bdi dir="ltr">
                {faDigits(sizeFor(m, 10).gpus)}× {GPUS[m.gpu].name}
              </bdi>
              <span aria-hidden>·</span>
              <bdi dir="ltr">${faNum(sizeFor(m, 10).priceTotal)} @10 users</bdi>
            </p>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function HardwarePage() {
  const [selId, setSelId] = useState<string | null>(null);
  const [users, setUsers] = useState(10);
  const [catFilter, setCatFilter] = useState<ModelCategory | null>(null);
  const [query, setQuery] = useState("");
  // «auto»: desktop boots the galaxy at browser idle; phones stay on the list
  // until they press «فعال‌کردن نمای سه‌بعدی». Explicit user choice always wins.
  const [mode, setMode] = useState<ViewMode>("auto");
  const desktopIdle = useIdleReveal(1200, 1800);
  const show3d = mode === "3d" || (mode === "auto" && !COMPACT && desktopIdle);
  const navigate = useNavigate();

  const norm = (s: string) => s.replace(/\u200c/g, " ").toLowerCase();
  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return MODELS.filter(
      (m) =>
        (!catFilter || m.cat === catFilter) &&
        (!q ||
          norm(m.fa).includes(q) ||
          norm(m.en).includes(q) ||
          norm(m.tagFa).includes(q) ||
          norm(m.useForFa).includes(q)),
    );
  }, [catFilter, query]);

  const selIndex = selId ? MODELS.findIndex((m) => m.id === selId) : -1;
  const selModel = selIndex >= 0 ? MODELS[selIndex] : null;

  const pickId = (id: string) => setSelId(id);
  const cycle = (dir: 1 | -1) => {
    const list = filtered;
    if (!list.length) return;
    const cur = list.findIndex((m) => m.id === selId);
    const next = cur === -1 ? 0 : (cur + dir + list.length) % list.length;
    setSelId(list[next]!.id);
  };
  const toggleCat = (c: ModelCategory) => {
    const next = catFilter === c ? null : c;
    setCatFilter(next);
    setSelId((s) => (s && next && MODELS.find((m) => m.id === s)?.cat !== next ? null : s));
  };

  const focused = catFilter !== null;
  const activeCat = focused ? CATEGORY_MAP[catFilter] : null;

  const openQuote = () => {
    if (selModel) {
      const r = sizeFor(selModel, users);
      saveHardwareInquiry({
        modelId: selModel.id,
        modelFa: selModel.fa,
        modelEn: selModel.en,
        users: clampUsers(users),
        gpus: `${r.gpus}× ${r.gpu.name}`,
        priceTotalUsd: r.priceTotal,
      });
    }
    void navigate({ to: "/contact" });
  };

  return (
    <Shell>
      {/* ---------- 3D showroom viewport (OPTIONAL) ---------- */}
      {show3d && (
        <section className="hw-viewport" aria-label="نمای سه‌بعدی کهکشان مدل‌ها">
          <ClientOnly fallback={<GalaxyPlaceholder />}>
            <GalaxyView
              focusIndex={selIndex}
              catFilter={catFilter}
              pick={(i) => setSelId(MODELS[i]?.id ?? null)}
              toggleCat={toggleCat}
            />
          </ClientOnly>

          {/* header copy over the scene — collapses when a galaxy/panel takes over */}
          <div className="pointer-events-none absolute top-5 inset-x-0 z-10">
            <div className="max-w-6xl mx-auto px-6">
              <div
                aria-hidden={focused}
                className={`transition-all duration-500 ease-out overflow-hidden ${
                  focused
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
                  شصت‌ویک مدل متن‌باز در نُه کهکشان — روی ستارهٔ هر مدل کلیک کنید، کاربران همزمانتان
                  را بگویید و سخت‌افزار و قیمت دلاری را همان‌جا ببینید.
                </p>
              </div>

              {/* focused mode — compact back bar */}
              {focused && activeCat && (
                <div
                  className="pointer-events-auto mt-3 flex flex-wrap items-center gap-2"
                  style={{ animation: "fadeSlideDown 0.45s ease-out both" }}
                >
                  <button
                    onClick={() => {
                      setCatFilter(null);
                      setSelId(null);
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
          <div className="absolute z-10 inset-x-0 bottom-24 md:bottom-5 flex justify-center items-center gap-3">
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
                        onClick={() => pickId(m.id)}
                        aria-label={m.fa}
                        title={m.fa}
                        className="h-2.5 w-2.5 rounded-full transition-transform hover:scale-125"
                        style={
                          selId === m.id
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

          {/* desktop side panel for the selected model */}
          {selModel && (
            <div className="hidden md:block absolute z-20 end-6 top-24 w-[400px] max-h-[calc(100%-200px)] overflow-y-auto panel-glass rounded-xl p-5">
              <SidePanelHeader onClose={() => setSelId(null)} />
              <SizingBody m={selModel} users={users} setUsers={setUsers} onQuote={openQuote} />
            </div>
          )}
        </section>
      )}

      {/* ---------- default: searchable model catalog ---------- */}
      <section
        className={`relative z-10 max-w-6xl mx-auto px-5 md:px-6 ${show3d ? "pt-10" : "pt-12"} pb-16`}
      >
        {!show3d && (
          <>
            <p className="font-mono text-xs text-primary" dir="ltr">
              &gt; ls /models --catalog
            </p>
            <h1 className="mt-2 h1-fluid">
              برآورد <span className="text-gradient">سخت‌افزار</span> و کهکشان مدل‌ها
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              مدل موردنظر را از فهرست پیدا کنید، کاربران همزمان را بگویید و سخت‌افزار و قیمت دلاری
              برآوردی را ببینید. نمای سه‌بعدی کهکشان اختیاری است — بدون آن هم همهٔ محاسبه‌ها کار
              می‌کنند.
            </p>
          </>
        )}

        {/* view switch — 3D is an opt-in, never a prerequisite */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {show3d ? (
            <button
              onClick={() => setMode("list")}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-4 text-sm font-bold text-primary hover:bg-primary/20 transition"
            >
              <List size={16} />
              نمایش فهرست
            </button>
          ) : (
            <button
              onClick={() => setMode("3d")}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-4 text-sm font-bold text-primary hover:bg-primary/20 transition"
            >
              <Box size={16} />
              فعال‌کردن نمای سه‌بعدی
              <span className="font-mono text-[10px] text-muted-foreground" dir="ltr">
                (~250KB)
              </span>
            </button>
          )}
          {show3d && (
            <span className="font-mono text-[10px] text-muted-foreground" dir="ltr">
              WEBGL · OPTIONAL VIEW
            </span>
          )}
        </div>

        {/* search + category filter */}
        <div className="mt-5 grid gap-3">
          <label className="relative block max-w-xl">
            <Search
              size={16}
              className="absolute start-4 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none"
            />
            <span className="sr-only">جست‌وجو در مدل‌ها</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جست‌وجوی مدل… مثلا «Qwen» یا «تولید ویدیو»"
              className="terminal-input !ps-11"
            />
          </label>
          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="دسته‌بندی مدل‌ها"
          >
            <button
              onClick={() => {
                setCatFilter(null);
              }}
              aria-pressed={catFilter === null}
              className={`min-h-9 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
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
                  aria-pressed={active}
                  title={c.descFa}
                  className={`flex items-center gap-1.5 min-h-9 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    active
                      ? "text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                  style={
                    active
                      ? {
                          borderColor: c.color,
                          background: `color-mix(in oklab, ${c.color} 16%, transparent)`,
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
          <p className="font-mono text-[11px] text-muted-foreground" aria-live="polite">
            {faNum(filtered.length)} مدل از {faNum(MODELS.length)}
            {catFilter ? ` · دسته: ${CATEGORY_MAP[catFilter].fa}` : ""}
            {query ? ` · جست‌وجو: «${query}»` : ""}
          </p>
        </div>

        <ModelList models={filtered} selId={selId} onPick={pickId} total={MODELS.length} />

        {/* mobile: bottom Sheet for the selected model */}
        {selModel && (
          <Sheet open onOpenChange={(o) => !o && setSelId(null)}>
            <SheetContent
              side="bottom"
              className="md:hidden h-[86svh] max-h-[86svh] overflow-y-auto panel-glass rounded-t-2xl p-5"
            >
              <SheetTitle className="sr-only">
                جزئیات و برآورد سخت‌افزار مدل {selModel.fa}
              </SheetTitle>
              <SheetDescription className="sr-only">
                تنظیم کاربران همزمان و مشاهدهٔ سخت‌افزار و هزینهٔ برآوردی
              </SheetDescription>
              {/* SheetContent ships its own accessible close button (X) */}
              <SizingBody m={selModel} users={users} setUsers={setUsers} onQuote={openQuote} />
            </SheetContent>
          </Sheet>
        )}

        <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
          «برآورد سخت‌افزار» یک تخمین آموزشی بر پایهٔ قیمت قطعات نو است؛ ظرفیت یا سرعت واقعی بار
          کاری شما را تضمین نمی‌کند. برای پیکربندی دقیق، پیش‌فاکتور بگیرید.
        </p>
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
            خلاصهٔ محاسبات برای سه سناریوی ترافیک، به‌همراه دسته و کاربرد اصلی هر مدل. عدد دقیق و
            پیکربندی اختصاصی‌تان را از فهرست بالا و با کنترل کاربران همزمان بگیرید.
          </p>
        </Reveal>
        <Reveal delay={120}>
          {/* desktop: full table — local horizontal scroll only */}
          <div className="mt-8 panel-glass rounded-xl hidden md:block overflow-x-auto">
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
                className="inline-flex min-h-12 items-center gap-2 border border-primary/50 text-primary px-6 py-3.5 rounded-lg font-bold hover:bg-primary/10 transition"
              >
                نمونه‌کارهای مستند
              </Link>
              <Link
                to="/contact"
                className="inline-flex min-h-12 items-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-lg font-bold glow hover:scale-105 transition"
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

/** Shared close button for the desktop side panel and the mobile sheet. */
function SidePanelHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex justify-end mb-2">
      <button
        onClick={onClose}
        aria-label="بستن پنل مدل"
        className="min-h-11 min-w-11 grid place-items-center rounded-md border border-border p-2 text-muted-foreground hover:text-primary hover:border-primary/60 transition"
      >
        <X size={16} />
      </button>
    </div>
  );
}
