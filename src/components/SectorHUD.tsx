import { useEffect, useRef, useState } from "react";
import { scrollStore } from "@/lib/scroll-progress";
import { depth01, rackNoAt, tourZ, zoneAt } from "@/lib/tour";
import { subscribeScrollMetrics } from "@/lib/scroll-metrics";

/**
 * Fixed HUD that makes the scroll-walk legible:
 * - left-edge depth ruler (elevator-style marker)
 * - current sector label (fa + en) with glitch refresh
 * - live rack counter
 * Reads the shared scrollStore — updates are driven by the ONE shared
 * scroll listener (no dedicated always-on rAF loop); React state changes
 * only when the depth actually moves.
 */
export function SectorHUD() {
  const [state, setState] = useState({ p: 0, z: 12 });
  const dotRef = useRef<HTMLSpanElement>(null);
  const meterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let lastP = -1;
    // rAF-driven element updates for the ruler dot + meters (no re-render),
    // React state only for the sector label text when it changes.
    return subscribeScrollMetrics(({ progress }) => {
      scrollStore.target = progress;
      const moved = Math.abs(progress - lastP) > 0.0005;
      if (!moved) return;
      lastP = progress;
      const z = tourZ(progress);
      if (dotRef.current) {
        dotRef.current.style.top = `calc(${depth01(z) * 100}% - 3px)`;
      }
      if (meterRef.current) {
        meterRef.current.textContent = `${Math.round(-z)}m`;
      }
      setState((s) => (Math.abs(s.p - progress) > 0.004 ? { p: progress, z } : s));
    });
  }, []);

  const visible = state.p > 0.035;
  const stop = zoneAt(state.p);

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
            ref={dotRef}
            className="absolute -left-[3px] h-[7px] w-[7px] rotate-45 bg-primary shadow-[0_0_12px_var(--primary)] transition-[top] duration-150 ease-out"
            style={{ top: "calc(0% - 3px)" }}
          />
        </div>
        <span ref={meterRef} className="font-mono text-[10px] text-primary tabular-nums">
          12m
        </span>
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
          {stop.zone} · {Math.round(-state.z)}m
        </span>
      </div>
    </>
  );
}
