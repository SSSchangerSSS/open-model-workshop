import { useEffect, useRef, useState } from "react";
import { scrollStore } from "@/lib/scroll-progress";
import { depth01, rackNoAt, tourZ, zoneAt } from "@/lib/tour";

/**
 * Fixed HUD that makes the scroll-walk legible:
 * - left-edge depth ruler (elevator-style marker)
 * - current sector label (fa + en) with glitch refresh
 * - live rack counter
 * Reads the shared scrollStore every frame; renders nothing meaningful at hero.
 */
export function SectorHUD() {
  const [state, setState] = useState({ p: 0, z: 12 });
  const raf = useRef(0);

  useEffect(() => {
    const loop = () => {
      const p = scrollStore.target;
      setState((s) => (Math.abs(s.p - p) > 0.0005 ? { p, z: tourZ(p) } : s));
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const visible = state.p > 0.035;
  const stop = zoneAt(state.p);
  const depth = depth01(state.z);
  const meters = Math.round(-state.z);

  return (
    <>
      {/* depth ruler — left edge */}
      <div
        aria-hidden
        className={`fixed left-3 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-center gap-2 transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
        dir="ltr"
      >
        <span className="font-mono text-[9px] text-primary/60 [writing-mode:vertical-rl]">
          DEPTH
        </span>
        <div className="relative h-44 w-px bg-primary/20 overflow-visible">
          {[0.25, 0.5, 0.75].map((f) => (
            <span
              key={f}
              className="absolute -left-1 h-px w-2 bg-primary/30"
              style={{ top: `${f * 100}%` }}
            />
          ))}
          <span
            className="absolute -left-[3px] h-[7px] w-[7px] rotate-45 bg-primary shadow-[0_0_12px_var(--primary)] transition-[top] duration-150 ease-out"
            style={{ top: `calc(${depth * 100}% - 3px)` }}
          />
        </div>
        <span className="font-mono text-[10px] text-primary tabular-nums">{meters}m</span>
      </div>

      {/* sector label — bottom-left */}
      <div
        aria-live="off"
        className={`fixed bottom-4 left-4 z-20 hidden md:block transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
      >
        <div className="panel-glass rounded px-3 py-2">
          <div className="flex items-center gap-2 font-mono text-[10px] text-primary/80" dir="ltr">
            <span className="status-dot" style={{ width: 6, height: 6 }} />
            <span className="tracking-widest">{stop.zone}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground" key={stop.zone}>
              RACK {String(rackNoAt(state.z)).padStart(2, "0")}/44
            </span>
          </div>
          <p
            key={stop.zone + "-fa"}
            className="mt-0.5 text-[13px] font-bold text-primary sector-fa"
          >
            {stop.fa}
          </p>
        </div>
      </div>

      {/* compact sector pill — mobile */}
      <div
        className={`fixed top-16 left-3 z-20 md:hidden transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <span
          className="panel-glass rounded-full px-3 py-1 font-mono text-[10px] text-primary"
          dir="ltr"
        >
          {stop.zone} · {meters}m
        </span>
      </div>
    </>
  );
}
