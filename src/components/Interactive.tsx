import { useEffect, useRef, type ReactNode } from "react";

/** Glow that follows the cursor across the whole page */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const on = (e: MouseEvent) => {
      if (ref.current)
        ref.current.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
    };
    window.addEventListener("mousemove", on);
    return () => window.removeEventListener("mousemove", on);
  }, []);
  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 z-0 h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl transition-transform duration-300 ease-out"
    />
  );
}

/** 3D tilt toward the cursor */
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
  const move = (e: React.MouseEvent) => {
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

/** Button that is pulled toward the cursor */
export function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <span
      ref={ref}
      className="inline-block transition-transform duration-200"
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      }}
      onMouseLeave={() => {
        ref.current!.style.transform = "";
      }}
    >
      {children}
    </span>
  );
}
