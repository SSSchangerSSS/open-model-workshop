import { useEffect, useRef, useState, type ReactNode } from "react";

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setY(window.scrollY)); };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return y;
}

export function ScrollProgress() {
  const y = useScrollY();
  const [h, setH] = useState(1);
  useEffect(() => setH(Math.max(1, document.documentElement.scrollHeight - window.innerHeight)), [y]);
  return <div className="fixed top-0 inset-x-0 z-50 h-1 origin-right bg-gradient-to-l from-primary to-accent" style={{ transform: `scaleX(${y / h})` }} />;
}

/** Progress 0→1 while element travels through the viewport */
function useProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const y = useScrollY();
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    setP(Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))));
  }, [y]);
  return [ref, p] as const;
}

/** 3D tilt that flattens as you scroll (21st.dev "container scroll") */
export function ContainerScroll({ children }: { children: ReactNode }) {
  const [ref, p] = useProgress<HTMLDivElement>();
  const t = Math.min(1, p * 2.2);
  return (
    <div ref={ref} style={{ perspective: "1200px" }}>
      <div style={{ transform: `rotateX(${(1 - t) * 25}deg) scale(${0.9 + t * 0.1})`, transition: "transform .1s linear" }}>
        {children}
      </div>
    </div>
  );
}

export function Parallax({ children, speed = 0.2, className = "" }: { children: ReactNode; speed?: number; className?: string }) {
  const [ref, p] = useProgress<HTMLDivElement>();
  return <div ref={ref} className={className} style={{ transform: `translateY(${(p - 0.5) * speed * -400}px)` }}>{children}</div>;
}

/** Sticky section where steps highlight one by one while scrolling */
export function StickySteps({ steps }: { steps: string[][] }) {
  const [ref, p] = useProgress<HTMLDivElement>();
  const active = Math.min(steps.length - 1, Math.floor(Math.max(0, p - 0.2) / 0.6 * steps.length));
  return (
    <div ref={ref} className="relative" style={{ height: `${steps.length * 60 + 40}vh` }}>
      <div className="sticky top-0 h-screen flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-black">مسیر همکاری</h2>
            <p className="mt-4 text-muted-foreground">اسکرول کنید تا مراحل را ببینید.</p>
            <div className="mt-8 h-1 rounded bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((active + 1) / steps.length) * 100}%` }} />
            </div>
          </div>
          <div className="space-y-4">
            {steps.map(([n, t, d], i) => (
              <div key={n} className={`rounded-2xl border p-6 transition-all duration-500 ${i === active ? "bg-card border-primary glow scale-105" : "opacity-40 scale-95"}`}>
                <div className="font-mono text-2xl text-primary">{n}</div>
                <h3 className="mt-2 font-bold text-lg">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
