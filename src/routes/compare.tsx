import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import { Reveal } from "@/components/Reveal";
import { Scale, ArrowLeft, Repeat2, Info, Swords } from "lucide-react";
import {
  CATEGORY_MAP,
  CATEGORIES,
  GPUS,
  MODELS,
  sizeFor,
  type ModelCategory,
  type ModelSpec,
} from "@/lib/sizing";
import {
  BENCH,
  METRICS,
  SNAPSHOT_FA,
  benchModels,
  hasMetric,
  metricValue,
  type MetricSpec,
} from "@/lib/benchmarks";

/* ------------------------------------------------------------------ */
/* /compare — آزمایشگاه مقایسهٔ مدل‌ها                                  */
/* ① نموداری: همهٔ مدل‌های یک دسته روی یک سنجه، میله‌ای و مرتب‌شده      */
/* ② دو‌به‌دو: هر دو مدل دلخواه، سر‌به‌سر روی سنجه‌ها + سخت‌افزار        */
/* Data: Artificial Analysis + BenchLM snapshot (see benchmarks.ts)    */
/* No chart library — pure CSS bars keep this page ~free after load.   */
/* ------------------------------------------------------------------ */

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "مقایسهٔ مدل‌های هوش مصنوعی | هوش برتر" },
      {
        name: "description",
        content:
          "مقایسهٔ نموداری مدل‌های وزن‌باز در هر دسته و مقایسهٔ دو‌به‌دوی متن، تصویر، ویدیو، صوت، سه‌بعدی و امبدینگ — بر پایهٔ دادهٔ Artificial Analysis و BenchLM با سنجه‌های کیفیت، سرعت، قیمت و سخت‌افزار.",
      },
      { property: "og:title", content: "آزمایشگاه مقایسهٔ مدل‌ها | هوش برتر" },
      {
        property: "og:description",
        content:
          "۶۱ مدل وزن‌باز را روی کیفیت، سرعت، قیمت API و سخت‌افزار لازم مقایسه کنید — نموداری و دو‌به‌دو.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://ssschangersss.github.io/open-model-workshop/compare" },
    ],
  }),
  component: ComparePage,
});

const faDigits = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)] ?? d);

const fmt = (v: number) => {
  if (!Number.isFinite(v)) return "—";
  return v >= 1000
    ? faDigits(Math.round(v).toLocaleString("en-US"))
    : v >= 10
      ? faDigits(Math.round(v))
      : faDigits(Math.round(v * 10) / 10);
};

/** The canonical «missing datum» label — never render a zero for absent data. */
const MISSING_FA = "ناموجود";

/* ------------------------------------------------------------------ */
/* Source badge — shown in the hero and under each chart               */
/* ------------------------------------------------------------------ */
function SourceBadge({ small }: { small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 font-mono text-primary/80 ${
        small ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      }`}
      dir="ltr"
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_#4dff88]" />
      Artificial Analysis · BenchLM · {SNAPSHOT_FA}
    </span>
  );
}

function EvDot({ ev }: { ev: "verified" | "estimated" }) {
  return (
    <span
      title={ev === "verified" ? "دادهٔ مستقیم از منبع" : "برآورد نرمال‌شده بر پایهٔ منابع"}
      aria-hidden
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
        ev === "verified" ? "bg-primary shadow-[0_0_6px_#4dff88]" : "bg-amber-400/80"
      }`}
    />
  );
}

/** Visible, non-color estimate marker — the datum is labelled by TEXT too,
 *  not only by the amber dot or a hover tooltip. */
