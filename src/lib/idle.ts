import { useEffect, useState } from "react";

/**
 * SSR-safe "browser is idle" gate used to defer heavy lazy chunks
 * (three.js scenes) off the critical path.
 *
 * Contract (see docs/ui-performance-audit.md):
 * - onReady is always called with an explicit value — the old
 *   `setTimeout(setReady, …)` pattern passed the timer's argument into the
 *   state setter, which left the flag falsy forever on browsers without
 *   requestIdleCallback.
 * - BOTH the idle handle and the timeout handle are cancelled on unmount,
 *   so a pending reveal can never fire after the component is gone.
 * - `enabled` lets callers opt out (e.g. compact tier keeps its own
 *   explicit 3D activation button instead of auto-download).
 */
export function useWhenIdle(enabled: boolean, timeoutMs = 1800): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    let idle: number | undefined;
    let t: number | undefined;
    const fire = () => setReady(true);
    if (typeof w.requestIdleCallback === "function") {
      idle = w.requestIdleCallback(fire, { timeout: Math.max(timeoutMs, 1200) });
    } else {
      t = window.setTimeout(fire, timeoutMs);
    }
    return () => {
      if (idle !== undefined && typeof w.cancelIdleCallback === "function") {
        w.cancelIdleCallback(idle);
      }
      if (t !== undefined) clearTimeout(t);
    };
  }, [enabled, timeoutMs]);
  return ready;
}
