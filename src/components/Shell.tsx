import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "خانه" },
  { to: "/services", label: "خدمات" },
  { to: "/contact", label: "تماس" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen flex flex-col">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-mono text-primary font-bold">&gt; هوش برتر_</Link>
          <nav className="flex gap-6 text-sm">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="text-muted-foreground hover:text-primary" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground font-mono">
        © ۱۴۰۵ هوش برتر — اتوماسیون و زیرساخت هوش مصنوعی
      </footer>
    </div>
  );
}

export const services = [
  { tag: "n8n", title: "اتوماسیون با n8n", desc: "طراحی و پیاده‌سازی ورک‌فلوهای خودکار؛ اتصال CRM، تلگرام، ایمیل، شیت‌ها و API‌ها برای حذف کارهای تکراری." },
  { tag: "flowise", title: "ایجنت و چت‌بات با Flowise", desc: "ساخت چت‌بات‌ها و ایجنت‌های RAG روی اسناد سازمان شما با Flowise و LangChain." },
  { tag: "server", title: "استقرار سرور هوش مصنوعی", desc: "نصب و پیکربندی سرور اختصاصی یا ابری با Docker، GPU driver، CUDA و مانیتورینگ." },
  { tag: "hardware", title: "بستن سخت‌افزار", desc: "مشاوره و اسمبل سیستم‌های GPU برای استنتاج و آموزش مدل، متناسب با بودجه شما." },
  { tag: "llm", title: "راه‌اندازی مدل‌های Open-Weight", desc: "اجرای Llama، Qwen، Mistral، DeepSeek و Gemma به‌صورت محلی با vLLM، Ollama و llama.cpp." },
  { tag: "support", title: "پشتیبانی و بهینه‌سازی", desc: "کوانتیزه‌سازی، بهینه‌سازی سرعت، امنیت داده و پشتیبانی مستمر." },
];
