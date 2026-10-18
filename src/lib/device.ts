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
