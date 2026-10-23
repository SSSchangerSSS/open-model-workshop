import { useEffect, useRef, useState, type ReactNode } from "react";
import { subscribeScrollMetrics } from "@/lib/scroll-metrics";
import { prefersReducedMotion } from "@/lib/device";

/**
 * Scroll-driven UI, rebuilt on the shared metrics module:
 * - ScrollProgress mutates a transform on a REF (no setState per frame).
 * - useProgress shares ONE listener; React state updates only when the
 *   value actually moves (rounded), not on every scroll event.
 * - StickySteps degrades to a plain stacked list on phones — no more
 *   ~280vh scroll-jacked section under 768px.
 */

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return subscribeScrollMetrics(({ progress }) => {
      el.style.transform = `scaleX(${progress})`;
    });
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed top-0 inset-x-0 z-50 h-1 origin-right bg-gradient-to-l from-primary to-accent"
      style={{ transform: "scaleX(0)" }}
    />
  );
}

/** Progress 0→1 while element travels through the viewport (shared listener). */
function useTravelProgress<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const h = 0;
    const compute = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      return Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    };
    let last = -1;
    return subscribeScrollMetrics(() => {
      // re-measure the element rect only while it is plausibly on screen
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      const v = compute();
      if (Math.abs(v - last) > 0.002) {
        last = v;
        setP(v);
      }
    });
  }, []);
  return [ref, p];
}

/** 3D tilt that flattens as you scroll — desktop pointer only. */
export function ContainerScroll({ children }: { children: ReactNode }) {
  const [ref, p] = useTravelProgress<HTMLDivElement>();
  const t = Math.min(1, p * 2.2);
  const reduced = prefersReducedMotion();
  return (
    <div ref={ref} style={{ perspective: "1200px" }}>
      <div
        style={
          reduced
            ? undefined
            : {
                transform: `rotateX(${(1 - t) * 25}deg) scale(${0.9 + t * 0.1})`,
                transition: "transform .1s linear",
              }
        }
      >
        {children}
      </div>
    </div>
  );
}

export function Parallax({
  children,
  speed = 0.2,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const [ref, p] = useTravelProgress<HTMLDivElement>();
  const reduced = prefersReducedMotion();
  return (
    <div
      ref={ref}
      className={className}
      style={reduced ? undefined : { transform: `translateY(${(p - 0.5) * speed * -400}px)` }}
    >
      {children}
    </div>
  );
}

/** Sticky section where steps highlight one by one while scrolling —
 *  DESKTOP only. On phones the same content renders as a normal list with
 *  natural height: no h-screen, no multi-hundred-vh scroll hijack. */
export function StickySteps({ steps }: { steps: string[][] }) {
  const [ref, p] = useTravelProgress<HTMLDivElement>();
  const active = Math.min(
    steps.length - 1,
    Math.floor((Math.max(0, p - 0.2) / 0.6) * steps.length),
  );
  return (
    <>
      {/* mobile: plain sequential cards */}
      <div className="md:hidden max-w-6xl mx-auto px-5 py-14">
        <h2 className="text-3xl font-black">مسیر همکاری</h2>
        <p className="mt-3 text-muted-foreground">چهار قدم تا تحویل — از کشف نیاز تا پشتیبانی.</p>
        <div className="mt-8 space-y-3">
          {steps.map(([n, t, d], i) => (
            <div key={n} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl text-primary" dir="ltr">
                  {n}
                </span>
                <h3 className="font-bold text-lg">{t}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
              {/* static progress hint per card */}
              <div className="mt-3 flex gap-1" aria-hidden>
                {steps.map((_, k) => (
                  <span
                    key={k}
                    className={`h-1 flex-1 rounded-full ${k <= i ? "bg-primary" : "bg-muted"}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* desktop: sticky scroll story */}
      <div
        ref={ref}
        className="relative hidden md:block"
        style={{ height: `${steps.length * 60 + 40}vh` }}
      >
        <div className="sticky top-0 h-screen flex items-center">
          <div className="max-w-6xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-black">مسیر همکاری</h2>
              <p className="mt-4 text-muted-foreground">اسکرول کنید تا مراحل را ببینید.</p>
              <div className="mt-8 h-1 rounded bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${((active + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="space-y-4">
              {steps.map(([n, t, d], i) => (
                <div
                  key={n}
                  className={`rounded-2xl border p-6 transition-all duration-500 ${i === active ? "bg-card border-primary glow scale-105" : "opacity-40 scale-95"}`}
                >
                  <div className="font-mono text-2xl text-primary">{n}</div>
                  <h3 className="mt-2 font-bold text-lg">{t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
