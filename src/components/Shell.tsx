import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { Intro } from "./Intro";

const nav = [
  { to: "/", label: "خانه" },
  { to: "/services", label: "خدمات" },
  { to: "/hardware", label: "سخت‌افزار" },
  { to: "/compare", label: "مقایسه" },
  { to: "/showcase", label: "نمونه‌کارها" },
  { to: "/contact", label: "تماس" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // If the viewport grows to desktop while the drawer is open (rotation,
  // window resize), close it — otherwise the scroll lock would survive a
  // menu that is visually hidden by CSS.
  useEffect(() => {
    if (!menuOpen) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const close = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, [menuOpen]);

  return (
    <div dir="rtl" className="min-h-screen flex flex-col">
      {/* Global CRT overlays */}
      <div className="crt-scanlines" aria-hidden />
      <div className="crt-vignette" aria-hidden />

      <a
        href="#main-content"
        className="skip-link"
        onClick={(e) => {
          // keep default anchor behavior; move focus for keyboard users
          const main = document.getElementById("main-content");
          if (main) {
            e.preventDefault();
            main.focus();
            main.scrollIntoView();
          }
        }}
      >
        رفتن به محتوای اصلی
      </a>

      <header className="border-b border-primary/25 bg-background/75 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-4">
          <Link to="/" className="font-mono text-primary font-bold shrink-0 text-sm md:text-base">
            &gt; هوش برتر_
            <span className="cursor-blink" aria-hidden />
          </Link>

          {/* desktop nav */}
          <nav aria-label="ناوبری اصلی" className="hidden md:flex items-center gap-6 text-sm">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-muted-foreground hover:text-primary transition-colors"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: true }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div
            className="hidden md:flex items-center gap-3 font-mono text-[11px] shrink-0"
            dir="ltr"
          >
            <span className="flex items-center gap-1.5 text-primary">
              <span className="status-dot" aria-hidden />
              SELF-HOSTED · OPEN-WEIGHT
            </span>
          </div>

          {/* mobile hamburger → accessible Radix dialog */}
          <DialogPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <DialogPrimitive.Trigger
              aria-label="باز کردن منو"
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
              className="md:hidden grid place-items-center h-11 w-11 rounded-md border border-primary/40 text-primary bg-background/60"
            >
              <Menu size={20} />
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
              <DialogPrimitive.Content
                id="mobile-menu"
                aria-label="منوی موبایل"
                className="md:hidden fixed inset-y-0 right-0 z-50 w-[82%] max-w-xs border-s border-primary/30 bg-background/95 backdrop-blur-md p-6 flex flex-col gap-1 shadow-[0_0_60px_rgba(0,0,0,0.7)] outline-none"
              >
                <div className="flex items-center justify-between mb-6">
                  <DialogPrimitive.Title className="font-mono text-primary font-bold text-sm">
                    منوی هوش برتر
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Close
                    aria-label="بستن منو"
                    className="grid place-items-center h-11 w-11 rounded-md border border-primary/40 text-primary"
                  >
                    <X size={20} />
                  </DialogPrimitive.Close>
                </div>
                <DialogPrimitive.Description className="sr-only">
                  فهرست صفحات سایت — انتخاب یک گزینه، منو را می‌بندد.
                </DialogPrimitive.Description>
                {nav.map((n, i) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setMenuOpen(false)}
                    activeProps={{ className: "border-primary/60 text-primary bg-primary/15" }}
                    activeOptions={{ exact: true }}
                    className="flex min-h-12 items-center gap-3 rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-base font-bold text-foreground hover:text-primary hover:border-primary/50 active:bg-primary/15 transition"
                  >
                    <span className="font-mono text-[10px] text-primary/60" dir="ltr">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {n.label}
                  </Link>
                ))}
                <div
                  className="mt-auto pt-6 flex items-center gap-2 font-mono text-[11px]"
                  dir="ltr"
                >
                  <span className="flex items-center gap-1.5 text-primary">
                    <span className="status-dot" aria-hidden />
                    SELF-HOSTED
                  </span>
                </div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>

      <footer className="relative z-10 border-t border-primary/25 bg-background/80 backdrop-blur-md py-6 text-center text-sm text-muted-foreground font-mono px-4">
        <p dir="ltr" className="text-[11px] text-primary/70 mb-1">
          DC-01 // CORRIDOR-CAM: DEMO // 44 RACKS
        </p>
        © ۱۴۰۵ هوش برتر — اتوماسیون و زیرساخت هوش مصنوعی
      </footer>

      <Intro />
    </div>
  );
}