function EvTag({ ev }: { ev: "verified" | "estimated" }) {
  if (ev === "verified") return null;
  return (
    <span
      className="rounded-sm border border-amber-400/40 px-1 font-mono text-[9px] leading-4 text-amber-300/90"
      title="برآورد نرمال‌شده بر پایهٔ منابع — عدد مستقیم منبع نیست"
    >
      برآورد
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Mode 1 — category bar chart                                         */
/* ------------------------------------------------------------------ */
function ChartMode() {
  const [cat, setCat] = useState<ModelCategory>("llm");
  const metrics = METRICS[cat];
  const [mIdx, setMIdx] = useState(0);
  const metric: MetricSpec = metrics[Math.min(mIdx, metrics.length - 1)] ?? metrics[0]!;

  const rows = useMemo(() => {
    const list = benchModels(cat)
      .map((m) => ({ m, ev: BENCH[m.id]!.ev, v: metricValue(m.id, metric.key) }))
      .filter(
        (r): r is { m: ModelSpec; ev: "verified" | "estimated"; v: number } =>
          typeof r.v === "number",
      );
    list.sort((a, b) => (metric.higherBetter ? b.v - a.v : a.v - b.v));
    return list;
  }, [cat, metric]);

  // finite max only — an all-zero / absent dataset must never yield NaN widths
  const max = rows.length ? Math.max(...rows.map((r) => r.v)) : 0;
  const hasScale = max > 0;
  const missing = MODELS.filter((m) => m.cat === cat && !hasMetric(m.id, metric.key)).length;

  return (
    <div>
      {/* category chips */}
      <div className="mb-5 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => {
              setCat(c.key);
              setMIdx(0);
            }}
            className={`rounded-full border px-3.5 py-1.5 text-xs transition-all ${
              cat === c.key
                ? "border-transparent font-bold text-[#04140b]"
                : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25 hover:text-white"
            }`}
            style={
              cat === c.key
                ? { background: c.color, boxShadow: `0 0 14px ${c.color}55` }
                : undefined
            }
            title={c.descFa}
          >
            {c.fa}{" "}
            <span className="font-mono text-[10px] opacity-80">
              ×{faDigits(benchModels(c.key).length)}
            </span>
          </button>
        ))}
      </div>

      {/* metric chips */}
      <div className="mb-2 flex flex-wrap justify-center gap-2">
        {metrics.map((mt, i) => (
          <button
            key={mt.key}
            onClick={() => setMIdx(i)}
            className={`rounded-md border px-3 py-1 font-mono text-[11px] transition-all ${
              metric.key === mt.key
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-white/10 text-white/55 hover:border-white/25 hover:text-white/85"
            }`}
            title={mt.descFa}
          >
            {mt.fa}
            {mt.unit ? <span className="ml-1 opacity-70">({mt.unit})</span> : null}
          </button>
        ))}
      </div>
      <p className="mb-5 text-center text-[11px] leading-5 text-white/45">
        {metric.descFa}
        {missing > 0 && <> · {faDigits(missing)} مدل این دسته دادهٔ این سنجه را ندارند</>}
      </p>

      {/* bars */}
      {rows.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-xs text-white/60">
          برای این دسته و این سنجه داده‌ای ثبت نشده است.
        </p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r, i) => {
            const top = i === 0;
            const pct = hasScale ? Math.max(6, (r.v / max) * 100) : 6;
            return (
              <div key={r.m.id} className="group flex items-center gap-3">
                <div className="w-28 shrink-0 sm:w-44">
                  <div className="text-xs leading-5 text-white/90" title={r.m.fa}>
                    {r.m.fa}
                  </div>
                  <div
                    className="truncate font-mono text-[10px] text-white/40"
                    dir="ltr"
                    title={r.m.en}
                  >
                    {r.m.en}
                  </div>
                </div>
                <div className="relative h-7 min-w-0 flex-1 overflow-hidden rounded-l-md bg-white/[0.04]">
                  <div
                    className="absolute inset-y-0 right-0 rounded-l-md transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(to left, ${CATEGORY_MAP[cat].color}dd, ${CATEGORY_MAP[cat].color}55)`,
                      boxShadow: top ? `0 0 18px ${CATEGORY_MAP[cat].color}66` : undefined,
                    }}
                  />
                  <span
                    className={`absolute left-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5 font-mono text-[11px] ${
                      pct > 88 ? "text-[#04140b]" : "text-white/85"
                    }`}
                    dir="ltr"
                  >
                    {fmt(r.v)}
                    {metric.unit ? <span className="opacity-70"> {metric.unit}</span> : null}
                  </span>
                </div>
                <div className="flex w-14 shrink-0 items-center justify-end gap-1.5">
                  {top && (
                    <span className="rounded-sm bg-primary/15 px-1 py-0.5 font-mono text-[9px] text-primary">
                      برتر
                    </span>
                  )}
                  <EvTag ev={r.ev} />
                  <EvDot ev={r.ev} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 flex items-center justify-center gap-3 text-center text-[11px] text-white/40">
        <span className="inline-flex items-center gap-1.5">
          <EvDot ev="verified" /> دادهٔ مستقیم منبع
        </span>
        <span className="inline-flex items-center gap-1.5">
          <EvDot ev="estimated" /> برآورد نرمال‌شده
        </span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mode 2 — pairwise head-to-head                                      */
