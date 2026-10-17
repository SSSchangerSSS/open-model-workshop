import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, services } from "@/components/Shell";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "خدمات | هوش برتر" },
      { name: "description", content: "اتوماسیون n8n، Flowise، استقرار سرور AI، بستن سخت‌افزار GPU و راه‌اندازی مدل‌های open-weight." },
      { property: "og:title", content: "خدمات هوش برتر" },
      { property: "og:description", content: "فهرست کامل خدمات اتوماسیون و زیرساخت هوش مصنوعی." },
    ],
  }),
  component: Services,
});

function Services() {
  return (
    <Shell>
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-black">خدمات ما</h1>
        <p className="mt-3 text-muted-foreground">از ایده تا اجرا روی زیرساخت شما.</p>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <div key={s.tag} className="bg-card border rounded-lg p-6 hover:border-primary transition">
              <span className="font-mono text-xs text-accent">0{i + 1} / #{s.tag}</span>
              <h3 className="mt-2 font-bold text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
        <Link to="/contact" className="inline-block mt-12 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold glow">شروع پروژه</Link>
      </section>
    </Shell>
  );
}
