import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { ContactTerminal } from "@/components/ContactTerminal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تماس | هوش برتر" },
      { name: "description", content: "برای مشاوره اتوماسیون و زیرساخت هوش مصنوعی با ما تماس بگیرید." },
      { property: "og:title", content: "تماس با هوش برتر" },
      { property: "og:description", content: "درخواست مشاوره رایگان." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <Shell>
      <section className="max-w-xl mx-auto px-6 py-20">
        <p className="font-mono text-primary mb-5" dir="ltr">&gt; establish human connection</p>
        <h1 className="text-4xl font-black mb-8">ارتباط با هوش برتر</h1>
        <ContactTerminal />
      </section>
    </Shell>
  );
}
