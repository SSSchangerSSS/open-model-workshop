import { useEffect, useRef, type ReactNode } from "react";

/**
 * Shared scroll plumbing (docs/ui-performance-audit.md §ScrollFX):
 * - ONE passive scroll listener per subscriber, rAF-throttled.
 * - Decorative transforms are written straight to element styles via refs —
 *   NO setState per frame, so scrolling never re-renders the React tree.
 * - Document height is re-measured on mount/resize/content-resize, not on
 *   every scroll event (the old ScrollProgress read scrollHeight per frame).
 */

type Subscriber = () => void;
const subs = new Set<Subscriber>();
let ticking = false;

function notify() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    subs.forEach((fn) => fn());
  });
}

function subscribe(fn: Subscriber) {
  if (subs.size === 0) {
    window.addEventListener("scroll", notify, { passive: true });
    window.addEventListener("resize", notify);
  }
  subs.add(fn);
  return () => {
    subs.delete(fn);
    if (subs.size === 0) {
      window.removeEventListener("scroll", notify);
      window.removeEventListener("resize", notify);
    }
  };
}

const scrollProgress = () => {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(1, Math.max(0, window.scrollY / max));
};

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Top progress bar — transform-only, zero React re-renders. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reducedMotion()) return; // decorative: stay static without motion
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      el.style.transform = `scaleX(${scrollProgress()})`;
    };
    apply();
    const ro = new ResizeObserver(apply); // height changes with content, not scroll
    ro.observe(document.documentElement);
    const unsub = subscribe(apply);
    return () => {
      unsub();
      ro.disconnect();
    };
  }, []);
  return (
    <div
      ref={ref}
      className="fixed top-0 inset-x-0 z-50 h-1 origin-right bg-gradient-to-l from-primary to-accent"
      style={{ transform: "scaleX(0)" }}
      aria-hidden
    />
  );
}

/**
 * Progress 0→1 while the element travels through the viewport, written to a
 * callback without re-rendering. Callers set transforms directly on nodes.
 */
function useViewportProgress(onChange: (p: number) => void, enabled = true) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onChange);
  cb.current = onChange;
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let height = 1;
    let vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const measure = () => {
      vh = window.innerHeight;
      height = el.offsetHeight || 1;
    };
    const update = () => {
      const r = el.getBoundingClientRect();
      cb.current(Math.min(1, Math.max(0, (vh - r.top) / (vh + height))));
    };
    const onScroll = () => update();
    measure();
    update();
    const ro = new ResizeObserver(() => {
      measure();
      update();
    });
    ro.observe(el);
    const unsub = subscribe(onScroll);
    return () => {
      unsub();
      ro.disconnect();
    };
  }, [enabled]);
  return ref;
}

/** 3D tilt that flattens as you scroll (21st.dev "container scroll") */
export function ContainerScroll({ children }: { children: ReactNode }) {
  const inner = useRef<HTMLDivElement>(null);
  const enabled = !reducedMotion();
  const ref = useViewportProgress((p) => {
    if (!inner.current) return;
    const t = Math.min(1, p * 2.2);
    inner.current.style.transform = `rotateX(${(1 - t) * 25}deg) scale(${0.9 + t * 0.1})`;
  }, enabled);
  return (
    <div ref={ref} style={{ perspective: "1200px" }}>
      <div
        ref={inner}
        style={
          enabled
            ? { transform: "rotateX(25deg) scale(0.9)", transition: "transform .1s linear" }
            : undefined
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
  const inner = useRef<HTMLDivElement>(null);
  const enabled = !reducedMotion();
  const ref = useViewportProgress((p) => {
    if (!inner.current) return;
    inner.current.style.transform = `translate3d(0, ${(p - 0.5) * speed * -400}px, 0)`;
  }, enabled);
  return (
    <div ref={ref} className={className}>
      <div ref={inner} style={{ height: "100%" }}>
        {children}
      </div>
    </div>
  );
}

/**
 * «مسیر همکاری» — sticky scroll-story on desktop; on mobile (and reduced
 * motion) it degrades to plain stacked steps with natural height instead of
 * a multi-hundred-vh section with h-screen.
 */
export function StickySteps({ steps }: { steps: string[][] }) {
  const activeRef = useRef<HTMLDivElement[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const enabled = !reducedMotion();

  const ref = useViewportProgress((p) => {
    const active = Math.min(
      steps.length - 1,
      Math.floor((Math.max(0, p - 0.2) / 0.6) * steps.length),
    );
    activeRef.current.forEach((el, i) => {
      if (!el) return;
      el.dataset["active"] = i === active ? "true" : "false";
    });
    if (barRef.current) barRef.current.style.width = `${((active + 1) / steps.length) * 100}%`;
  }, enabled);

  return (
    <div ref={ref} className="relative py-14 md:py-24" data-steps={steps.length}>
      <div className="max-w-6xl mx-auto px-5 md:px-6 w-full grid md:grid-cols-2 gap-10 md:gap-12 items-center">
        <div>
          <h2 className="text-3xl md:text-5xl font-black">مسیر همکاری</h2>
          <p className="mt-4 text-muted-foreground">
            چهار مرحله شفاف، از نخستین گفتگو تا پشتیبانی بعد از تحویل.
          </p>
          <div className="mt-8 h-1 rounded bg-muted overflow-hidden" aria-hidden>
            <div
              ref={barRef}
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(1 / steps.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="space-y-4">
          {steps.map(([n, t, d], i) => (
            <div
              key={n}
              ref={(el) => {
                if (el) activeRef.current[i] = el;
              }}
              data-active={i === 0 ? "true" : "false"}
              className="rounded-2xl border p-5 md:p-6 transition-all duration-300 data-[active=true]:bg-card data-[active=true]:border-primary data-[active=true]:glow data-[active=false]:opacity-40"
            >
              <div className="font-mono text-2xl text-primary" dir="ltr">
                {n}
              </div>
              <h3 className="mt-2 font-bold text-lg">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
