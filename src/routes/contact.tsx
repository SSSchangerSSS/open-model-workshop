import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تماس | هوش برتر" },
      { name: "description", content: "برای مشاوره اتوماسیون و زیرساخت هوش مصنوعی با ما تماس بگیرید." },
      { property: "og:title", content: "تماس با هوش برتر" },
      { property: "og:description", content: "درخواست مشاوره رایگان." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const field = "w-full bg-muted border rounded-lg px-4 py-3 focus:outline-none focus:border-primary";
  return (
    <Shell>
      <section className="max-w-xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-black">درخواست مشاوره</h1>
        <p className="mt-3 text-muted-foreground">نیاز خود را بنویسید؛ به‌زودی تماس می‌گیریم.</p>
        {sent ? (
          <p className="mt-10 text-primary font-bold">پیام شما ثبت شد. ممنون!</p>
        ) : (
          <form className="mt-10 space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <input required placeholder="نام" className={field} />
            <input required placeholder="ایمیل یا شماره تماس" className={field} />
            <textarea required rows={5} placeholder="توضیح پروژه" className={field} />
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold glow w-full">ارسال</button>
          </form>
        )}
      </section>
    </Shell>
  );
}
