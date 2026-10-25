import { useEffect, useState } from "react";

/**
 * Device tier detection — SSR-safe.
 * "Compact" = small viewport OR weak hardware (few cores / low memory).
 * Used to swap heavy WebGL scenes for lightweight 2D backdrops and to
 * downgrade 3D quality, so phones get a fast, smooth site.
 */
export function isCompactDevice(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // test/QA override: ?tier=full forces the 3D scenes, ?tier=lite forces 2D
    const forced = new URLSearchParams(window.location.search).get("tier");
    if (forced === "full") return false;
    if (forced === "lite") return true;
    const small = window.matchMedia("(max-width: 767px)").matches;
    const nav = navigator as Navigator & { deviceMemory?: number };
    // Only truly low-end hardware falls back to the 2D tier; 4-core laptops
    // run the 3D scenes fine. Phones are caught by the viewport check anyway.
    const weak = (navigator.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2;
    return small || weak;
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/** The viewport breakpoint that matches isCompactDevice()'s width check. */
export const COMPACT_QUERY = "(max-width: 767px)";

/**
 * Reactive, SSR-safe media-query hook.
 * Server AND first client render return `initial`, so the markup never
 * mismatches; the real value is applied right after mount and again on
 * every change (live resize without reload). Consumers whose target UI
 * only appears after user interaction (e.g. a modal opened by a click)
 * can rely on the post-mount value being correct by interaction time.
 */
export function useMediaQuery(query: string, initial = false): boolean {
  const [matches, setMatches] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/**
 * LIVE compact-viewport flag (<= 767px) — unlike isCompactDevice() this
 * keeps listening across resizes, so a bottom Sheet is mounted only on a
 * genuinely mobile viewport and a desktop panel takes over on wide ones.
 */
export function useCompactViewport(): boolean {
  return useMediaQuery(COMPACT_QUERY);
}
