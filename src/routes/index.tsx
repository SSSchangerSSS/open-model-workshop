import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { Reveal, Counter } from "@/components/Reveal";
import hero from "@/assets/hero.jpg";
import hardware from "@/assets/hardware.jpg";
import workflow from "@/assets/workflow.jpg";
import llm from "@/assets/llm.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "هوش‌کار | اتوماسیون n8n، Flowise و سرور هوش مصنوعی" },
      { name: "description", content: "اتوماسیون کسب‌وکار با n8n و Flowise، استقرار سرور AI، بستن سخت‌افزار و راه‌اندازی مدل‌های open-weight." },
      { property: "og:title", content: "هوش‌کار | اتوماسیون و زیرساخت هوش مصنوعی" },
      { property: "og:description", content: "هوش مصنوعی را روی سرور خودتان اجرا کنید و کارها را خودکار کنید." },
    ],
  }),
  component: Index,
});

const tools = ["n8n", "Flowise", "Ollama", "vLLM", "llama.cpp", "Docker", "LangChain", "Qwen", "Llama", "DeepSeek", "Mistral", "Gemma", "CUDA", "Qdrant"];

const steps = [
  ["۰۱", "جلسه کشف نیاز", "فرایندهای وقت‌گیر و اهداف شما را بررسی می‌کنیم."],
  ["۰۲", "طراحی راهکار", "معماری، سخت‌افزار و مدل مناسب با بودجه شما پیشنهاد می‌شود."],
  ["۰۳", "پیاده‌سازی", "ورک‌فلوها، ایجنت‌ها و سرور را می‌سازیم و تست می‌کنیم."],
  ["۰۴", "تحویل و پشتیبانی", "آموزش تیم شما و پشتیبانی مستمر بعد از تحویل."],
];

const faq = [
  ["چرا مدل را روی سرور خودمان اجرا کنیم؟", "داده‌های شما از سازمان خارج نمی‌شود، هزینه API ماهانه ندارید و به تحریم و محدودیت سرویس‌های خارجی وابسته نیستید."],
  ["چه سخت‌افزاری لازم دارم؟", "بسته به مدل؛ از یک کارت گرافیک ۲۴ گیگابایتی برای مدل‌های متوسط تا سرورهای چند GPU. مشاوره رایگان می‌دهیم."],
  ["n8n و Flowise چه فرقی دارند؟", "n8n برای اتوماسیون فرایندها و اتصال سرویس‌هاست و Flowise برای ساخت چت‌بات و ایجنت‌های هوش مصنوعی. معمولاً ترکیبشان می‌کنیم."],
];

