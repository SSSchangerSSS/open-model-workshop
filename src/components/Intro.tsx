import { useEffect, useState } from "react";

/*
 * Site entry ("ورودی سایت") — desktop-only brand moment, OUT of the mobile
 * critical path (docs/ui-performance-audit.md §Intro):
 *
 * - SSR/SSG renders the overlay markup, but CSS keeps it display:none by
 *   default. A tiny inline <head> script (__root.tsx) adds `intro-armed`
 *   BEFORE first paint only when the intro may play: JS on, first visit,
 *   desktop-width, motion allowed. Without JavaScript nothing is ever
 *   armed, so the overlay can never cover the content.
 * - Repeat visits: the same script adds `intro-done` pre-paint — no flash.
 * - Mobile + reduced-motion: never armed → the page loads directly.
 * - The `gone` unmount (real DOM removal, not just hiding) is driven by
 *   setTimeout(() => setGone(true), …) — the old code passed the bare
 *   setter so the timer argument leaked into setState and the overlay
 *   node stayed in the DOM forever.
 */

const RACKS = 10;

const BOOT_LOG = [
  "> booting hoosh-bartar bios v3.14_",
  "> mounting /dev/rack01..rack44 ......... [OK]",
  "> starting vllm serve Qwen2.5-32B ...... [OK]",
  "> connecting n8n workflows ............. [OK]",
  "> waking flowise agents ................ [OK]",
  "> welcome to the datacenter.",
] as const;

function Rack({ side, i }: { side: "l" | "r"; i: number }) {
  const z = -i * 220;
  const x = side === "l" ? -260 : 260;
  return (
    <div
      className="absolute left-1/2 top-1/2 h-[340px] w-[200px] -ml-[100px] -mt-[170px] rounded-sm border border-primary/30 bg-card"
      style={{ transform: `translate3d(${x}px,0,${z}px) rotateY(${side === "l" ? 90 : -90}deg)` }}
    >
      {Array.from({ length: 14 }).map((_, k) => (
        <div
          key={k}
          className="mx-2 mt-1.5 flex h-4 items-center gap-1 rounded-[2px] bg-muted px-1"
        >
          {Array.from({ length: 6 }).map((_, j) => (
            <span
              key={j}
              className="h-1 w-1 rounded-full bg-primary animate-pulse"
              style={{
                animationDelay: `${((i * 7 + k * 3 + j) % 10) * 0.15}s`,
                opacity: (k + j + i) % 3 ? 1 : 0.2,
              }}
            />
          ))}
          <span className="ms-auto h-1 w-6 rounded bg-accent/60" />
        </div>
      ))}
    </div>
  );
}

export function Intro() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // The pre-paint head script arms/hides the overlay; when it already
    // added `intro-done` (repeat visit) the CSS keeps it display:none.
    if (!document.documentElement.classList.contains("intro-armed")) return;
    try {
      sessionStorage.setItem("intro", "1");
    } catch {
      /* private mode */
    }
    const t1 = setTimeout(() => document.documentElement.classList.add("intro-done"), 3050);
    const t2 = setTimeout(() => setGone(true), 3900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const skip = () => {
    try {
      sessionStorage.setItem("intro", "1");
    } catch {
      /* noop */
    }
    document.documentElement.classList.add("intro-done");
    setGone(true);
  };

  if (gone) return null;

  return (
    <div id="boot-overlay" style={{ perspective: "700px" }}>
      <div className="absolute inset-0 intro-fly" style={{ transformStyle: "preserve-3d" }}>
        {/* floor */}
        <div
          className="absolute left-1/2 top-1/2 h-[2400px] w-[520px] -ml-[260px] intro-floor"
          style={{ transform: "translate3d(0,170px,-1100px) rotateX(90deg)" }}
        />
        {/* ceiling lights */}
        {Array.from({ length: RACKS }).map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 h-2 w-[300px] -ml-[150px] bg-primary/70 blur-[2px]"
            style={{ transform: `translate3d(0,-200px,${-i * 220}px) rotateX(90deg)` }}
          />
        ))}
        {Array.from({ length: RACKS }).map((_, i) => (
          <Rack key={"l" + i} side="l" i={i} />
        ))}
        {Array.from({ length: RACKS }).map((_, i) => (
          <Rack key={"r" + i} side="r" i={i} />
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div
          className="font-mono text-xs text-primary/90 text-left w-[320px] max-w-[80vw] h-[130px] overflow-hidden"
          dir="ltr"
        >
          {BOOT_LOG.map((l, i) => (
            <div
              key={i}
              className={`boot-line ${i === BOOT_LOG.length - 1 ? "mt-2 text-primary" : ""}`}
              style={{ animationDelay: `${0.2 + i * 0.32}s` }}
            >
              {l}
            </div>
          ))}
        </div>
        <h1 className="boot-brand mt-2 text-5xl md:text-7xl font-black text-gradient">هوش برتر</h1>
        <p
          className="boot-line mt-3 font-mono text-[11px] text-primary/70"
          dir="ltr"
          style={{ animationDelay: "2.1s" }}
        >
          scroll = walk · hover = inspect · type = talk
        </p>
      </div>
      <button
        type="button"
        onClick={skip}
        className="boot-line absolute bottom-8 left-8 rounded-lg border bg-card/70 px-4 py-2 text-sm text-muted-foreground hover:text-primary"
        style={{ animationDelay: "1.2s", pointerEvents: "auto" }}
      >
        رد کردن ←
      </button>
    </div>
  );
}
