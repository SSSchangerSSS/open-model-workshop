import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/device";

/*
 * Site entry ("ورودی نمایشی") — a brand moment that ONLY plays when the
 * user asks for it (footer button «ورود نمایشی به دیتاسنتر»).
 *
 * It is deliberately OUT of the critical path:
 * - It is never rendered by the server and never mounted on page load —
 *   the prerendered HTML of every route contains zero intro elements, and
 *   first paint / hydration never pay for it.
 * - No JavaScript: it simply never exists; content is never covered.
 * - Reduced motion: the same scene plays WITHOUT animation (static racks,
 *   no fly-through, no pulsing) and dismisses sooner.
 * - When it finishes (or is skipped) it is UNMOUNTED, not hidden — hundreds
 *   of decorated elements must not stay alive in the DOM.
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

export function Intro({ onClose }: { onClose?: () => void }) {
  const [gone, setGone] = useState(false);

  // Only ever mounted by an explicit user action → reading the media query
  // at mount time is client-safe (no SSR, no hydration concerns).
  const reduced = prefersReducedMotion();

  useEffect(() => {
    // IMPORTANT: pass explicit values — `setTimeout(setGone, …)` would call
    // the setter with undefined and React bails out, keeping the overlay alive.
    const t1 = setTimeout(
      () => document.documentElement.classList.add("intro-finished"),
      reduced ? 900 : 3050,
    );
    const t2 = setTimeout(() => setGone(true), reduced ? 1200 : 3900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reduced]);

  const finish = () => {
    setGone(true);
    onClose?.();
  };

  if (gone) return null;

  return (
    <div id="boot-overlay" style={{ perspective: "700px" }} aria-label="ورود نمایشی به دیتاسنتر">
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
              style={{ animationDelay: reduced ? "0s" : `${0.2 + i * 0.32}s` }}
            >
              {l}
            </div>
          ))}
        </div>
        <h1 className="boot-brand mt-2 text-5xl md:text-7xl font-black text-gradient">هوش برتر</h1>
        <p
          className="boot-line mt-3 font-mono text-[11px] text-primary/70"
          dir="ltr"
          style={{ animationDelay: reduced ? "0s" : "2.1s" }}
        >
          scroll = walk · hover = inspect · type = talk
        </p>
      </div>
      <button
        onClick={finish}
        className="boot-line absolute bottom-8 left-8 rounded-lg border bg-card/70 px-4 py-2 text-sm text-muted-foreground hover:text-primary"
        style={{ animationDelay: "0.4s", pointerEvents: "auto" }}
      >
        رد کردن ←
      </button>
    </div>
  );
}