function Index() {
  return (
    <Shell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-primary/20 blur-3xl animate-aurora" />
        <div className="pointer-events-none absolute top-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent/15 blur-3xl animate-aurora" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-4 py-1.5 text-xs font-mono text-muted-foreground backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> ظرفیت پذیرش پروژه جدید باز است
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-6 text-4xl md:text-7xl font-black leading-[1.15]">
              کسب‌وکارتان را با <span className="text-gradient">هوش مصنوعی اختصاصی</span><br />خودکار کنید
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              اتوماسیون با n8n، ایجنت‌های هوشمند با Flowise، بستن سرور GPU و اجرای مدل‌های open-weight روی زیرساخت خودتان — بدون وابستگی، با امنیت کامل داده.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link to="/contact" className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold glow hover:scale-105 transition">مشاوره رایگان بگیرید</Link>
              <Link to="/services" className="border bg-card/50 backdrop-blur px-8 py-4 rounded-xl hover:border-primary transition">مشاهده خدمات</Link>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <div className="mt-16 rounded-2xl border-beam glow overflow-hidden animate-float">
              <img src={hero} alt="سرور هوش مصنوعی با کارت‌های گرافیک" width={1536} height={1024} className="w-full rounded-2xl" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-y bg-card/40 py-6 overflow-hidden" dir="ltr">
        <div className="flex w-max animate-marquee gap-12 font-mono text-xl text-muted-foreground">
          {[...tools, ...tools].map((t, i) => <span key={i} className="hover:text-primary transition">{t}</span>)}
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[[80, "٪", "کاهش کارهای دستی"], [24, "/۷", "کارکرد بی‌وقفه"], [100, "٪", "داده نزد شما"], [0, "", "هزینه API ماهانه"]].map(([n, s, l], i) => (
          <Reveal key={i} delay={i * 100}>
            <div className="text-4xl md:text-5xl font-black text-primary"><Counter to={n as number} suffix={s as string} /></div>
            <div className="mt-2 text-sm text-muted-foreground">{l}</div>
          </Reveal>
        ))}
      </section>

      {/* BENTO */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <Reveal><h2 className="text-3xl md:text-5xl font-black text-center">همه‌چیز برای <span className="text-gradient">هوش مصنوعی خودمیزبان</span></h2></Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-4 md:auto-rows-[280px]">
          <Bento img={workflow} tag="n8n · Flowise" title="اتوماسیون و ایجنت‌های هوشمند" desc="اتصال CRM، تلگرام، ایمیل و API‌ها؛ چت‌بات‌های RAG روی اسناد شما." className="md:col-span-2" />
          <Bento img={hardware} tag="Hardware" title="بستن سخت‌افزار GPU" desc="انتخاب و اسمبل قطعات متناسب با مدل و بودجه." />
          <Bento img={llm} tag="Open-Weight" title="اجرای مدل‌های باز" desc="Llama، Qwen، DeepSeek، Mistral با vLLM و Ollama." />
          <Reveal delay={200} className="md:col-span-2 h-full">
            <div className="h-full rounded-2xl border bg-card p-8 flex flex-col justify-between border-beam">
              <span className="font-mono text-xs text-accent">#server</span>
              <div>
                <h3 className="text-2xl font-bold">استقرار سرور هوش مصنوعی</h3>
                <p className="mt-2 text-muted-foreground">Docker، درایور و CUDA، مانیتورینگ، بکاپ و امنیت — آماده بهره‌برداری.</p>
                <pre dir="ltr" className="mt-4 font-mono text-xs text-primary">$ vllm serve Qwen2.5-32B  ✔ 62 tok/s</pre>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-card/40 border-y py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal><h2 className="text-3xl md:text-5xl font-black text-center">مسیر همکاری</h2></Reveal>
          <div className="mt-14 grid md:grid-cols-4 gap-6">
            {steps.map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 120}>
                <div className="group rounded-2xl border bg-background p-6 h-full hover:border-primary hover:-translate-y-2 transition duration-500">
                  <div className="font-mono text-3xl text-primary/50 group-hover:text-primary transition">{n}</div>
                  <h3 className="mt-4 font-bold text-lg">{t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <Reveal><h2 className="text-3xl md:text-5xl font-black text-center">سؤالات متداول</h2></Reveal>
        <div className="mt-10 space-y-3">
          {faq.map(([q, a], i) => (
            <Reveal key={i} delay={i * 100}>
              <details className="group rounded-xl border bg-card p-5 open:border-primary transition">
                <summary className="cursor-pointer list-none flex justify-between font-bold">{q}<span className="text-primary group-open:rotate-45 transition">+</span></summary>
                <p className="mt-3 text-muted-foreground">{a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border-beam bg-card p-12 md:p-20 text-center">
            <div className="pointer-events-none absolute inset-0 bg-primary/10 blur-3xl animate-aurora" />
            <h2 className="relative text-3xl md:text-5xl font-black">آماده‌اید <span className="text-gradient">کارها را خودکار</span> کنید؟</h2>
            <p className="relative mt-4 text-muted-foreground">یک جلسه مشاوره رایگان ۳۰ دقیقه‌ای رزرو کنید.</p>
            <Link to="/contact" className="relative inline-block mt-8 bg-primary text-primary-foreground px-10 py-4 rounded-xl font-bold glow hover:scale-105 transition">رزرو مشاوره رایگان</Link>
          </div>
        </Reveal>
      </section>
    </Shell>
  );
}

function Bento({ img, tag, title, desc, className = "" }: { img: string; tag: string; title: string; desc: string; className?: string }) {
  return (
    <Reveal className={`${className} h-full`}>
      <div className="group relative h-full min-h-[280px] overflow-hidden rounded-2xl border">
        <img src={img} alt={title} loading="lazy" width={1024} height={768} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-6">
          <span className="font-mono text-xs text-accent">{tag}</span>
          <h3 className="mt-1 text-2xl font-bold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
    </Reveal>
  );
}
