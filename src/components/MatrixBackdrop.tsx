import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/device";

const GLYPHS =
  "0۱۲۳۴۵۶۷۸۹アイウエオカキクケコサシスセソタチツテトナニヌネノهاهمژهژچگآیوبپثجخدذرزسشصضطظعغفقکلمنوهی";

/**
 * Lightweight 2D Matrix-rain backdrop.
 * ~2KB of JS, one canvas, capped FPS — used instead of the 3D corridor on
 * phones and low-power devices (T4):
 *  - `still` (Save-Data / reduced-motion): ONE static pattern is painted —
 *    no animation loop at all — and it is REPAINTED on resize (a resized
 *    canvas clears itself, so the old code left a blank backdrop).
 *  - animated mode: rAF is CANCELLED while the tab is hidden and resumed
 *    (delta reset) when it comes back — no hidden-tab work, no timer left
 *    running after unmount.
 *  - reduced-motion preference is re-read on change (live), so toggling it
 *    switches between static and animated without a reload.
 */
export default function MatrixBackdrop({ still = false }: { still?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let cols = 0;
    let drops: number[] = [];
    let speeds: number[] = [];
    const fs = 15;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / (fs + 4));
      drops = Array.from({ length: cols }, () => Math.random() * -h);
      speeds = Array.from({ length: cols }, () => 0.55 + Math.random() * 0.9);
      ctx.font = `${fs}px "Vazir Matrix", monospace`;
    };

    const fade = () => {
      ctx.fillStyle = "rgba(2, 6, 3, 0.16)";
      ctx.fillRect(0, 0, w, h);
    };

    const drawCol = (i: number) => {
      const x = i * (fs + 4) + 2;
      const y = drops[i] ?? -10;
      const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0] ?? "1";
      ctx.fillStyle = Math.random() < 0.04 ? "#e7fff2" : "#37e07f";
      ctx.fillText(ch, x, y);
      if (Math.random() < 0.02) {
        ctx.fillStyle = "#9fffc8";
        ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0] ?? "0", x, y - fs);
      }
      drops[i] = y > h + Math.random() * 220 ? -20 : y + speeds[i]! * (fs + 3);
    };

    /** one static frame — the Save-Data / reduced-motion backdrop */
    const paintStatic = () => {
      resize();
      ctx.fillStyle = "#020603";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < cols; i++) for (let k = 0; k < 22; k++) drawCol(i);
    };

    // ~26fps — plenty for rain, cheap on battery
    const STEP = 1000 / 26;
    let raf = 0;
    let last = performance.now();
    let running = false;

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < STEP) return;
      last = t;
      fade();
      for (let i = 0; i < cols; i++) drawCol(i);
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      last = performance.now(); // delta reset — no burst after resume
      raf = requestAnimationFrame(tick);
    };
    const stopLoop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = still || prefersReducedMotion();

    const ro = new ResizeObserver(() => {
      // a resized canvas is cleared — repaint the right mode
      if (reduced) paintStatic();
      // animated mode keeps its loop; drop columns re-seed in resize()
    });
    ro.observe(canvas);

    const vis = () => {
      if (document.hidden) stopLoop();
      else if (!reduced) startLoop();
    };

    const applyMode = () => {
      if (reduced) {
        stopLoop();
        paintStatic();
      } else {
        startLoop();
      }
    };

    const onReducedChange = () => {
      reduced = still || reducedMq.matches;
      applyMode();
    };
    reducedMq.addEventListener("change", onReducedChange);

    if (document.hidden) {
      // tab already hidden: paint one frame, defer the loop to visibility
      paintStatic();
      running = false;
    }
    applyMode();
    document.addEventListener("visibilitychange", vis);

    return () => {
      stopLoop();
      ro.disconnect();
      reducedMq.removeEventListener("change", onReducedChange);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [still]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ background: "radial-gradient(120% 90% at 50% 0%, #07130a 0%, #020603 70%)" }}
    />
  );
}
