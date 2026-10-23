import { useEffect, useRef, useState, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/device";

/**
 * Scroll-in reveal — progressive enhancement ONLY.
 * The prerendered/SSR HTML never hides content: the `reveal` class only
 * applies its opacity/transform when the <html> element carries `js`
 * (added by an inline head script before first paint). Without JavaScript
 * every Reveal block is fully visible.
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
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // IntersectionObserver missing (very old browsers / exotic embeds): show content.
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => e?.isIntersecting && (el.classList.add("in"), io.disconnect()),
      // 1% visibility instead of 15% — very tall blocks (e.g. the 61-card
      // mobile reference grid, ~10K px) can never reach 15% of their own
      // height inside a phone viewport, which left them invisible forever.
      { threshold: 0.01, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/**
 * Count-up number — honest without JavaScript.
 * The FINAL value is what renders into the prerendered HTML (and what stays
 * on screen before the block scrolls into view); the 0→to animation is an
 * optional enhancement that only runs when JS is live, the element enters
 * the viewport, and the user has not asked for reduced motion. The rAF loop
 * is always cancelled on unmount.
 */
export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState(to); // SSR/first paint: the real value, not 0
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return; // keep the final value, no animation
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting || raf) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 1500);
        setN(Math.round(to * (1 - (1 - p) ** 3)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf); // no orphan loop after unmount
    };
  }, [to]);
  return (
    <span ref={ref}>
      {n.toLocaleString("fa-IR")}
      {suffix}
    </span>
  );
}
