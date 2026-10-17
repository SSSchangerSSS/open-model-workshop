import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, services } from "@/components/Shell";

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

function Index() {
  return (
    <Shell>
      <section className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-mono text-accent text-sm mb-4">// self-hosted AI · automation</p>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            هوش مصنوعی <span className="text-primary">روی سرور خودتان</span>، کارها خودکار.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            از ورک‌فلوهای n8n و ایجنت‌های Flowise تا اسمبل سرور GPU و اجرای مدل‌های open-weight — همه را یک‌جا انجام می‌دهیم.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/contact" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold glow">درخواست مشاوره</Link>
            <Link to="/services" className="border px-6 py-3 rounded-lg hover:border-primary">مشاهده خدمات</Link>
          </div>
        </div>
        <pre dir="ltr" className="bg-card border rounded-lg p-6 font-mono text-sm text-muted-foreground overflow-x-auto glow">
{`$ docker compose up -d n8n flowise
✔ n8n       running :5678
✔ flowise   running :3000
$ vllm serve Qwen/Qwen2.5-32B-Instruct
✔ GPU 0: RTX 4090  24GB
✔ model loaded  · 62 tok/s
`}<span className="text-primary">ready_</span>
        </pre>
      </section>
      <section className="max-w-6xl mx-auto px-6 pb-24 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.slice(0, 3).map((s) => (
          <div key={s.tag} className="bg-card border rounded-lg p-6 hover:border-primary transition">
            <span className="font-mono text-xs text-accent">#{s.tag}</span>
            <h3 className="mt-2 font-bold text-lg">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </section>
    </Shell>
  );
}