/* ------------------------------------------------------------------ */

const PRESETS: { label: string; a: string; b: string }[] = [
  { label: "Kimi K3 در برابر V4 Pro", a: "kimi-k3", b: "deepseek-v4-pro" },
  { label: "GPT-OSS 120B در برابر Qwen3 32B", a: "gpt-oss-120b", b: "qwen3-32b" },
  { label: "FLUX.2 در برابر Qwen-Image", a: "flux.2-dev", b: "qwen-image" },
  { label: "Wan A14B در برابر HunyuanVideo", a: "wan2.2-a14b", b: "hunyuan-video-1.5" },
  { label: "Kimi K3 در برابر FLUX.2", a: "kimi-k3", b: "flux.2-dev" },
];

function ModelSelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <label className="flex-1">
      <span className="mb-1 block font-mono text-[10px] text-white/45">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/15 bg-[#0a130d] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-primary/60"
      >
        {CATEGORIES.map((c) => (
          <optgroup key={c.key} label={c.fa}>
            {MODELS.filter((m) => m.cat === c.key && BENCH[m.id]).map((m) => (
              <option key={m.id} value={m.id}>
                {m.fa} — {m.en}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

function SpecRow({ label, a, b, unit }: { label: string; a: string; b: string; unit?: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-white/[0.05] py-2 text-xs">
      <div className="text-left font-mono text-white/85" dir="ltr">
        {a}
        {unit ? <span className="text-white/40"> {unit}</span> : null}
      </div>
      <div className="px-2 text-center text-[10px] text-white/35">{label}</div>
      <div className="text-right font-mono text-white/85" dir="ltr">
        {b}
        {unit ? <span className="text-white/40"> {unit}</span> : null}
      </div>
    </div>
  );
}

function DuelBar({
  label,
  va,
  vb,
  unit,
  higherBetter,
  fa,
  fb,
  colorA,
  colorB,
}: {
  label: string;
  va: number;
  vb: number;
  unit: string;
  higherBetter: boolean;
  fa: string;
  fb: string;
  colorA: string;
  colorB: string;
}) {
  // all-zero / invalid pairs must not produce NaN bar widths — fall back to
  // equal halves so the row still reads as «no measurable difference»
  const max = Math.max(va, vb);
  const sane = Number.isFinite(max) && max > 0;
  const wa = sane ? (va / max) * 100 : 50;
  const wb = sane ? (vb / max) * 100 : 50;
  const aWins = !sane || va === vb ? null : higherBetter ? va > vb : va < vb;
  return (
    <div className="py-2">
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span
          className={`font-mono ${aWins === true ? "text-primary" : "text-white/70"}`}
          dir="ltr"
        >
          {fmt(va)}
          {unit ? <span className="opacity-60"> {unit}</span> : null}
          {aWins === true ? " ◂" : ""}
        </span>
        <span className="text-white/40">{label}</span>
        <span
          className={`font-mono ${aWins === false ? "text-primary" : "text-white/70"}`}
          dir="ltr"
        >
          {aWins === false ? "▸ " : ""}
          {fmt(vb)}
          {unit ? <span className="opacity-60"> {unit}</span> : null}
        </span>
      </div>
      <div className="flex h-2 gap-1 overflow-hidden rounded-full">
        <div className="flex flex-1 justify-end">
          <div
            className="h-full rounded-r-full transition-all duration-700"
            style={{
              width: `${wa}%`,
              background: colorA,
              opacity: aWins === false ? 0.45 : 1,
            }}
            title={fa}
          />
        </div>
        <div className="flex flex-1">
          <div
            className="h-full rounded-l-full transition-all duration-700"
            style={{
              width: `${wb}%`,
              background: colorB,
              opacity: aWins === true ? 0.45 : 1,
            }}
            title={fb}
          />
        </div>
      </div>
    </div>
  );
}

function DuelMode() {
  const [aId, setA] = useState("kimi-k3");
  const [bId, setB] = useState("deepseek-v4-pro");

  // defensive lookups — an unknown id must never crash the page
  const A = MODELS.find((m) => m.id === aId) ?? MODELS[0]!;
  const B = MODELS.find((m) => m.id === bId) ?? MODELS[1] ?? A;
  const sameCat = A.cat === B.cat;

  // metrics of both categories (deduped by key) — same-key rows become duels
  const metricRows = useMemo(() => {
    const seen = new Set<string>();
    const out: { mt: MetricSpec; va: number | undefined; vb: number | undefined }[] = [];
    for (const mt of [...METRICS[A.cat], ...METRICS[B.cat]]) {
      if (seen.has(mt.key)) continue;
      seen.add(mt.key);
      out.push({ mt, va: metricValue(A.id, mt.key), vb: metricValue(B.id, mt.key) });
    }
    return out;
  }, [A, B]);

  const sizeA = sizeFor(A, 10);
  const sizeB = sizeFor(B, 10);
  const aCat = CATEGORY_MAP[A.cat];
  const bCat = CATEGORY_MAP[B.cat];

  // agentic-vs-reasoning share metric keys (real duel), text-vs-image have none
  const hasOverlap = metricRows.some((r) => r.va !== undefined && r.vb !== undefined);

  const winsA = hasOverlap
    ? metricRows.filter(
        (r) =>
          r.va !== undefined &&
          r.vb !== undefined &&
          r.va !== r.vb &&
          (r.mt.higherBetter ? r.va > r.vb : r.va < r.vb),
      ).length
    : 0;

  return (
    <div>
      {/* pickers */}
      <div className="mb-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
        <ModelSelect value={aId} onChange={setA} label="مدل اول" />
        <button
          onClick={() => {
            setA(bId);
            setB(aId);
          }}
          className="mx-auto shrink-0 rounded-full border border-white/15 p-2 text-white/70 transition-colors hover:border-primary/60 hover:text-primary sm:mb-1"
          title="جابه‌جایی دو مدل"
        >
          <Repeat2 className="h-4 w-4" />
        </button>
        <ModelSelect value={bId} onChange={setB} label="مدل دوم" />
      </div>

      {/* presets */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setA(p.a);
              setB(p.b);
            }}
            className={`rounded-full border px-3 py-1 text-[11px] transition-all ${
              aId === p.a && bId === p.b
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-white/10 text-white/55 hover:border-white/25 hover:text-white/85"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* identity cards */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {[A, B].map((m, idx) => {
          const c = CATEGORY_MAP[m.cat];
          return (
            <div
              key={idx}
              className="rounded-xl border p-3.5"
              style={{
                borderColor: `${c.color}44`,
                background: `linear-gradient(160deg, ${c.color}0d, transparent 70%)`,
              }}
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span
                  className="rounded-sm px-1.5 py-0.5 font-mono text-[9px]"
                  style={{ background: `${c.color}22`, color: c.color }}
                >
                  {c.fa}
                </span>
                <span className="font-mono text-[9px] text-white/30">{idx === 0 ? "A" : "B"}</span>
              </div>
              <div className="text-sm font-bold leading-6 text-white">{m.fa}</div>
              <div className="font-mono text-[10px] text-white/45" dir="ltr">
                {m.en} · {m.params}
              </div>
              <p className="mt-2 text-[11px] leading-5 text-white/60">{m.tagFa}</p>
            </div>
          );
        })}
      </div>

      {!hasOverlap && (
        <p className="mb-4 flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] p-3 text-[11px] leading-5 text-amber-200/80">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          این دو مدل از دو دستهٔ متفاوت‌اند ({aCat.fa} و {bCat.fa}) — سنجه‌های کیفیت مستقیماً قابل
          قیاس نیستند؛ مقایسهٔ معنادار اینجا روی <b>سخت‌افزار و هزینهٔ استقرار</b> انجام می‌شود و
          بقیهٔ سنجه‌ها فقط کنار هم نمایش داده می‌شوند.
        </p>
      )}

      {/* metric duels */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
          <Swords className="h-4 w-4 text-primary" />
          {hasOverlap ? (
            <>
              سر‌به‌سر روی {faDigits(winsA)} سنجه —{" "}
              {winsA * 2 >
              metricRows.filter((r) => r.va !== undefined && r.vb !== undefined).length ? (
                <span className="text-primary">{A.fa} جلوتر است</span>
              ) : (
                <span className="text-primary">{B.fa} جلوتر است</span>
              )}
            </>
          ) : (
            "سنجه‌های هر مدل"
          )}
        </h3>
        {metricRows.map((r) => {
          if (r.va !== undefined && r.vb !== undefined) {
            return (
              <DuelBar
                key={r.mt.key}
                label={r.mt.fa}
                unit={r.mt.unit}
                va={r.va}
                vb={r.vb}
                higherBetter={r.mt.higherBetter}
                fa={A.fa}
                fb={B.fa}
                colorA={aCat.color}
                colorB={bCat.color}
              />
            );
          }
          // one-sided metric — the side WITHOUT the datum reads «ناموجود», never 0
          return (
            <div
              key={r.mt.key}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-white/[0.04] py-1.5 text-[11px]"
            >
              <span className="text-left font-mono text-white/75" dir="ltr">
                {r.va !== undefined ? (
                  <>
                    {fmt(r.va)} {r.mt.unit} ◂ {A.en}
                  </>
                ) : (
                  <span className="text-white/30">{MISSING_FA}</span>
                )}
              </span>
              <span className="px-2 text-center text-white/40">{r.mt.fa}</span>
              <span className="text-right font-mono text-white/75" dir="ltr">
                {r.vb !== undefined ? (
                  <>
                    {B.en} ▸ {fmt(r.vb)} {r.mt.unit}
                  </>
                ) : (
                  <span className="text-white/30">{MISSING_FA}</span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* hardware duel — always comparable */}
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
          <Scale className="h-4 w-4 text-primary" />
          سخت‌افزار لازم برای ۱۰ کاربر همزمان (برآورد موتور محاسبهٔ سایت)
        </h3>
        <DuelBar
          label="هزینهٔ کل سخت‌افزار"
          unit="$"
          va={sizeA.priceTotal}
          vb={sizeB.priceTotal}
          higherBetter={false}
          fa={A.fa}
          fb={B.fa}
          colorA={aCat.color}
          colorB={bCat.color}
        />
        <DuelBar
          label="مصرف برق ماهانه"
          unit="$"
          va={sizeA.powerMonthlyUsd}
          vb={sizeB.powerMonthlyUsd}
          higherBetter={false}
          fa={A.fa}
          fb={B.fa}
          colorA={aCat.color}
          colorB={bCat.color}
        />
        <SpecRow
          label="کارت گرافیک"
          a={`${sizeA.gpus}× ${GPUS[A.gpu].name}`}
          b={`${sizeB.gpus}× ${GPUS[B.gpu].name}`}
        />
        <SpecRow label="وزن مدل" a={String(A.weightsGb)} b={String(B.weightsGb)} unit="GB" />
        <SpecRow label="دقت" a={A.precision} b={B.precision} />
      </div>

      {/* use cases */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[A, B].map((m, idx) => (
          <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-1.5 font-mono text-[10px] text-white/40" dir="ltr">
              {m.en}
            </div>
            <div className="mb-2 text-xs font-bold text-primary">مناسب برای چه کارهایی؟</div>
            <p className="text-[12px] leading-6 text-white/75">{m.useForFa}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/hardware"
          className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-xs text-primary transition-colors hover:bg-primary/20"
        >
          مشاهدهٔ این مدل‌ها در کهکشان سه‌بعدی
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function ComparePage() {
  const [mode, setMode] = useState<"chart" | "duel">("chart");

  return (
    <Shell>
      <section className="relative overflow-hidden px-6 pb-16 pt-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(600px 300px at 85% 0%, rgba(77,255,136,0.10), transparent), radial-gradient(500px 260px at 10% 20%, rgba(147,197,253,0.07), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-5xl">
          <p className="font-mono text-xs text-primary/80" dir="ltr">
            &gt; diff /models --metrics
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">
            آزمایشگاه <span className="text-primary">مقایسه</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
            هر دسته از مدل‌ها را روی یک نمودار ببینید و هر دو مدل دلخواه — از متن و تصویر تا ویدیو و
            سه‌بعدی — را سر‌به‌سر مقایسه کنید: کیفیت، سرعت، قیمت API و سخت‌افزار لازم برای میزبانی
            خصوصی.
          </p>
          <div className="mt-4">
            <SourceBadge />
          </div>

          {/* mode tabs */}
          <div className="mt-8 mb-8 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1.5 sm:max-w-md">
            <button
              onClick={() => setMode("chart")}
              className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all ${
                mode === "chart"
                  ? "bg-primary/15 font-bold text-primary shadow-[inset_0_0_0_1px_rgba(77,255,136,0.35)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span className="flex h-4 items-end gap-0.5">
                <span className="w-1 rounded-sm bg-current" style={{ height: "60%" }} />
                <span className="w-1 rounded-sm bg-current" style={{ height: "100%" }} />
                <span className="w-1 rounded-sm bg-current" style={{ height: "40%" }} />
              </span>
              نمودار دسته‌ای
            </button>
            <button
              onClick={() => setMode("duel")}
              className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all ${
                mode === "duel"
                  ? "bg-primary/15 font-bold text-primary shadow-[inset_0_0_0_1px_rgba(77,255,136,0.35)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Swords className="h-4 w-4" />
              مقایسهٔ دو‌به‌دو
            </button>
          </div>

          <Reveal>{mode === "chart" ? <ChartMode /> : <DuelMode />}</Reveal>

          {/* methodology note */}
          <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-[11px] leading-6 text-white/50">
            <p className="mb-1 font-bold text-white/70">منابع و روش</p>
            <p>
              دادهٔ کیفیت/سرعت/قیمت مدل‌های متنی از{" "}
              <b className="text-white/80">Artificial Analysis</b> (شاخص هوش و اندازه‌گیری‌های سرعت)
              و <b className="text-white/80">BenchLM</b> (لیدربورد BenchAlign) برداشت شده و روی
              مقیاس ۰–۱۰۰ نرمال شده است. امتیاز آرنای تصویر/ویدیو از آرناهای انتخاب انسانی همین
              سایت‌ها است. سنجه‌های VRAM و هزینهٔ سخت‌افزار خروجی موتور محاسبهٔ خودِ این سایت است
              (کانتکست ۸K، میزبانی خصوصی). نقطهٔ سبز = دادهٔ مستقیم منبع، نقطهٔ کهربایی = برآورد
              نرمال‌شده بر پایهٔ همان منابع. برای تصمیم نهایی، صفحهٔ مدل را در منبع باز کنید.
            </p>
          </div>
        </div>
      </section>
    </Shell>
  );
}
