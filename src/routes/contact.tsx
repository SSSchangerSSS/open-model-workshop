import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { ContactTerminal } from "@/components/ContactTerminal";
import { Reveal } from "@/components/Reveal";
import {
  Copy,
  Check,
  MessageCircle,
  Mail,
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
import { CONTACT_CHANNELS, OFFICE_HOURS_TEHRAN, type ContactChannel } from "@/lib/contact";
import { MODELS, sanitizeUsers } from "@/lib/sizing";

const DatacenterScene = lazy(() => import("@/components/DatacenterScene"));

/** Phones / low-power devices get the 2D rain, never the three.js chunk. */
const COMPACT = isCompactDevice();

export const Route = createFileRoute("/contact")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { model?: string | undefined; users?: number | undefined } => ({
    model: typeof search["model"] === "string" ? search["model"] : undefined,
    users: typeof search["users"] === "string" ? Number(search["users"]) : undefined,
  }),
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
      { property: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://ssschangersss.github.io/open-model-workshop/contact" },
    ],
  }),
  component: Contact,
});

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
    desc: "آموزش تیم، مستندات فارسی و پشتیبانی با پاسخ‌گویی در ساعات کاری.",
    tag: "مستمر",
  },
] as const;

const WEEKDAY_FA = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

/** پیش‌فرض بی‌ادعا: تا وقتی OFFICE_HOURS_TEHRAN تنظیم نشده، فقط ساعت را نشان بده. */
function officeStatus(now: Date): string | null {
  if (!OFFICE_HOURS_TEHRAN) return null;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tehran",
      hour: "numeric",
      minute: "numeric",
      weekday: "short",
      hour12: false,
    }).formatToParts(now);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const weekdayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const day = weekdayMap[get("weekday")] ?? -1;
    const hours = day >= 0 ? OFFICE_HOURS_TEHRAN[day] : undefined;
    if (!hours) return `${WEEKDAY_FA[day] ?? ""} — دفتر تعطیل است؛ پیام بگذارید.`;
    const minutes = Number(get("hour")) * 60 + Number(get("minute"));
    if (minutes >= hours[0] * 60 && minutes < hours[1] * 60)
      return "دفتر باز است — در ساعات کاری پیام می‌دهیم.";
    return "الان خارج از ساعت کاری است؛ پیام بگذارید، اولین ساعت کاری پاسخ می‌گیرید.";
  } catch {
    return null;
  }
}

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
  const status = officeStatus(now);
  return (
    <div className="rack-card lift p-5">
      <p className="font-mono text-[10px] text-primary/70 tracking-widest" dir="ltr">
        TEHRAN // LOCAL TIME
      </p>
      <p className="mt-2 font-mono text-3xl font-black text-primary" dir="ltr">
        {get("hour")}:{get("minute")}
        <span className="time-blink text-primary/60">:{get("second")}</span>
      </p>
      {status ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {get("weekday")} — {status}
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">
          {get("weekday")} — ساعت کاری روی سایت تنظیم نشده؛ هر زمان پیام بدهید پاسخ می‌گیرید.
        </p>
      )}
    </div>
  );
}

