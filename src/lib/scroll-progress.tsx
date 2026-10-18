import { useEffect } from "react";

/** Shared scroll progress (0→1) written by pages, read inside the 3D scene each frame. */
export const scrollStore = { target: 0 };

/** Mount on a page whose scene camera should walk with scroll. Renders nothing. */
export function ScrollDriver() {
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        scrollStore.target = Math.min(1, Math.max(0, window.scrollY / max));
      });
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
