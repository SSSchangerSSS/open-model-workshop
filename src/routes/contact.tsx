import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { ContactTerminal } from "@/components/ContactTerminal";
import { Reveal } from "@/components/Reveal";
import {
  Copy,
  Check,
  Mail,
  MessageCircle,
  Phone,
  Timer,
  ShieldCheck,
  FileSearch,
  Rocket,
} from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import MatrixBackdrop from "@/components/MatrixBackdrop";
import { isCompactDevice } from "@/lib/device";

const DatacenterScene = lazy(() => import("@/components/DatacenterScene"));

/** Phones / low-power devices get the 2D rain, never the three.js chunk. */
const COMPACT = isCompactDevice();

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تماس | هوش برتر" },
      {
        name: "description",
        content: "برای مشاوره اتوماسیون و زیرساخت هوش مصنوعی با ما تماس بگیرید.",
      },
      { property: "og:title", content: "تماس با هوش برتر" },
      { property: "og:description", content: "درخواست مشاوره رایگان." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://ssschangersss.github.io/open-model-workshop/contact" },
    ],
  }),
  component: Contact,
});

const CHANNELS = [
  {
    icon: MessageCircle,
    label: "تلگرام",
    value: "@hoosh_bartar",
    ltr: true,
    href: "https://t.me/hoosh_bartar",
  },
  {
    icon: Mail,
    label: "ایمیل",
    value: "hello@hooshbartar.ir",
    ltr: true,
    href: "mailto:hello@hooshbartar.ir",
  },
  {
    icon: Phone,
    label: "تلفن دفتر",
    value: "۰۲۱ - ۹۱۰۰ ۰۰۰۰",
    ltr: false,
    href: "tel:+982191000000",
  },
] as const;

const CYCLE = [
  {
    icon: FileSearch,
    title: "کشف نیاز",
    desc: "۳۰ دقیقه گفتگو؛ فرایندها و اهداف را می‌شناسیم و امکان‌سنجی اولیه را همان‌جا می‌گوییم.",
    tag: "روز ۰",
  },
  {
    icon: ShieldCheck,
    title: "طراحی راهکار",
    desc: "معماری، مدل، سخت‌افزار و برآورد هزینه در یک سند شفاف — بدون هزینه.",
    tag: "۲ روز بعد",
  },
  {
    icon: Rocket,
    title: "پیاده‌سازی",
    desc: "ورک‌فلو و سرور ساخته و تست می‌شود؛ هر هفته دموی قابل مشاهده دارید.",
    tag: "۱ تا ۴ هفته",
  },
  {
    icon: Timer,
    title: "تحویل و پشتیبانی",
    desc: "آموزش تیم، مستندات فارسی و پشتیبانی با پاسخ کمتر از ۲ ساعت کاری.",
    tag: "مستمر",
  },
] as const;

function TehranClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = new Intl.DateTimeFormat("fa-IR", {
    timeZone: "Asia/Tehran",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "long",
  });
  const parts = fmt.formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekend = ["جمعه"].includes(get("weekday"));
  return (
    <div className="rack-card lift p-5">
      <p className="font-mono text-[10px] text-primary/70 tracking-widest" dir="ltr">
        TEHRAN HQ // LOCAL TIME
      </p>
      <p className="mt-2 font-mono text-3xl font-black text-primary" dir="ltr">
        {get("hour")}:{get("minute")}
        <span className="time-blink text-primary/60">:{get("second")}</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {get("weekday")} —{" "}
        {weekend
          ? "دفتر تعطیل است؛ پیام بگذارید، صبح شنبه پاسخ می‌گیرید."
          : "دفتر باز است · پاسخ < ۲ ساعت کاری"}
      </p>
    </div>
  );
}

function ChannelCard({ c }: { c: (typeof CHANNELS)[number] }) {
  const [copied, setCopied] = useState(false);
  const Icon = c.icon;
  return (
    <div className="rack-card lift scan-hover p-5 group relative">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center h-10 w-10 rounded-md border border-primary/30 bg-primary/10 text-primary transition group-hover:scale-110">
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{c.label}</p>
          <bdi
            dir={c.ltr ? "ltr" : "rtl"}
            className="block font-mono text-sm font-bold text-foreground truncate"
          >
            {c.value}
          </bdi>
        </div>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(c.value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            } catch {
              /* clipboard unavailable */
            }
          }}
          aria-label={`کپی ${c.label}`}
          className="shrink-0 rounded-md border border-border p-2 text-muted-foreground hover:text-primary hover:border-primary/60 transition"
        >
          {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

function Contact() {
  return (
    <Shell>
      {/* 3D corridor entrance behind the terminal — 2D matrix rain on phones */}
      <div className="scene-fixed" aria-hidden>
        <ClientOnly fallback={null}>
          {COMPACT ? (
            <MatrixBackdrop />
          ) : (
            <Suspense fallback={null}>
              <DatacenterScene mode="fixed" model={-1} />
            </Suspense>
          )}
        </ClientOnly>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <p className="font-mono text-primary mb-2" dir="ltr">
          &gt; establish human connection --secure
        </p>
        <p className="font-mono text-xs text-muted-foreground mb-5" dir="ltr">
          [tunnel: aes-256 · operator standing by]
        </p>
        <h1 className="text-4xl font-black mb-3">
          ارتباط با <span className="text-gradient">هوش برتر</span>
        </h1>
        <p className="max-w-xl text-muted-foreground leading-relaxed mb-10">
          هر زمان از شبانه‌روز که پیام بدهید، یک انسان جواب می‌دهد — نه یک بات. موضوع گفتگو را
          انتخاب کنید، بقیهٔ مسیر با ماست.
        </p>

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-5 items-start">
          {/* right column (start in RTL): channels + clock + cycle */}
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
              {CHANNELS.map((c) => (
                <Reveal key={c.label} delay={60}>
                  <ChannelCard c={c} />
                </Reveal>
              ))}
            </div>
            <Reveal delay={120}>
              <ClientOnly
                fallback={
                  <div className="rack-card p-5 font-mono text-xs text-muted-foreground" dir="ltr">
                    TEHRAN HQ // --:--:--
                  </div>
                }
              >
                <TehranClock />
              </ClientOnly>
            </Reveal>
          </div>

          {/* terminal */}
          <Reveal delay={100}>
            <ContactTerminal />
          </Reveal>
        </div>

        {/* مسیر همکاری */}
        <div className="mt-16">
          <Reveal>
            <p className="font-mono text-xs text-primary" dir="ltr">
              &gt; cat cooperation-cycle.md
            </p>
            <h2 className="mt-3 text-2xl md:text-3xl font-black">
              از تماس تا تحویل، چه اتفاقی می‌افتد؟
            </h2>
          </Reveal>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CYCLE.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.title} delay={i * 90}>
                  <div className="rack-card lift scan-hover p-5 h-full group relative">
                    <span
                      className="absolute top-4 end-4 font-mono text-[10px] text-primary/60"
                      dir="ltr"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="grid place-items-center h-10 w-10 rounded-md border border-primary/30 bg-primary/10 text-primary transition group-hover:scale-110 group-hover:glow">
                      <Icon size={18} />
                    </span>
                    <h3 className="mt-3 font-bold group-hover:text-primary transition-colors">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                    <p className="mt-3 font-mono text-[10px] text-accent">{s.tag}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </Shell>
  );
}
