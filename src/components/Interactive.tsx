import { useEffect, useRef, useState, type ReactNode } from "react";

/** Pointer-fine + motion-ok gate — tilt/magnetic/glow are DESKTOP POINTER
 *  enhancements and must never run (or listen) on touch devices or when the
 *  user asked for reduced motion. False during SSR + first client render,
 *  so hydration stays consistent; the effect only flips it after mount. */
function useFinePointer(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    try {
      setOk(
        window.matchMedia("(pointer: fine)").matches &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

/** Glow that follows the cursor across the whole page — desktop pointer only. */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useFinePointer();
  useEffect(() => {
    if (!enabled) return; // no listener at all on touch / reduced-motion
    const on = (e: MouseEvent) => {
      if (ref.current)
        ref.current.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
    };
    window.addEventListener("mousemove", on, { passive: true });
    return () => window.removeEventListener("mousemove", on);
  }, [enabled]);
  if (!enabled) return null;
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl transition-transform duration-300 ease-out"
    />
  );
}

/** 3D tilt toward the cursor — desktop pointer only. */
export function Tilt({
  children,
  max = 10,
  className = "",
}: {
  children: ReactNode;
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useFinePointer();
  const move = (e: React.MouseEvent) => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5,
      y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg) scale(1.02)`;
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

/** Button that is pulled toward the cursor — desktop pointer only. */
export function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const enabled = useFinePointer();
  return (
    <span
      ref={ref}
      className="inline-block transition-transform duration-200"
      onMouseMove={(e) => {
        if (!enabled) return;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      }}
      onMouseLeave={() => {
        const el = ref.current;
        if (el) el.style.transform = "";
      }}
    >
      {children}
    </span>
  );
}
