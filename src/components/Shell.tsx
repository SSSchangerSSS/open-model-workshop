import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, MonitorPlay } from "lucide-react";
import { Intro } from "./Intro";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  const [introOpen, setIntroOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // close the mobile menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // and when the viewport grows to desktop (no stranded overlay / scroll lock)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setMenuOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div dir="rtl" className="min-h-screen flex flex-col">
      {/* keyboard users can jump straight to the content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-primary-foreground"
      >
        پرش به محتوای اصلی
      </a>

      <header className="border-b border-primary/25 bg-background/75 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-4">
          <Link to="/" className="font-brand text-primary font-bold shrink-0 text-sm md:text-base">
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
            title="عنصر نمایشی برند — مانیتورینگ واقعی نیست"
          >
            <span className="flex items-center gap-1.5 text-primary">
              <span className="status-dot" />
              SYS.ONLINE
            </span>
            <span className="text-muted-foreground">
              UPTIME 99.98%{" "}
              <span className="text-primary/50" aria-hidden>
                · demo
              </span>
            </span>
          </div>

          {/* mobile menu — a real accessible dialog (Radix): focus trap, Escape,
              focus restore and scroll lock with cleanup are built in */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              aria-controls="mobile-menu"
              className="md:hidden grid place-items-center h-11 w-11 rounded-md border border-primary/40 text-primary bg-background/60"
            >
              <Menu size={20} />
              <span className="sr-only">باز کردن منو</span>
            </SheetTrigger>
            <SheetContent
              id="mobile-menu"
              side="right"
              className="md:hidden w-[80%] max-w-xs border-s border-primary/30 bg-background/95 backdrop-blur-md p-6 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between mb-4">
                <SheetTitle className="font-brand text-primary font-bold text-sm" dir="ltr">
                  &gt; menu_
                </SheetTitle>
              </div>
              <SheetDescription className="sr-only">
                منوی ناوبری اصلی سایت هوش برتر
              </SheetDescription>
              <nav aria-label="ناوبری موبایل" className="flex flex-col gap-1">
                {nav.map((n, i) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    className="flex min-h-12 items-center gap-3 rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-base font-bold text-foreground hover:text-primary hover:border-primary/50 active:bg-primary/15 transition"
                    activeProps={{ className: "border-primary/60 text-primary bg-primary/15" }}
                    activeOptions={{ exact: true }}
                  >
                    <span className="font-mono text-[10px] text-primary/60" dir="ltr">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {n.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto pt-6 flex items-center gap-2 font-mono text-[11px]" dir="ltr">
                <span className="flex items-center gap-1.5 text-primary">
                  <span className="status-dot" />
                  SYS.ONLINE
                </span>
                <span className="text-muted-foreground">UPTIME 99.98% · demo</span>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <footer className="relative z-10 border-t border-primary/25 bg-background/80 backdrop-blur-md py-6 text-center text-sm text-muted-foreground font-mono px-4">
        <p dir="ltr" className="text-[11px] text-primary/70 mb-1" title="عنصر نمایشی صحنه">
          DC-01 // CORRIDOR-SCENE (نمایشی) // 44 RACKS
        </p>
        © ۱۴۰۵ هوش برتر — اتوماسیون و زیرساخت هوش مصنوعی
        <div className="mt-3">
          {/* Optional brand moment — plays ONLY on explicit request, desktop
              viewports only (the 2240-element scene is too heavy for phones).
              Reduced-motion users get a static, animation-free version. */}
          <button
            onClick={() => setIntroOpen(true)}
            className="hidden lg:inline-flex items-center gap-2 rounded-md border border-primary/30 px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
          >
            <MonitorPlay className="h-3.5 w-3.5" />
            ورود نمایشی به دیتاسنتر
          </button>
        </div>
      </footer>

      {introOpen && <Intro onClose={() => setIntroOpen(false)} />}
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
    outcome: "حذف کار دستی تکراری و گزارش‌گیری خودکار از همهٔ اجراها",
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
    outcome: "پاسخ فوری و مستند به مشتری و همکار، ۲۴ ساعته و با ذکر منبع",
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
    outcome: "سرور آماده بهره‌برداری با مانیتورینگ و بکاپ — بدون وابستگی به سرویس بیرونی",
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
    outcome: "سیستم GPU تست‌شده با عدد واقعی tok/s برای بار کاری خودتان",
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
    outcome: "مدل مناسب دادهٔ شما، فارسی‌سنجی‌شده و پشت یک API استاندارد",
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
      "SLA پاسخ‌گویی با کانال تلگرام اختصاصی",
    ],
    tools: ["Grafana", "Loki", "Fail2ban", "Backrest"],
    eta: "قرارداد ماهانه",
    outcome: "کارکرد پایدار و سریع مدل‌ها با پاسخ‌گویی SLAدار",
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
