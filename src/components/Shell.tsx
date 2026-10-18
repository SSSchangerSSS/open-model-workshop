import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Intro } from "./Intro";

const nav = [
  { to: "/", label: "خانه" },
  { to: "/services", label: "خدمات" },
  { to: "/hardware", label: "سخت‌افزار" },
  { to: "/showcase", label: "نمونه‌کارها" },
  { to: "/contact", label: "تماس" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen flex flex-col">
      {/* Global CRT overlays */}
      <div className="crt-scanlines" aria-hidden />
      <div className="crt-vignette" aria-hidden />

      <header className="border-b border-primary/25 bg-background/75 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="font-mono text-primary font-bold shrink-0">
            &gt; هوش برتر_
            <span className="cursor-blink" aria-hidden />
          </Link>
          <nav className="flex flex-wrap justify-end gap-x-4 gap-y-1 md:gap-6 text-sm">
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
              <span className="status-dot" />
              SYS.ONLINE
            </span>
            <span className="text-muted-foreground">UPTIME 99.98%</span>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="relative z-10 border-t border-primary/25 bg-background/80 backdrop-blur-md py-6 text-center text-sm text-muted-foreground font-mono">
        <p dir="ltr" className="text-[11px] text-primary/70 mb-1">
          DC-01 // CORRIDOR-CAM: LIVE // 44 RACKS ONLINE
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
      "پایش لحظه‌ای tok/s، VRAM و صف درخواست",
      "بهینه‌سازی batching و کوانتیزه‌سازی مجدد",
      "به‌روزرسانی امنیتی و patch مدیریت‌شده",
      "SLA پاسخ‌گویی با کانال تلگرام اختصاصی",
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
