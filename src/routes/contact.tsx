import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { ContactTerminal } from "@/components/ContactTerminal";
import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

const DatacenterScene = lazy(() => import("@/components/DatacenterScene"));

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تماس | هوش برتر" },
      {
        name: "description",
        content: "برای مشاوره اتوماسیون و زیرساخت هوش مصنوعی با ما تماس بگیرید.",
      },
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
      {/* 3D corridor entrance behind the terminal */}
      <div className="scene-fixed" aria-hidden>
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <DatacenterScene mode="fixed" model={-1} />
          </Suspense>
        </ClientOnly>
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-6 py-20">
        <p className="font-mono text-primary mb-2" dir="ltr">
          &gt; establish human connection --secure
        </p>
        <p className="font-mono text-xs text-muted-foreground mb-5" dir="ltr">
          [tunnel: aes-256 · operator standing by]
        </p>
        <h1 className="text-4xl font-black mb-8">ارتباط با هوش برتر</h1>
        <ContactTerminal />
      </div>
    </Shell>
  );
}