export const services = [
  {
    tag: "n8n",
    title: "اتوماسیون با n8n",
    desc: "طراحی و پیاده‌سازی ورک‌فلوهای خودکار؛ اتصال CRM، تلگرام، ایمیل، شیت‌ها و API‌ها برای حذف کارهای تکراری.",
    features: [
      "نگاشت فرایند فعلی و پیدا کردن نقاط اتوماسیون",
      "ساخت ورک‌فلو با مدیریت خطا و retry خودکار",
      "اتصال به CRM، ERP، تلگرام، ایمیل و دیتابیس",
      "داشبورد مانیتورینگ اجراها و هشدار خطا",
    ],
    tools: ["n8n", "REST API", "Postgres", "Telegram Bot", "Webhook"],
    eta: "۱ تا ۳ هفته",
    goals: ["repetitive", "chatbot"],
  },
  {
    tag: "flowise",
    title: "ایجنت و چت‌بات با Flowise",
    desc: "ساخت چت‌بات‌ها و ایجنت‌های RAG روی اسناد سازمان شما با Flowise و LangChain.",
    features: [
      "ایجنت RAG روی مستندات، قرارداد و راهنمای محصول",
      "حافظه گفتگو و شخصی‌سازی لحن برند",
      "انتخاب خودکار ابزار (Function Calling) برای کارهای چندمرحله‌ای",
      "تحویل هوشمند گفتگو به اپراتور انسانی",
    ],
    tools: ["Flowise", "LangChain", "Qdrant", "vLLM", "Chat Widget"],
    eta: "۲ تا ۴ هفته",
    goals: ["chatbot", "repetitive"],
  },
  {
    tag: "server",
    title: "استقرار سرور هوش مصنوعی",
    desc: "نصب و پیکربندی سرور اختصاصی یا ابری با Docker، GPU driver، CUDA و مانیتورینگ.",
    features: [
      "نصب سیستم‌عامل، درایور GPU و CUDA",
      "استقرار مدل با vLLM / Ollama در Docker",
      "Load balancing، autoscale و batching",
      "مانیتورینگ Prometheus + Grafana و بکاپ خودکار",
    ],
    tools: ["Docker", "vLLM", "Ollama", "Prometheus", "Grafana"],
    eta: "۳ تا ۷ روز",
    goals: ["server", "hardware"],
  },
  {
    tag: "hardware",
    title: "بستن سخت‌افزار",
    desc: "مشاوره و اسمبل سیستم‌های GPU برای استنتاج و آموزش مدل، متناسب با بودجه شما.",
    features: [
      "تحلیل بار کاری و انتخاب GPU مناسب (۴۰۹۰ تا B200)",
      "لیست خرید با قیمت روز و گزینه‌های جایگزین",
      "اسمبل، کابل‌کشی، خنک‌کننده و تست پایداری",
      "بنچمارک واقعی مدل شما روی سخت‌افزار نهایی",
    ],
    tools: ["RTX 4090/5090", "L40S", "A100/H100", "NVMe RAID", "InfiniBand"],
    eta: "۵ تا ۱۴ روز",
    goals: ["hardware"],
  },
  {
    tag: "llm",
    title: "راه‌اندازی مدل‌های Open-Weight",
    desc: "اجرای Llama، Qwen، Mistral، DeepSeek و Gemma به‌صورت محلی با vLLM، Ollama و llama.cpp.",
    features: [
      "انتخاب مدل از کهکشان ۶۱ مدلی متن‌باز",
      "کوانتیزه‌سازی متناسب با VRAM موجود",
      "فارسی‌سنجی و تنظیم پرامپت سیستمی",
      "API سازگار با OpenAI برای اتصال آسان",
    ],
    tools: ["Qwen", "Llama", "DeepSeek", "Kimi", "GLM"],
    eta: "۲ تا ۵ روز",
    goals: ["chatbot", "server"],
  },
  {
    tag: "support",
    title: "پشتیبانی و بهینه‌سازی",
    desc: "کوانتیزه‌سازی، بهینه‌سازی سرعت، امنیت داده و پشتیبانی مستمر.",
    features: [
      "پایش tok/s، VRAM و صف درخواست",
      "بهینه‌سازی batching و کوانتیزه‌سازی مجدد",
      "به‌روزرسانی امنیتی و patch مدیریت‌شده",
      "کانال پاسخ‌گویی اختصاصی",
    ],
    tools: ["Grafana", "Loki", "Fail2ban", "Backrest"],
    eta: "قرارداد ماهانه",
    goals: ["server", "support"],
  },
] as const;

/** هدف‌های انتخابی صفحه خدمات — هر هدف، ماژول‌های مرتبطش را روشن می‌کند */
export const SERVICE_GOALS = [
  { key: "repetitive", label: "کار تکراری زیاد دارم", hint: "ورک‌فلوهای n8n و ایجنت‌ها" },
  { key: "chatbot", label: "چت‌بات و ایجنت می‌خواهم", hint: "Flowise + مدل محلی" },
  { key: "server", label: "سرور AI راه بیندازم", hint: "استقرار کامل Docker + مانیتورینگ" },
  { key: "hardware", label: "سخت‌افزار GPU بخرم", hint: "مشاوره خرید و اسمبل" },
  { key: "support", label: "پشتیبانی می‌خواهم", hint: "SLA و بهینه‌سازی مستمر" },
] as const;
