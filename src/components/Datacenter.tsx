import { useEffect, lazy, Suspense, useState } from "react";
import { Link, ClientOnly } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, Mail, RotateCcw, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactTerminal } from "./ContactTerminal";
import { HeroTerminal } from "./HeroTerminal";
import MatrixBackdrop from "./MatrixBackdrop";
import { isCompactDevice } from "@/lib/device";

const DatacenterScene = lazy(() => import("./DatacenterScene"));

/** One-time client tier — phones / low-power devices get the 2D backdrop
 *  and never download the ~1MB three.js chunk on content pages. */
const COMPACT = isCompactDevice();

const models = [
  { name: "Qwen", detail: "گفتگو و پردازش فارسی" },
  { name: "Llama", detail: "ایجنت‌های سازمانی" },
  { name: "DeepSeek", detail: "استدلال و برنامه‌نویسی" },
  { name: "Mistral", detail: "استنتاج سریع و محلی" },
];

export default function Datacenter() {
  const [model, setModel] = useState(-1);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = document.querySelector('[role="dialog"]');
    const first = dialog?.querySelector<HTMLElement>("button,input");
    first?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab" || !dialog) return;
      const nodes = Array.from(dialog.querySelectorAll<HTMLElement>("button,input,textarea"));
      const first = nodes[0];
      const last = nodes.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", key);
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [open]);
  const m = models[model];

  return (
    <>
      {/* Fixed backdrop behind the whole page: real 3D corridor on desktop,
          lightweight 2D matrix rain on phones — camera walks with scroll */}
      <div className="scene-fixed" aria-hidden={false}>
        <ClientOnly fallback={<SceneFallback />}>
          {COMPACT ? (
            <MatrixBackdrop />
          ) : (
            <Suspense fallback={<SceneFallback />}>
              <DatacenterScene
                mode="scroll"
                model={model}
                onPickModel={setModel}
                onContact={() => setOpen(true)}
              />
            </Suspense>
          )}
        </ClientOnly>
      </div>

      {/* Hero overlays (first viewport) */}
      <section className="hero-over-scene" aria-label="دیتاسنتر سه‌بعدی هوش برتر">
        <div className="datacenter-copy">
          <p className="font-mono text-xs text-primary" dir="ltr">
            THE MATRIX / PRIVATE AI DATA&nbsp;CENTER
          </p>
          <h1 className="mt-4 font-black">
            هوش برتر
            <span className="text-primary cursor-blink" aria-hidden />
          </h1>
          <p className="mt-3 max-w-md text-sm md:text-base text-muted-foreground">
            به راهروی دیتاسنتر ما خوش آمدید؛ رک‌ها را لمس کنید، فرمان بدهید، اسکرول کنید.
            <br />
            مدل‌های باز، سرورهای اختصاصی، اتوماسیون هوشمند — زیرساخت شما؛ هوش بی‌مرز.
          </p>
        </div>

        {/* Interactive console — left side (end side in RTL) */}
        <div className="hero-terminal-slot">
          <HeroTerminal />
        </div>

        {/* scroll invitation */}
        <div className="scroll-hint" aria-hidden>
          <span className="panel-glass rounded-full px-4 py-1.5 text-xs text-muted-foreground flex items-center gap-2">
            برای قدم زدن در راهرو اسکرول کنید
            <ChevronDown className="h-3.5 w-3.5 text-primary animate-bounce" />
          </span>
        </div>

        <div className="datacenter-bottom">
          <div className="flex flex-wrap gap-2 mb-4" dir="ltr">
            {models.map((m, i) => (
              <Button
                key={m.name}
                variant="outline"
                onClick={() => setModel(model === i ? -1 : i)}
                aria-pressed={model === i}
                className={
                  model === i
                    ? "border-primary text-primary glow"
                    : "text-muted-foreground bg-background/60 backdrop-blur"
                }
              >
                <Server />
                {m.name}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              title="نمای کلی"
              aria-label="نمای کلی"
              className="bg-background/60 backdrop-blur"
              onClick={() => setModel(-1)}
            >
              <RotateCcw />
            </Button>
          </div>
          <div className="flex flex-wrap justify-between gap-4 items-end">
            <div className="panel-glass px-4 py-3 rounded-lg">
              <p className="font-mono text-xs text-primary" dir="ltr">
                {m ? `NODE / ${m.name.toUpperCase()}` : "SELF-HOSTED / OPEN-WEIGHT"}
              </p>
              <p className="mt-2 text-sm">
                {m ? (
                  <>
                    <bdi className="font-bold text-foreground">{m.name}</bdi> — {m.detail}
                  </>
                ) : (
                  "n8n · Flowise · GPU Servers"
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="h-11 glow" onClick={() => setOpen(true)}>
                <Mail />
                ارتباط با متخصص
              </Button>
              <Button asChild variant="outline" className="h-11 bg-background/60 backdrop-blur">
                <Link to="/services">
                  خدمات
                  <ArrowLeft />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {open && (
        <div
          className="connection-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="ارتباط با متخصص"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div>
            <ContactTerminal
              model={m?.name || "زیرساخت هوش مصنوعی"}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

function SceneFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="font-mono text-primary text-sm" dir="ltr">
        &gt; booting datacenter_
        <span className="cursor-blink" aria-hidden />
      </p>
    </div>
  );
}
