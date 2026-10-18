import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { Reveal, Counter } from "@/components/Reveal";
import { Parallax, ScrollProgress, StickySteps } from "@/components/ScrollFX";
import { ScrollDriver } from "@/lib/scroll-progress";
import { SectorHUD } from "@/components/SectorHUD";
import Datacenter from "@/components/Datacenter";
import { Tilt } from "@/components/Interactive";
import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

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

const faq = [
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
          <div className="flex w-max animate-marquee gap-12 font-mono text-xl text-muted-foreground">
            {[...tools, ...tools].map((t, i) => (
              <span key={i} className="hover:text-primary transition">
                {t}
              </span>
            ))}
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
              <div className="panel-glass rounded-lg py-8 text-center hover:border-primary/60 transition-colors">
                <div className="text-4xl md:text-5xl font-black text-primary">
                  <Counter to={n as number} suffix={s as string} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{l}</div>
              </div>
            </Reveal>
          ))}
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
              desc="۱۵ مدل متن‌باز در ۷ دسته — از چت و ایجنت تا تصویر، ویدیو و صوت — با قیمت دلاری زنده."
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
          <div className="mt-10 space-y-3">
            {faq.map(([q, a], i) => (
              <Reveal key={i} delay={i * 100}>
                <details dir="rtl" className="group rack-card p-5 open:border-primary transition">
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                    <span className="flex items-start gap-3 min-w-0">
                      <span className="font-mono text-primary shrink-0 mt-0.5 text-sm" dir="ltr">
                        [{String(i + 1).padStart(2, "0")}]
                      </span>
                      <bdi dir="rtl" className="font-bold leading-relaxed">
                        {q}
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
                    <p className="leading-relaxed">{a}</p>
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
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
              <Link
                to="/contact"
                className="relative inline-block mt-8 bg-primary text-primary-foreground px-10 py-4 rounded-lg font-bold glow hover:scale-105 transition"
              >
                رزرو مشاوره رایگان
              </Link>
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
        <div className="group relative h-full min-h-[280px] overflow-hidden rack-card">
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
