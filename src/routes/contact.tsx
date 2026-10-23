import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { ContactTerminal } from "@/components/ContactTerminal";
import { Reveal } from "@/components/Reveal";
import {
  Check,
  Copy,
  Mail,
  MessageCircle,
  Phone,
  Timer,
  ShieldCheck,
  FileSearch,
  Rocket,
  TriangleAlert,
} from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import MatrixBackdrop from "@/components/MatrixBackdrop";
import { SceneBoundary } from "@/components/SceneBoundary";
import { isCompactDevice } from "@/lib/device";
import { CONTACT_CHANNELS, OFFICE_HOURS, isOfficeOpen, type ContactChannel } from "@/lib/contact";

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

const CHANNEL_ICONS = { telegram: MessageCircle, mail: Mail, phone: Phone } as const;

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
  const open = isOfficeOpen(now);
  return (
    <div className="rack-card lift p-5">
      <p className="font-mono text-[10px] text-primary/70 tracking-widest" dir="ltr">
        TEHRAN HQ // LOCAL TIME
      </p>
      <p className="mt-2 font-mono text-3xl font-black text-primary" dir="ltr">
        {get("hour")}:{get("minute")}
        <span className="time-blink text-primary/60">:{get("second")}</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{OFFICE_HOURS.noteFa}</p>
      <p className="mt-2 flex items-center gap-2 text-xs font-bold">
        <span
          className={`inline-block h-2 w-2 rounded-full ${open ? "status-dot" : "bg-muted-foreground/50"}`}
          aria-hidden
        />
        <span className={open ? "text-primary" : "text-muted-foreground"}>
          {open ? "الان دفتر باز است" : "الان دفتر بسته است — پیام بگذارید، اول وقت پاسخ می‌دهیم"}
        </span>
      </p>
    </div>
  );
}

export function ChannelCard({ c }: { c: ChannelCardProps }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const Icon = CHANNEL_ICONS[c.icon];
  const isExternal = c.href.startsWith("http");

  async function copy() {
    setError("");
    try {
      await navigator.clipboard.writeText(c.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
      setError("کپی خودکار نشد — مقدار زیر قابل انتخاب و کپی دستی است.");
    }
  }

  return (
    <div className="rack-card lift scan-hover p-5 group relative">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center h-10 w-10 shrink-0 rounded-md border border-primary/30 bg-primary/10 text-primary transition group-hover:scale-110">
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{c.label}</p>
          {/* the whole value IS the link — href from shared config, never a nested button */}
          <a
            href={c.href}
            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="block min-h-6 font-mono text-sm font-bold text-foreground underline-offset-4 hover:text-primary hover:underline"
            aria-label={`${c.actionFa} — ${c.value}`}
          >
            <bdi dir="auto" className="truncate">
              {c.value}
            </bdi>
          </a>
        </div>
        {/* copy button — a sibling of the link, never nested inside it */}
        <button
          type="button"
          onClick={copy}
          aria-label={`کپی ${c.label}`}
          className="min-h-11 min-w-11 shrink-0 rounded-md border border-border p-2.5 text-muted-foreground hover:text-primary hover:border-primary/60 transition"
        >
          {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
        </button>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground/80">{c.actionFa}</p>
      {error && (
        <p role="alert" className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-300">
          <TriangleAlert size={12} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
type ChannelCardProps = ContactChannel;

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
              <SceneBoundary fallback={null}>
                <DatacenterScene mode="fixed" model={-1} />
              </SceneBoundary>
            </Suspense>
          )}
        </ClientOnly>
      </div>

      <div
        className="cv-auto relative z-10 max-w-5xl mx-auto px-5 md:px-6 py-16 md:py-20"
        style={{ "--cv-size": "1400px" } as React.CSSProperties}
      >
        <p className="font-mono text-xs text-primary mb-2" dir="ltr">
          &gt; connect --to=human
        </p>
        <p className="font-mono text-xs text-muted-foreground mb-5" dir="ltr">
          [یک انسان پاسخ می‌دهد — پاسخ‌گویی کمتر از یک روز کاری]
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
              {CONTACT_CHANNELS.map((c) => (
                <Reveal key={c.id} delay={60}>
                  <ChannelCard c={c} />
                </Reveal>
              ))}
            </div>
            <Reveal delay={120}>
              <ClientOnly
                fallback={
                  <div className="rack-card p-5">
                    <p className="font-mono text-xs text-muted-foreground" dir="ltr">
                      TEHRAN HQ // --:--:--
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">{OFFICE_HOURS.noteFa}</p>
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
