import { useEffect, useState } from "react";

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/**
 * SSR-safe «wait until the browser is idle» gate.
 *
 * - Uses requestIdleCallback when available (with a hard timeout so a busy
 *   main thread can never stall the reveal forever) and falls back to a
 *   plain setTimeout otherwise — the callback ALWAYS receives an explicit
 *   value, never an undefined argument.
 * - Both the idle handle and the timer are cleaned up on unmount.
 * - Test/QA override: `?idle=0` forces the fallback timer path even when
 *   requestIdleCallback exists (lets CI exercise the fallback branch).
 */
export function useIdleReveal(timeoutFallbackMs = 1200, idleTimeout = 2500): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fire = () => setReady(true);
    const w = window as IdleWindow;
    let idleHandle: number | undefined;
    let timer: number | undefined;

    const hasRIC = typeof w.requestIdleCallback === "function";
    const forceFallback = new URLSearchParams(window.location.search).get("idle") === "0";

    if (hasRIC && !forceFallback) {
      idleHandle = w.requestIdleCallback!(fire, { timeout: idleTimeout });
    } else {
      timer = window.setTimeout(fire, timeoutFallbackMs);
    }

    return () => {
      if (idleHandle !== undefined && typeof w.cancelIdleCallback === "function") {
        w.cancelIdleCallback(idleHandle);
      }
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [timeoutFallbackMs, idleTimeout]);

  return ready;
}
