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

/** Save-Data preference, when the browser exposes it (absence = false). */
export function wantsSaveData(): boolean {
  if (typeof navigator === "undefined") return false;
  try {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    return conn?.saveData === true;
  } catch {
    return false;
  }
}

/**
 * Reactive phone-viewport flag — SSR-safe and hydration-safe.
 * Server AND the first client render both report `false` (identical markup);
 * the real matchMedia value is synced in an effect and kept live on resize,
 * so components may conditionally mount/unmount (e.g. the mobile Sheet)
 * without ever producing a hydration mismatch.
 */
export function usePhoneViewport(): boolean {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return; // jsdom / exotic embeds
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return phone;
}

/**
 * Reactive a11y/data policy — reduced-motion and Save-Data, listened to live.
 * Same SSR contract as usePhoneViewport: `false` until an effect can know.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}
