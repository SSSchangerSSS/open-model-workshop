import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { Reveal, Counter } from "@/components/Reveal";
import { Parallax, ScrollProgress, StickySteps } from "@/components/ScrollFX";
import { ScrollDriver } from "@/lib/scroll-progress";
import { SectorHUD } from "@/components/SectorHUD";
import Datacenter from "@/components/Datacenter";
import { Tilt, Magnetic } from "@/components/Interactive";
import { lazy, Suspense, useRef, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { ArrowLeft, Check, Search, X, MoveHorizontal } from "lucide-react";

import hardware from "@/assets/hardware.jpg";
import workflow from "@/assets/workflow.jpg";
import llm from "@/assets/llm.jpg";

const CorridorStatus = lazy(() => import("@/components/CorridorStatus"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "هوش برتر | اتوماسیون n8n، Flowise و سرور هوش مصنوعی" },
      {
        name: "description",
        content:
          "اتوماسیون کسب‌وکار با n8n و Flowise، استقرار سرور AI، بستن سخت‌افزار و راه‌اندازی مدل‌های open-weight.",
      },
      { property: "og:title", content: "هوش برتر | اتوماسیون و زیرساخت هوش مصنوعی" },
      {
        property: "og:description",
        content: "هوش مصنوعی را روی سرور خودتان اجرا کنید و کارها را خودکار کنید.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const tools = [
  "n8n",
  "Flowise",
  "Ollama",
  "vLLM",
  "llama.cpp",
  "Docker",
  "LangChain",
  "Qwen",
  "Llama",
  "DeepSeek",
  "Mistral",
  "Gemma",
  "CUDA",
  "Qdrant",
];

const steps = [
  ["۰۱", "جلسه کشف نیاز", "فرایندهای وقت‌گیر و اهداف شما را بررسی می‌کنیم."],
  ["۰۲", "طراحی راهکار", "معماری، سخت‌افزار و مدل مناسب با بودجه شما پیشنهاد می‌شود."],
  ["۰۳", "پیاده‌سازی", "ورک‌فلوها، ایجنت‌ها و سرور را می‌سازیم و تست می‌کنیم."],
  ["۰۴", "تحویل و پشتیبانی", "آموزش تیم شما و پشتیبانی مستمر بعد از تحویل."],
];

const faq: [string, string][] = [
  [
    "چرا مدل را روی سرور خودمان اجرا کنیم؟",
    "داده‌های شما از سازمان خارج نمی‌شود، هزینه API ماهانه ندارید و به تحریم و محدودیت سرویس‌های خارجی وابسته نیستید.",
  ],
  [
    "چه سخت‌افزاری لازم دارم؟",
    "بسته به مدل؛ از یک کارت گرافیک ۲۴ گیگابایتی برای مدل‌های متوسط تا سرورهای چند GPU. مشاوره رایگان می‌دهیم.",
  ],
  [
    "n8n و Flowise چه فرقی دارند؟",
    "n8n برای اتوماسیون فرایندها و اتصال سرویس‌هاست و Flowise برای ساخت چت‌بات و ایجنت‌های هوش مصنوعی. معمولاً ترکیبشان می‌کنیم.",
  ],
  [
    "داده‌های ما امن می‌ماند؟",
    "بله؛ همهٔ مدل‌ها و ورک‌فلوها روی سرور خودتان اجرا می‌شوند و هیچ داده‌ای به سرویس خارجی ارسال نمی‌شود.",
  ],
  [
    "پروژه چقدر طول می‌کشد؟",
    "بیشتر ورک‌فلوها بین یک تا سه هفته آماره‌اند؛ بسته به تعداد اتصال‌ها و حجم مستندات.",
  ],
  [
    "اگر تیم فنی نداشته باشیم چه؟",
    "مشکلی نیست؛ آموزش و پشتیبانی مستمر بخشی از تحویل است و تیم شما را برای بهره‌برداری آماده می‌کنیم.",
  ],
];

const compareManual = [
  ["پاسخ به سؤالات تکراری مشتری", "۴ ساعت تأخیر در هر تیکت"],
  ["ثبت دستی فاکتور فروشندگان", "۱۸ ساعت کار مالی در هفته"],
  ["گزارش هفتگی مدیریت", "۲ روز کار تحلیلگر"],
  ["پیگیری سرنخ‌های فروش", "۷۰٪ تماس بی‌نتیجه"],
];
const compareAuto = [
  ["پاسخ فوری ایجنت هوشمند", "میانگین ۹ ثانیه"],
  ["خواندن و ثبت خودکار فاکتور", "۹۶٪ دقت، بدون کار دستی"],
  ["گزارش تحلیلی خودکار", "شنبه ۷ صبح در ایمیل"],
  ["امتیازدهی و مسیریابی لید", "فقط لید داغ به فروش می‌رسد"],
];

function Index() {
  return (
    <Shell>
      <ScrollProgress />
      <ScrollDriver />
      <SectorHUD />
      <Datacenter />
      <CorridorGate />

      <div className="relative z-10">
        {/* MARQUEE */}
        <section
          className="border-y border-primary/20 bg-background/55 backdrop-blur-md py-6 overflow-hidden"
          dir="ltr"
        >
          <div className="marquee-mask">
            <div className="flex w-max animate-marquee gap-12 font-mono text-xl text-muted-foreground">
              {[...tools, ...tools].map((t, i) => (
                <span key={i} className="hover:text-primary hover:[text-shadow:0_0_18px_var(--primary)] transition">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            [80, "٪", "کاهش کارهای دستی"],
            [24, "/۷", "کارکرد بی‌وقفه"],
            [100, "٪", "داده نزد شما"],
            [0, "", "هزینه API ماهانه"],
          ].map(([n, s, l], i) => (
            <Reveal key={i} delay={i * 100}>
              <Tilt max={7}>
                <div className="scan-hover lift panel-glass rounded-lg py-8 text-center group relative">
                  <span
                    className="absolute top-2 start-3 font-mono text-[9px] text-primary/50"
                    dir="ltr"
                  >
                    SIG-{String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="text-4xl md:text-5xl font-black text-primary transition-transform duration-300 group-hover:scale-110">
                    <Counter to={n as number} suffix={s as string} />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{l}</div>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </section>

        {/* COMPARE — manual vs automated (drag me) */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <Reveal>
            <p className="font-mono text-xs text-primary text-center" dir="ltr">
              &gt; diff --before --after
            </p>
            <h2 className="mt-3 text-3xl md:text-5xl font-black text-center">
              دستگیره را بکشید؛ <span className="text-gradient">تفاوت را ببینید</span>
            </h2>
            <p className="mt-3 text-center text-muted-foreground max-w-xl mx-auto">
              یک نمای ساده از روزهای کار دستی در برابر روزهای اتوماسیون‌شده با هوش برتر.
            </p>
          </Reveal>
          <Reveal delay={120} className="mt-10">
            <CompareSlider />
          </Reveal>
        </section>

        {/* BENTO */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <Reveal>
            <p className="font-mono text-xs text-primary text-center" dir="ltr">
              &gt; ls /services --all
            </p>
            <h2 className="mt-3 text-3xl md:text-5xl font-black text-center">
              همه‌چیز برای <span className="text-gradient">هوش مصنوعی خودمیزبان</span>
            </h2>
          </Reveal>
          <div className="mt-12 grid md:grid-cols-3 gap-4 md:auto-rows-[280px]">
            <Bento
              img={workflow}
              tag="n8n · Flowise"
              title="اتوماسیون و ایجنت‌های هوشمند"
              desc="اتصال CRM، تلگرام، ایمیل و API‌ها؛ چت‌بات‌های RAG روی اسناد شما."
              className="md:col-span-2"
            />
            <Bento
              img={hardware}
              tag="Hardware"
              title="بستن سخت‌افزار GPU"
              desc="۶۱ مدل متن‌باز در ۹ کهکشان — از چت و ایجنت تا تصویر، ویدیو، صدا و سه‌بعدی — با قیمت دلاری زنده."
            />
            <Bento
              img={llm}
              tag="Open-Weight"
              title="اجرای مدل‌های باز"
              desc="Llama، Qwen، DeepSeek، Mistral با vLLM و Ollama."
            />
            <Reveal delay={200} className="md:col-span-2 h-full">
              <div className="h-full rack-card p-8 flex flex-col justify-between border-beam">
                <span className="font-mono text-xs text-accent">#server</span>
                <div>
                  <h3 className="text-2xl font-bold">استقرار سرور هوش مصنوعی</h3>
                  <p className="mt-2 text-muted-foreground">
                    Docker، درایور و CUDA، مانیتورینگ، بکاپ و امنیت — آماده بهره‌برداری.
                  </p>
                  <pre dir="ltr" className="mt-4 font-mono text-xs text-primary">
                    $ vllm serve Qwen2.5-32B <span className="text-accent">✔ 62 tok/s</span>
                  </pre>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* PROCESS */}
        <section className="bg-background/45 backdrop-blur-sm border-y border-primary/20">
          <StickySteps steps={steps} />
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 py-24">
          <Reveal>
            <p className="font-mono text-xs text-primary text-center" dir="ltr">
              &gt; cat FAQ.md
            </p>
            <h2 className="mt-3 text-3xl md:text-5xl font-black text-center">سؤالات متداول</h2>
          </Reveal>
          <FaqBlock />
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl rack-card border-beam p-12 md:p-20 text-center">
              <div className="pointer-events-none absolute inset-0 bg-primary/10 blur-3xl animate-aurora" />
              <p className="relative font-mono text-xs text-primary" dir="ltr">
                &gt; ./start-automation --consultation=free
              </p>
              <h2 className="relative mt-4 text-3xl md:text-5xl font-black">
                آماده‌اید <span className="text-gradient">کارها را خودکار</span> کنید؟
              </h2>
              <p className="relative mt-4 text-muted-foreground">
                یک جلسه مشاوره رایگان ۳۰ دقیقه‌ای رزرو کنید.
              </p>
              <div className="relative mt-8">
                <Magnetic>
                  <Link
                    to="/contact"
                    className="inline-block bg-primary text-primary-foreground px-10 py-4 rounded-lg font-bold glow hover:scale-105 transition"
                  >
                    رزرو مشاوره رایگان
                  </Link>
                </Magnetic>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </Shell>
  );
}

/** Lazy client-only HUD strip that sits right below the hero fold. */
function CorridorGate() {
  return (
    <div className="relative z-10">
      <ClientOnly fallback={null}>
        <Suspense fallback={null}>
          <CorridorStatus />
        </Suspense>
      </ClientOnly>
    </div>
  );
}

function Bento({
  img,
  tag,
  title,
  desc,
  className = "",
}: {
  img: string;
  tag: string;
  title: string;
  desc: string;
  className?: string;
}) {
  return (
    <Reveal className={`${className} h-full`}>
      <Tilt className="h-full">
        <div className="scan-hover lift group relative h-full min-h-[280px] overflow-hidden rack-card">
          <Parallax speed={0.15} className="absolute -inset-y-16 inset-x-0">
            <img
              src={img}
              alt={title}
              loading="lazy"
              width={1024}
              height={768}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            />
          </Parallax>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute top-0 inset-x-0 h-1 flex gap-px opacity-80" aria-hidden>
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className={`flex-1 ${i % 3 === 0 ? "bg-primary" : i % 3 === 1 ? "bg-primary/40" : "bg-primary/15"}`}
              />
            ))}
          </div>
          <div className="relative h-full flex flex-col justify-end p-6">
            <span className="font-mono text-xs text-accent">{tag}</span>
            <h3 className="mt-1 text-2xl font-bold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        </div>
      </Tilt>
    </Reveal>
  );
}

/** Manual vs automated — drag the divider and watch the day transform. */
function CompareSlider() {
  const [pos, setPos] = useState(55);
  const wrap = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromX = (clientX: number) => {
    const el = wrap.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pct = ((clientX - r.left) / r.width) * 100;
    setPos(Math.min(88, Math.max(12, pct)));
  };

  return (
    <div
      ref={wrap}
      dir="ltr"
      className="compare-wrap rack-card relative h-[430px] md:h-[360px] cursor-ew-resize"
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setFromX(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && setFromX(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      {/* BASE layer — manual work (dim, red-ish) */}
      <CompareSide
        tone="manual"
        title="فرایند دستی"
        sub="BEFORE"
        rows={compareManual}
      />
      {/* TOP layer — automated (green glow), revealed to the right of the divider */}
      <div className="compare-side" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <CompareSide tone="auto" title="با اتوماسیون هوش برتر" sub="AFTER" rows={compareAuto} />
      </div>

      {/* divider + knob */}
      <div className="compare-divider pointer-events-none" style={{ left: `${pos}%` }} />
      <button
        type="button"
        aria-label="جابه‌جایی مقایسه"
        className="compare-knob h-11 w-11 grid place-items-center text-primary"
        style={{ left: `${pos}%` }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPos((p) => Math.max(12, p - 4));
          if (e.key === "ArrowRight") setPos((p) => Math.min(88, p + 4));
        }}
      >
        <MoveHorizontal size={20} />
      </button>
    </div>
  );
}

function CompareSide({
  tone,
  title,
  sub,
  rows,
}: {
  tone: "manual" | "auto";
  title: string;
  sub: string;
  rows: string[][];
}) {
  const auto = tone === "auto";
  return (
    <div
      className={`absolute inset-0 flex flex-col p-6 md:p-8 ${
        auto ? "bg-primary/10 backdrop-blur-[2px]" : "bg-background/80"
      }`}
      dir="rtl"
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`font-mono text-[10px] tracking-widest ${auto ? "text-primary" : "text-muted-foreground"}`}
            dir="ltr"
          >
            {sub}
          </p>
          <h3 className={`mt-1 text-xl font-black ${auto ? "text-primary" : "text-foreground/80"}`}>
            {title}
          </h3>
        </div>
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            auto ? "status-dot" : "bg-muted-foreground/40"
          }`}
          aria-hidden
        />
      </div>
      <div className="mt-5 grid gap-2.5">
        {rows.map(([t, d], i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-md border px-3.5 py-3 ${
              auto
                ? "border-primary/35 bg-primary/8"
                : "border-border/70 bg-muted/20 opacity-70"
            }`}
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <span
              className={`shrink-0 grid place-items-center h-6 w-6 rounded-full border ${
                auto ? "border-primary/60 text-primary" : "border-border text-muted-foreground"
              }`}
            >
              {auto ? <Check size={13} /> : <X size={13} />}
            </span>
            <div className="min-w-0">
              <p className={`text-sm font-bold truncate ${auto ? "" : "line-through decoration-muted-foreground/50"}`}>
                {t}
              </p>
              <p className={`text-[11px] mt-0.5 ${auto ? "text-primary/85" : "text-muted-foreground"}`}>
                {d}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p
        className={`mt-auto pt-4 font-mono text-[10px] tracking-widest ${
          auto ? "text-primary" : "text-muted-foreground/60"
        }`}
        dir="ltr"
      >
        {auto ? "> uptime 24/7 — zero hand-work" : "> waiting for human…"}
      </p>
    </div>
  );
}

/** FAQ with live filter — جست‌وجو در سؤالات */
function FaqBlock() {
  const [q, setQ] = useState("");
  const norm = (s: string) => s.replace(/\u200c/g, " ").toLowerCase();
  const hits = faq.filter(
    ([qa, aa]) => norm(qa).includes(norm(q)) || norm(aa).includes(norm(q)),
  );
  return (
    <div className="mt-8">
      <label className="relative block">
        <Search
          size={16}
          className="absolute start-4 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جست‌وجو در سؤالات… مثلا «سخت‌افزار»"
          className="terminal-input !ps-11"
          aria-label="جست‌وجوی سؤالات"
        />
      </label>
      <p className="mt-2 font-mono text-[10px] text-muted-foreground" dir="ltr">
        {q ? `grep -i "${q}" → ${hits.length} match` : "> all questions loaded"}
      </p>
      <div className="mt-5 space-y-3">
        {hits.map(([qa, aa], i) => (
          <details
            key={qa}
            dir="rtl"
            open={q !== ""}
            className="group rack-card p-5 open:border-primary transition"
          >
            <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
              <span className="flex items-start gap-3 min-w-0">
                <span className="font-mono text-primary shrink-0 mt-0.5 text-sm" dir="ltr">
                  [{String(i + 1).padStart(2, "0")}]
                </span>
                <bdi dir="rtl" className="font-bold leading-relaxed">
                  {qa}
                </bdi>
              </span>
              <span className="text-primary text-xl leading-none group-open:rotate-45 transition shrink-0">
                +
              </span>
            </summary>
            <div dir="rtl" className="mt-4 flex items-start gap-3 text-muted-foreground">
              <span className="font-mono text-accent shrink-0 text-sm mt-0.5" dir="ltr">
                A&gt;
              </span>
              <p className="leading-relaxed">{aa}</p>
            </div>
          </details>
        ))}
        {hits.length === 0 && (
          <div className="rack-card p-8 text-center">
            <p className="font-mono text-sm text-primary" dir="ltr">
              grep: no matches found
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              سؤال شما اینجا نیست؟ در صفحه تماس بپرسید — پاسخ می‌دهیم.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
