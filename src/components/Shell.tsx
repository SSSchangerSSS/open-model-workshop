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
  },
  {
    tag: "flowise",
    title: "ایجنت و چت‌بات با Flowise",
    desc: "ساخت چت‌بات‌ها و ایجنت‌های RAG روی اسناد سازمان شما با Flowise و LangChain.",
  },
  {
    tag: "server",
    title: "استقرار سرور هوش مصنوعی",
    desc: "نصب و پیکربندی سرور اختصاصی یا ابری با Docker، GPU driver، CUDA و مانیتورینگ.",
  },
  {
    tag: "hardware",
    title: "بستن سخت‌افزار",
    desc: "مشاوره و اسمبل سیستم‌های GPU برای استنتاج و آموزش مدل، متناسب با بودجه شما.",
  },
  {
    tag: "llm",
    title: "راه‌اندازی مدل‌های Open-Weight",
    desc: "اجرای Llama، Qwen، Mistral، DeepSeek و Gemma به‌صورت محلی با vLLM، Ollama و llama.cpp.",
  },
  {
    tag: "support",
    title: "پشتیبانی و بهینه‌سازی",
    desc: "کوانتیزه‌سازی، بهینه‌سازی سرعت، امنیت داده و پشتیبانی مستمر.",
  },
];
