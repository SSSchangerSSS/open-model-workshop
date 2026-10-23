import { useEffect, useRef, useState, type ReactNode } from "react";

/** JS-on gate for the entrance animation (never a gate for content). */
const ANIMATABLE =
  typeof window !== "undefined" &&
  "IntersectionObserver" in window &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Entrance reveal — progressive enhancement only:
 * - SSR / no-JS / reduced-motion / already-in-viewport → content is simply
 *   visible (the old version hid everything behind opacity:0 until JS ran,
 *   leaving the page blank without JavaScript).
 * - When the block is below the fold and JS can animate, `data-reveal`
 *   flips to "pending" right before the observer is attached (same tick as
 *   first paint of the attribute → no visible flash), then to ".in" on hit.
 * - Observer disconnects after first reveal and on unmount.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!ANIMATABLE) return; // stay visible, no animation

    // Already on screen at mount (e.g. above the fold, anchor jump)?
    // Skip the animation entirely instead of blink-hiding it.
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    if (r.top < vh && r.bottom > 0) return;

    setArmed(true); // enables data-reveal="pending" (hidden) + transition
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !armed) return;
    // one frame later the hidden state is painted; then observe
    let io: IntersectionObserver | undefined;
    const raf = requestAnimationFrame(() => {
      io = new IntersectionObserver(
        ([e]) => {
          if (e?.isIntersecting) {
            el.classList.add("in");
            io?.disconnect();
          }
        },
        // 1% visibility instead of 15% — very tall blocks (e.g. the 61-card
        // mobile reference grid, ~10K px) can never reach 15% of their own
        // height inside a phone viewport, which left them invisible forever.
        { threshold: 0.01, rootMargin: "0px 0px -8% 0px" },
      );
      io.observe(el);
    });
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, [armed]);

  return (
    <div
      ref={ref}
      data-reveal={armed ? "pending" : undefined}
      className={`reveal ${className}`}
      style={{ transitionDelay: armed ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}

/**
 * Count-up number — progressive enhancement:
 * - SSR/no-JS render the FINAL value (never a misleading 0).
 * - On first viewport intersection (JS + motion allowed) it animates 0→to.
 * - The rAF loop is cancelled on unmount and after finishing.
 */
export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState<number | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return; // keep the static final value

    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      io.disconnect();
      setN(0);
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 1500);
        setN(Math.round(to * (1 - (1 - p) ** 3)));
        if (p < 1) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf.current); // loop must not outlive unmount
    };
  }, [to]);

  const shown = n ?? to;
  return (
    <span ref={ref}>
      {shown.toLocaleString("fa-IR")}
      {suffix}
    </span>
  );
}
