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

/** Reactive prefers-reduced-motion (SSR-safe; live across preference changes). */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

type NetworkWithSaveData = {
  saveData?: boolean;
  addEventListener?: (type: string, cb: () => void) => void;
  removeEventListener?: (type: string, cb: () => void) => void;
};

function readSaveData(): boolean {
  if (typeof navigator === "undefined") return false;
  try {
    return Boolean((navigator as { connection?: NetworkWithSaveData }).connection?.saveData);
  } catch {
    return false;
  }
}

/**
 * The SHARED, reactive device policy (T4).
 *
 * Combines — in one SSR-stable place — the three inputs every scene/backdrop
 * decision should consult:
 *  - compact: small viewport OR weak hardware OR the ?tier=lite|full QA
 *    override (same rule as isCompactDevice(), but LIVE: crossing the 767px
 *    breakpoint or changing the override applies without a reload)
 *  - reducedMotion: prefers-reduced-motion, listened to
 *  - saveData: navigator.connection?.saveData where the API exists; its
 *    absence is handled (no crash, plain false) — it is a hint, not proof
 *
 * Server AND first client render always return the same conservative
 * default (compact=false, reducedMotion=false, saveData=false); real values
 * land right after mount, so no hydration mismatch is possible. Consumers
 * whose heavy children only mount after mount (scenes are ClientOnly or
 * lazily revealed) can act on the post-mount value safely.
 */
export type DevicePolicy = {
  compact: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  /** Anything that should downgrade visuals/bytes: compact tier or saveData. */
  lite: boolean;
};

export function useDevicePolicy(): DevicePolicy {
  const compactViewport = useMediaQuery(COMPACT_QUERY);
  const reducedMotion = usePrefersReducedMotion();
  const [saveData, setSaveData] = useState(false);
  const [weakHardware, setWeakHardware] = useState(false);
  const [tierOverride, setTierOverride] = useState<"lite" | "full" | null>(null);

  useEffect(() => {
    // hardware signals are read once per mount (they do not change at runtime)
    const nav = navigator as Navigator & { deviceMemory?: number };
    try {
      setWeakHardware((navigator.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2);
    } catch {
      setWeakHardware(false);
    }

    const conn = (navigator as { connection?: NetworkWithSaveData }).connection;
    setSaveData(readSaveData());
    if (conn?.addEventListener && conn.removeEventListener) {
      const onChange = () => setSaveData(readSaveData());
      conn.addEventListener("change", onChange);
      return () => conn.removeEventListener!("change", onChange);
    }
    return;
  }, []);

  useEffect(() => {
    // QA ?tier override — applied after mount (SSR-stable) and re-read on
    // history navigations so QA toggles do not need a full reload
    const sync = () => setTierOverride(forcedTierOverride());
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const compact =
    tierOverride === "lite"
      ? true
      : tierOverride === "full"
        ? false
        : compactViewport || weakHardware;

  return { compact, reducedMotion, saveData, lite: compact || saveData };
}

/** QA override ?tier=lite|full — null when absent. */
export function forcedTierOverride(): "lite" | "full" | null {
  if (typeof window === "undefined") return null;
  try {
    const t = new URLSearchParams(window.location.search).get("tier");
    if (t === "lite" || t === "full") return t;
  } catch {
    /* ignore */
  }
  return null;
}
