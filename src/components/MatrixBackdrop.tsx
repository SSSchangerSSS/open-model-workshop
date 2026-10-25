import { useEffect, useRef } from "react";
import { prefersReducedMotion, wantsSaveData } from "@/lib/device";

const GLYPHS =
  "0۱۲۳۴۵۶۷۸۹アイウエオカキクケコサシスセソタチツテトナニヌネノهاهمژهژچگآیوبپثجخدذرزسشصضطظعغفقکلمنوهی";

/**
 * Lightweight 2D Matrix-rain backdrop.
 * ~2KB of JS, one canvas, capped FPS, pauses when the tab is hidden —
 * used instead of the 3D corridor on phones and low-power devices.
 */
export default function MatrixBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    // Save-Data clients get the same still frame — zero animation loop
    const saveData = wantsSaveData();
    const staticMode = reduced || saveData;

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
    resize();

    const drawStatic = () => {
      // repaint the still frame from scratch (also used after resize)
      ctx.fillStyle = "#020603";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < cols; i++) for (let k = 0; k < 22; k++) drawCol(i);
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (staticMode) drawStatic(); // a resized still frame must not go blank
    });
    ro.observe(canvas);

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

    // ~26fps — plenty for rain, cheap on battery
    const STEP = 1000 / 26;
    let raf = 0;
    let last = performance.now();
    let hidden = document.hidden;

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (hidden || t - last < STEP) return;
      last = t;
      fade();
      for (let i = 0; i < cols; i++) drawCol(i);
    };

    const vis = () => {
      hidden = document.hidden;
    };

    if (staticMode) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(tick);
      document.addEventListener("visibilitychange", vis);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ background: "radial-gradient(120% 90% at 50% 0%, #07130a 0%, #020603 70%)" }}
    />
  );
}
