import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import { Reveal } from "@/components/Reveal";
import { SceneBoundary } from "@/components/SceneBoundary";
import { ArrowLeft, ChevronLeft, ChevronRight, Search, Box, X, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { isCompactDevice } from "@/lib/device";
import { useWhenIdle } from "@/lib/idle";
import {
  CATEGORIES,
  CATEGORY_MAP,
  GPUS,
  MAX_USERS,
  MODELS,
  USER_PRESETS,
  sanitizeUsers,
  sizeFor,
  type ModelCategory,
} from "@/lib/sizing";

const GalaxyScene = lazy(() => import("@/components/GalaxyScene"));

/* The three.js chunk (~950KB / ~240KB gzip) is the single heaviest asset on
   the site. Desktop: keep it OFF the first paint (CSS starfield until idle —
   unchanged). Phones / low-power: idle-loading is NOT a substitute for not
   loading — the lite model finder is the default view and the galaxy only
   downloads after the explicit «فعال‌کردن نمای سه‌بعدی» button. */
const COMPACT = isCompactDevice();

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

/** Desktop: holds the CSS starfield until idle, then boots the real galaxy.
    Compact: never renders until the user explicitly enables 3D. */
function GalaxyReveal(props: {
  enabled: boolean;
  selIndex: number;
  catFilter: ModelCategory | null;
  pickIndex: (i: number) => void;
  toggleCat: (c: ModelCategory) => void;
}) {
  const idleReady = useWhenIdle(!COMPACT, COMPACT ? 3000 : 1800);
  const ready = COMPACT ? props.enabled : idleReady;
  if (!ready) return <GalaxyPlaceholder />;
  return (
    <Suspense fallback={<GalaxyPlaceholder booting />}>
      <SceneBoundary fallback={<GalaxyPlaceholder />}>
        <GalaxyScene
          focus={props.selIndex}
          catFilter={props.catFilter}
          onPick={props.pickIndex}
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

const normFa = (s: string) => s.replace(/\u200c/g, " ").toLowerCase();

/* ------------------------------------------------------------------ */
/* Sizing content — shared between the desktop side panel and the      */
/* mobile bottom sheet. The users value lives in one place; the sizing */
/* engine validates every input (see lib/sizing.ts).                   */
/* ------------------------------------------------------------------ */

function UsersEditor({ users, setUsers }: { users: number; setUsers: (n: number) => void }) {
  const [text, setText] = useState(String(users));
  useEffect(() => setText(String(users)), [users]);
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="hw-users" className="text-sm font-bold">
          کاربران همزمان
        </label>
        <input
          id="hw-users"
          dir="ltr"
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_USERS}
          step={1}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const n = Number(e.target.value);
            if (e.target.value !== "" && Number.isFinite(n)) setUsers(sanitizeUsers(n));
          }}
          onBlur={() => {
            const n = Number(text);
            const safe = sanitizeUsers(Number.isFinite(n) ? n : users);
            setUsers(safe);
            setText(String(safe));
          }}
          aria-describedby="hw-users-hint"
          className="w-24 rounded-md border border-border bg-background/60 px-3 py-2 text-center font-mono text-base font-black text-primary focus:border-primary outline-none"
        />
      </div>
      <p id="hw-users-hint" className="mt-1 text-[10px] text-muted-foreground">
        بازهٔ مجاز: ۱ تا {faDigits(MAX_USERS)} کاربر — خروجی برآورد است، نه تضمین ظرفیت.
      </p>
      <Slider
        dir="ltr"
        className="mt-3"
        value={[sanitizeUsers(users)]}
        min={1}
        max={MAX_USERS}
        step={1}
        onValueChange={(v) => setUsers(sanitizeUsers(v[0] ?? 1))}
        aria-label="کاربران همزمان"
      />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {USER_PRESETS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setUsers(n)}
            aria-pressed={users === n}
            className={`font-mono min-h-9 rounded-md border px-2.5 py-1.5 transition ${
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

function SizingContent({
  index,
  users,
  setUsers,
}: {
  index: number;
  users: number;
  setUsers: (n: number) => void;
}) {
  const m = MODELS[index];
  if (!m) return null;
  const r = sizeFor(m, users);
  const cat = CATEGORY_MAP[m.cat];
  return (
    <>
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
        <UsersEditor users={users} setUsers={setUsers} />
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
          برآورد آموزشی بر پایهٔ قیمت خاموش قطعات نو (USD) — شامل GPU، سرور، رم، ذخیره‌سازی و شبکه؛
          هزینهٔ برق/نگهداری جدا محاسبه می‌شود و خدمات استقرار در آن نیست. {m.servingFa}
        </p>
        {/* انتخاب مدل + تنظیمات در URL حفظ می‌شود — بدون داده حساس */}
        <Link
          to="/contact"
          search={{ model: m.id, users: sanitizeUsers(users) }}
          className="mt-4 flex min-h-12 items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold glow hover:scale-[1.02] transition"
        >
          دریافت پیش‌فاکتور و استقرار
          <ArrowLeft size={18} />
        </Link>
      </div>
    </>
  );
}

/** Desktop side panel over the 3D viewport. */
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
  return (
    <div
      dir="rtl"
      className="absolute z-20 inset-x-3 bottom-3 md:inset-x-auto md:start-auto md:end-6 md:top-24 md:bottom-auto md:w-[400px] max-h-[56svh] md:max-h-[calc(100%-200px)] overflow-y-auto panel-glass rounded-xl p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="sr-only">جزئیات مدل</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن جزئیات مدل"
          className="ms-auto shrink-0 rounded-md border border-border p-2 text-muted-foreground hover:text-primary hover:border-primary/60 transition"
        >
          <X size={16} />
        </button>
      </div>
      <div className="-mt-6">
        <SizingContent index={index} users={users} setUsers={setUsers} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Model finder — the compact-tier DEFAULT view: search + category +   */
/* count + cards + empty state. The sizing result works without any    */
/* Canvas; the 3D galaxy is an explicit opt-in.                        */
/* ------------------------------------------------------------------ */

export function ModelFinder({
  selId,
  users,
  setUsers,
  catFilter,
  toggleCat,
  onOpen,
  onClose,
}: {
  selId: string | null;
  users: number;
  setUsers: (n: number) => void;
  catFilter: ModelCategory | null;
  toggleCat: (c: ModelCategory) => void;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const hits = useMemo(() => {
    const needle = normFa(q.trim());
    return MODELS.map((m, i) => ({ m, i })).filter(({ m }) => {
      if (catFilter && m.cat !== catFilter) return false;
      if (!needle) return true;
      return normFa(
        `${m.fa} ${m.en} ${m.params} ${m.tagFa} ${m.useForFa} ${CATEGORY_MAP[m.cat].fa}`,
      ).includes(needle);
    });
  }, [q, catFilter]);

  const openIndex = selId ? MODELS.findIndex((m) => m.id === selId) : -1;

  return (
    <div>
      {/* search */}
      <div className="mt-6">
        <label htmlFor="hw-search" className="block text-sm font-bold">
          جست‌وجوی مدل
        </label>
        <div className="relative mt-2">
          <Search
            size={16}
            className="absolute start-4 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none"
          />
          <input
            id="hw-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            placeholder="مثلاً «Qwen» یا «تصویر»…"
            className="terminal-input !ps-11"
            aria-describedby="hw-search-count"
          />
        </div>
      </div>

      {/* category filter */}
      <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="فیلتر دسته">
        <button
          type="button"
          onClick={() => {
            if (catFilter !== null) toggleCat(catFilter); // clear filter
          }}
          aria-pressed={catFilter === null}
          className={`min-h-9 text-[11px] font-bold rounded-full border px-3 py-1.5 transition ${
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
              type="button"
              onClick={() => toggleCat(c.key)}
              aria-pressed={active}
              title={c.descFa}
              className={`flex min-h-9 items-center gap-1.5 text-[11px] font-bold rounded-full border px-3 py-1.5 transition ${
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

      {/* result count */}
      <p
        id="hw-search-count"
        className="mt-3 font-mono text-[11px] text-muted-foreground"
        dir="rtl"
      >
        {faNum(hits.length)} مدل از {faNum(MODELS.length)}
        {catFilter ? ` — دستهٔ ${CATEGORY_MAP[catFilter].fa}` : ""}
        {q ? ` — جست‌وجوی «${q}»` : ""}
      </p>

      {/* empty state */}
      {hits.length === 0 ? (
        <div className="mt-6 rack-card p-8 text-center">
          <p className="font-mono text-sm text-primary" dir="ltr">
            grep: no models matched
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            مدلی با این نام یا دسته پیدا نشد. عبارت دیگری امتحان کنید یا فیلتر دسته را بردارید.
          </p>
          <button
            type="button"
            onClick={() => {
              setQ("");
            }}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary/50 px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/10 transition"
          >
            <RotateCcw size={15} />
            پاک‌کردن جست‌وجو
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {hits.map(({ m }) => {
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
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{m.tagFa}</p>
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
                        <bdi dir="ltr" className="block font-mono text-[11px] text-primary mt-0.5">
                          ${r.priceTotal.toLocaleString("en-US")}
                        </bdi>
                      </div>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => onOpen(m.id)}
                  aria-expanded={selId === m.id}
                  className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/20 transition"
                >
                  <Box size={15} />
                  محاسبهٔ دقیق برای {faDigits(users)} کاربر
                </button>
              </article>
            );
          })}
        </div>
      )}

      {/* mobile detail sheet — the calculator fully works without WebGL */}
      <Sheet open={openIndex >= 0} onOpenChange={(o) => !o && onClose()}>
        <SheetContent
          side="bottom"
          className="max-h-[88dvh] overflow-y-auto rounded-t-2xl border-primary/30 p-5 pb-[max(20px,env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="text-start">
            <SheetTitle className="text-base">برآورد سخت‌افزار</SheetTitle>
            <SheetDescription className="text-xs">
              تنظیم کاربران همزمان و دیدن سخت‌افزار و هزینه — برآورد آموزشی، نه پیش‌فاکتور.
            </SheetDescription>
          </SheetHeader>
          {openIndex >= 0 && (
            <div className="mt-2">
              <SizingContent index={openIndex} users={users} setUsers={setUsers} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function HardwarePage() {
  const [selId, setSelId] = useState<string | null>(null);
  const [users, setUsers] = useState(10);
  const [catFilter, setCatFilter] = useState<ModelCategory | null>(null);
  // compact tier: 3D is OFF until the visitor presses the button — the lite
  // finder above is the default experience, never a degraded fallback.
  const [galaxyOn, setGalaxyOn] = useState(false);

  const selIndex = selId ? MODELS.findIndex((m) => m.id === selId) : -1;

  const visibleIdx = MODELS.map((m, i) => ({ m, i }))
    .filter((x) => !catFilter || x.m.cat === catFilter)
    .map((x) => x.i);

  const pickIndex = (i: number) => {
    const id = MODELS[i]?.id;
    setSelId(id ?? null);
  };
  const pickId = (id: string) => {
    setSelId((cur) => (cur === id ? null : id));
  };
  const closeDetail = () => setSelId(null);

  const cycle = (dir: 1 | -1) => {
    setSelId((cur) => {
      const list = visibleIdx;
      if (!list.length) return null;
      const curIdx = cur ? MODELS.findIndex((m) => m.id === cur) : -1;
      const p = list.indexOf(curIdx);
      if (p === -1) return MODELS[list[0] ?? 0]?.id ?? null;
      return MODELS[list[(p + dir + list.length) % list.length] ?? 0]?.id ?? null;
    });
  };
  const toggleCat = (c: ModelCategory) => {
    const next = catFilter === c ? null : c;
    setCatFilter(next);
    setSelId((s) => {
      if (s === null || next === null) return s;
      const m = MODELS.find((x) => x.id === s);
      return m && m.cat !== next ? null : s;
    });
  };

  // When a galaxy is focused (or a star panel is open) the fixed header copy
  // collapses away so it never collides with the 3D labels underneath.
  const focused = catFilter !== null;
  const collapsed = focused || selId !== null;
  const activeCat = focused ? CATEGORY_MAP[catFilter] : null;

  const showGalaxy = !COMPACT || galaxyOn;

  return (
    <Shell>
      {/* ---------- 3D showroom viewport (desktop always · mobile opt-in) ---------- */}
      {showGalaxy && (
        <section className="hw-viewport" aria-label="کهکشان سه‌بعدی مدل‌ها">
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
              <GalaxyReveal
                enabled={galaxyOn}
                selIndex={selIndex}
                catFilter={catFilter}
                pickIndex={pickIndex}
                toggleCat={toggleCat}
              />
            </Suspense>
          </ClientOnly>

          {/* header copy over the scene — collapses when a galaxy/panel takes over */}
          <div className="pointer-events-none absolute top-5 inset-x-0 z-10">
            <div className="max-w-6xl mx-auto px-5 md:px-6">
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
                  شصت‌ویک مدل متن‌باز در نُه کهکشان — هر دسته یک کهکشان کامل و هر مدل یک ستاره در
                  آن؛ از چت‌بات و استدلال تا تولید تصویر و ویدیو، صدا، و تکست‌به‌مش و عکس‌به‌مش. روی
                  ستارهٔ هر مدل کلیک کنید، کاربران همزمانتان را بگویید و سخت‌افزار و قیمت دلاری را
                  همان‌جا ببینید.
                </p>

                {/* category filter — پرواز میان کهکشان‌ها */}
                <div className="pointer-events-auto mt-3 flex flex-wrap items-center gap-1.5 max-w-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setCatFilter(null);
                      setSelId(null);
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
                        type="button"
                        onClick={() => toggleCat(c.key)}
                        title={c.descFa}
                        aria-pressed={active}
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

              {/* focused mode — compact bar instead of the full copy */}
              {focused && activeCat && (
                <div
                  className="pointer-events-auto mt-3 flex flex-wrap items-center gap-2"
                  style={{ animation: "fadeSlideDown 0.45s ease-out both" }}
                >
                  <button
                    type="button"
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

          {/* compact: explicit exit from the opt-in 3D view */}
          {COMPACT && (
            <div className="absolute top-3 left-3 z-20">
              <button
                type="button"
                onClick={() => {
                  setGalaxyOn(false);
                  setSelId(null);
                }}
                className="panel-glass rounded-full px-3 py-2 text-[11px] font-bold text-primary flex items-center gap-1.5"
              >
                <X size={13} />
                بستن نمای سه‌بعدی
              </button>
            </div>
          )}

          {/* galaxy / star navigation */}
          <div
            className={`absolute z-10 inset-x-0 bottom-24 md:bottom-5 flex justify-center items-center gap-3 ${
              selId !== null ? "max-md:hidden" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => cycle(1)}
              aria-label="ستارهٔ بعدی"
              className="panel-glass rounded-full p-3 text-primary hover:scale-110 transition"
            >
              <ChevronRight size={18} />
            </button>
            <div className="panel-glass rounded-full px-4 py-2.5 flex items-center gap-2.5">
              {catFilter === null
                ? CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => toggleCat(c.key)}
                      aria-label={c.fa}
                      title={`${c.fa} — ${catCount(c.key)} مدل`}
                      className="h-3 w-3 rounded-full transition-transform hover:scale-125"
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
                        type="button"
                        onClick={() => pickIndex(i)}
                        aria-label={m.fa}
                        aria-pressed={selId === m.id}
                        title={m.fa}
                        className="h-3 w-3 rounded-full transition-transform hover:scale-125"
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
              type="button"
              onClick={() => cycle(-1)}
              aria-label="ستارهٔ قبلی"
              className="panel-glass rounded-full p-3 text-primary hover:scale-110 transition"
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

          {selId !== null && selIndex >= 0 && !COMPACT && (
            <SizingPanel
              index={selIndex}
              users={users}
              setUsers={setUsers}
              onClose={() => setSelId(null)}
            />
          )}
        </section>
      )}

      {/* ---------- compact: 3D opt-in teaser ---------- */}
      {COMPACT && !galaxyOn && (
        <section
          className="relative z-10 max-w-6xl mx-auto px-5 md:px-6 pt-8"
          aria-label="فعال‌سازی نمای سه‌بعدی"
        >
          <div className="panel-glass rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black">نمای سه‌بعدی کهکشان مدل‌ها</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                اختیاری است — محاسبه و مقایسه بدون آن هم کامل کار می‌کند. فعال‌سازی، حجم حدوداً ۲۴۰
                کیلوبایتی Three.js را دانلود می‌کند.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setGalaxyOn(true)}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-primary/15 border border-primary/50 px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary/25 transition"
            >
              فعال‌کردن نمای سه‌بعدی
            </button>
          </div>
        </section>
      )}

      {/* ---------- model finder (compact default) / reference table (desktop) ---------- */}
      <section
        className="cv-auto relative z-10 max-w-6xl mx-auto px-5 md:px-6 py-14 md:py-20"
        style={{ "--cv-size": "7000px" } as React.CSSProperties}
      >
        {COMPACT ? (
          <>
            <Reveal>
              <p className="font-mono text-xs text-primary" dir="ltr">
                &gt; ls /models --search --sizes
              </p>
              <h2 className="mt-3 text-2xl font-black">
                فهرست <span className="text-gradient">مدل‌ها</span> و برآورد سخت‌افزار
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                جست‌وجو کنید، دسته را فیلتر کنید و روی هر مدل، برآورد سخت‌افزار و هزینه را بر اساس
                کاربران همزمان ببینید — همه بدون نیاز به نمای سه‌بعدی.
              </p>
            </Reveal>
            <ModelFinder
              selId={selId}
              users={users}
              setUsers={setUsers}
              catFilter={catFilter}
              toggleCat={toggleCat}
              onOpen={pickId}
              onClose={closeDetail}
            />
          </>
        ) : (
          <>
            <Reveal>
              <p className="font-mono text-xs text-primary" dir="ltr">
                &gt; cat sizing-table.md
              </p>
              <h2 className="mt-3 text-3xl md:text-4xl font-black">
                جدول مرجع: <span className="text-gradient">سخت‌افزار لازم</span> برای هر مدل
              </h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                خلاصهٔ محاسبات کهکشان برای سه سناریوی ترافیک، به‌همراه دسته و کاربرد اصلی هر مدل.
                عدد دقیق و پیکربندی اختصاصی‌تان را داخل کهکشان‌ها و با اسلایدر کاربران همزمان
                بگیرید.
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

              {/* desktop narrow-window fallback: same finder as mobile */}
              <div className="mt-6 md:hidden">
                <ModelFinder
                  selId={selId}
                  users={users}
                  setUsers={setUsers}
                  catFilter={catFilter}
                  toggleCat={toggleCat}
                  onOpen={pickId}
                  onClose={closeDetail}
                />
              </div>
            </Reveal>
          </>
        )}

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
                چه ساخته‌اند.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/showcase"
                className="inline-flex items-center gap-2 border border-primary/50 text-primary px-6 py-3.5 rounded-lg font-bold hover:bg-primary/10 transition"
              >
                نمونه‌کارها
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
