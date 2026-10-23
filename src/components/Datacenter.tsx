import { lazy, Suspense, useState } from "react";
import { Link, ClientOnly } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, Mail, RotateCcw, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ContactTerminal } from "./ContactTerminal";
import { HeroTerminal } from "./HeroTerminal";
import MatrixBackdrop from "./MatrixBackdrop";
import { SceneBoundary } from "./SceneBoundary";
import { isCompactDevice } from "@/lib/device";
import { useWhenIdle } from "@/lib/idle";

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
  // Desktop only: pull the three.js chunk when the browser goes idle.
  // The old inline hook called `setTimeout(setReady, 1200)` — the state
  // setter received no value, so browsers without requestIdleCallback
  // never revealed the scene at all.
  const idleReady = useWhenIdle(!COMPACT, 1800);
  const m = models[model];

  return (
    <>
      {/* Fixed backdrop behind the whole page: real 3D corridor on desktop
          (revealed once the browser is idle), lightweight 2D matrix rain on
          phones — camera walks with scroll */}
      <div className="scene-fixed" aria-hidden>
        <ClientOnly fallback={<SceneFallback />}>
          {COMPACT ? (
            <MatrixBackdrop />
          ) : idleReady ? (
            <Suspense fallback={null}>
              <SceneBoundary fallback={<SceneFallback />}>
                <DatacenterScene
                  mode="scroll"
                  model={model}
                  onPickModel={setModel}
                  onContact={() => setOpen(true)}
                />
              </SceneBoundary>
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
          <h1 className="mt-4 font-black">
            هوش مصنوعی و اتوماسیون،
            <br />
            روی زیرساخت <span className="text-gradient">خودتان</span>
            <span className="cursor-blink" aria-hidden />
          </h1>
          <p className="mt-3 max-w-md text-base md:text-base text-muted-foreground">
            مدل‌های باز، سرورهای اختصاصی و اتوماسیون هوشمند — داده شما نزد خودتان می‌ماند و هیچ
            هزینه API ماهانه‌ای به سرویس خارجی پرداخت نمی‌شود.
          </p>
          {/* دو اقدام اصلی — روی موبایل همیشه دیده می‌شوند */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" className="h-12 glow" onClick={() => setOpen(true)}>
              <Mail />
              درخواست مشاوره
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 bg-background/60 backdrop-blur"
            >
              <Link to="/hardware">
                برآورد سخت‌افزار
                <ArrowLeft />
              </Link>
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
          <div className="flex flex-wrap gap-2" dir="ltr">
            {models.map((m2, i) => (
              <Button
                key={m2.name}
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
                {m2.name}
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

      {/* Radix Dialog: focus trap, Escape, scroll-lock + focus restore are
          handled by the primitive — the old hand-rolled version locked body
          overflow but never trapped or moved focus. */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="connection-dialog max-w-[520px] gap-0 overflow-y-auto max-h-[92svh] p-0 border-primary/30">
          <DialogTitle asChild>
            <h2 className="sr-only">ارتباط با متخصص هوش برتر</h2>
          </DialogTitle>
          <DialogDescription asChild>
            <p className="sr-only">
              فرم پیش‌نویس پیام برای درخواست مشاوره — پیام مستقیماً ارسال نمی‌شود.
            </p>
          </DialogDescription>
          <ContactTerminal
            preset={{ topic: m?.name || "زیرساخت هوش مصنوعی" }}
            onClose={() => setOpen(false)}
          />
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
