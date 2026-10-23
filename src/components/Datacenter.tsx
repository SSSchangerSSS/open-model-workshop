import { lazy, Suspense, useState } from "react";
import { Link, ClientOnly } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, Mail, RotateCcw, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ContactTerminal } from "./ContactTerminal";
import { HeroTerminal } from "./HeroTerminal";
import MatrixBackdrop from "./MatrixBackdrop";
import { isCompactDevice } from "@/lib/device";
import { useIdleReveal } from "@/lib/use-idle-reveal";

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
  // Desktop only: wait for browser idle before pulling the ~900KB three.js
  // chunk (first paint, hydration and INP stay clean). On compact devices
  // the 2D backdrop renders and the chunk is never requested.
  const idleReady = useIdleReveal() && !COMPACT;
  const m = models[model];

  return (
    <>
      {/* Fixed backdrop behind the whole page: real 3D corridor on desktop
          (revealed once the browser is idle), lightweight 2D matrix rain on
          phones — camera walks with scroll */}
      <div className="scene-fixed" aria-hidden={false}>
        <ClientOnly fallback={<SceneFallback />}>
          {COMPACT ? (
            <MatrixBackdrop />
          ) : idleReady ? (
            <Suspense fallback={null}>
              <DatacenterScene
                mode="scroll"
                model={model}
                onPickModel={setModel}
                onContact={() => setOpen(true)}
              />
            </Suspense>
          ) : (
            <SceneFallback />
          )}
        </ClientOnly>
      </div>

      {/* Hero overlays (first viewport) */}
      <section className="hero-over-scene" aria-label="دیتاسنتر سه‌بعدی هوش برتر">
        <div className="datacenter-copy">
          <p className="font-mono text-xs text-primary" dir="ltr">
            THE MATRIX / PRIVATE AI DATA&nbsp;CENTER
          </p>
          <p className="mt-3 text-sm font-bold text-foreground/90">
            هوش برتر — زیرساخت هوش مصنوعی و اتوماسیون
          </p>
          <h1 className="mt-2 h1-fluid max-w-xl [text-shadow:0_0_28px_color-mix(in_oklab,var(--primary)_30%,transparent)]">
            هوش مصنوعی و اتوماسیون، روی زیرساخت خودتان
          </h1>
          <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
            مدل‌های وزن‌باز، سرورهای اختصاصی و ورک‌فلوهای n8n و Flowise — دادهٔ شما از سازمان خارج
            نمی‌شود؛ راهروی دیتاسنتر ما را اسکرول کنید و ببینید.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button asChild className="h-12 px-6 glow">
              <Link to="/contact">درخواست مشاوره</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 px-6 bg-background/60 backdrop-blur">
              <Link to="/hardware">برآورد سخت‌افزار</Link>
            </Button>
          </div>
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
                className={`min-h-11 ${
                  model === i
                    ? "border-primary text-primary glow"
                    : "text-muted-foreground bg-background/60 backdrop-blur"
                }`}
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
              className="min-h-11 min-w-11 bg-background/60 backdrop-blur"
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
              <Button
                variant="ghost"
                className="h-11 text-muted-foreground"
                onClick={() => setOpen(true)}
              >
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

      {/* contact dialog — Radix Dialog owns focus trap, Escape, scroll lock
          and focus restore; no hand-rolled focus management here anymore */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[560px] border-primary/30 bg-background p-0 gap-0">
          <DialogTitle className="sr-only">ارتباط با متخصص هوش برتر</DialogTitle>
          <DialogDescription className="sr-only">
            انتخاب موضوع و ساخت پیش‌نویس پیام برای تیم هوش برتر
          </DialogDescription>
          <ContactTerminal model={m?.name || "زیرساخت هوش مصنوعی"} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function SceneFallback() {
  return (
    <div className="scene-css-fallback" aria-hidden>
      <span className="font-mono text-primary/70 text-xs" dir="ltr">
        &gt; booting datacenter_
        <span className="cursor-blink" />
      </span>
    </div>
  );
}