function ChannelCard({ c }: { c: ContactChannel }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const Icon = c.ltr && c.key === "telegram" ? MessageCircle : c.key === "email" ? Mail : Phone;
  return (
    <div className="rack-card lift scan-hover p-5 group relative">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center h-10 w-10 shrink-0 rounded-md border border-primary/30 bg-primary/10 text-primary transition group-hover:scale-110">
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">
            {c.label}
            {!c.verified && (
              <span
                className="ms-2 rounded border border-amber-400/40 bg-amber-400/10 px-1 py-px font-mono text-[9px] text-amber-300"
                title="این مقدار توسط ابزار ساخت سایت پیشنهاد شده و هنوز توسط مالک تأیید نشده است"
              >
                تأییدنشده
              </span>
            )}
          </p>
          {/* لینک واقعی — کپی جدا و بیرون از لینک تا داخل هم تو در تو نشوند */}
          <a
            href={c.href}
            target={c.href.startsWith("http") ? "_blank" : undefined}
            rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="block font-mono text-sm font-bold text-foreground hover:text-primary transition-colors focus-visible:text-primary"
          >
            <bdi dir={c.ltr ? "ltr" : "rtl"} className="block max-w-full truncate">
              {c.value}
            </bdi>
          </a>
        </div>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(c.value);
              setState("copied");
            } catch {
              setState("error");
            }
            setTimeout(() => setState("idle"), 2000);
          }}
          aria-label={`کپی ${c.label}`}
          className="shrink-0 grid place-items-center h-9 w-9 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary/60 transition focus-visible:border-primary"
        >
          {state === "copied" ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
        </button>
      </div>
      {state === "error" && (
        <p role="status" className="mt-2 text-[11px] text-amber-300">
          کپی خودکار ممکن نشد — مقدار را از لینک بالا انتخاب و دستی کپی کنید.
        </p>
      )}
    </div>
  );
}

function Contact() {
  const { model, users } = Route.useSearch();
  // مدل انتخاب‌شده از صفحه سخت‌افزار می‌آید (بدون داده حساس) — نام فارسی از کاتالوگ
  const modelFa = model ? (MODELS.find((m) => m.id === model)?.fa ?? model) : undefined;
  const presetTopic = model ? `سخت‌افزار GPU` : undefined;
  const presetDetail =
    modelFa || users
      ? [
          modelFa ? `مدل: ${modelFa}` : null,
          users && Number.isFinite(users) ? `${sanitizeUsers(users)} کاربر همزمان` : null,
        ]
          .filter(Boolean)
          .join(" · ") || undefined
      : undefined;

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

      <div
        className="cv-auto relative z-10 max-w-5xl mx-auto px-5 md:px-6 py-16 md:py-20"
        style={{ "--cv-size": "1400px" } as React.CSSProperties}
      >
        <p className="font-mono text-primary mb-2" dir="ltr">
          &gt; establish human connection
        </p>
        <h1 className="text-4xl font-black mb-3">
          ارتباط با <span className="text-gradient">هوش برتر</span>
        </h1>
        <p className="max-w-xl text-muted-foreground leading-relaxed mb-6">
          فرم زیر پیش‌نویس پیام را برایتان آماده و کپی می‌کند؛ آن را در ایمیل یا تلگرام خودتان
          بفرستید. یک انسان جواب می‌دهد — نه یک بات.
        </p>
        <p className="mb-10 max-w-xl rounded-md border border-amber-400/25 bg-amber-400/[0.06] px-3 py-2 text-[11px] leading-relaxed text-amber-200/85">
          نکتهٔ شفافیت: مقدار کانال‌های تماس هنوز توسط مالک سایت تأیید نشده است؛ تا آن زمان
          مطمئن‌ترین مسیر، ساخت و کپی پیش‌نویس پیام است.
        </p>

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-5 items-start">
          {/* right column (start in RTL): channels + clock + cycle */}
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
              {CONTACT_CHANNELS.map((c) => (
                <Reveal key={c.key} delay={60}>
                  <ChannelCard c={c} />
                </Reveal>
              ))}
            </div>
            <Reveal delay={120}>
              <ClientOnly
                fallback={
                  <div className="rack-card p-5 font-mono text-xs text-muted-foreground" dir="ltr">
                    TEHRAN // --:--:--
                  </div>
                }
              >
                <TehranClock />
              </ClientOnly>
            </Reveal>
          </div>

          {/* terminal */}
          <Reveal delay={100}>
            <ContactTerminal
              preset={
                presetTopic || presetDetail
                  ? { topic: presetTopic ?? "مشاوره عمومی", detail: presetDetail }
                  : undefined
              }
            />
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
