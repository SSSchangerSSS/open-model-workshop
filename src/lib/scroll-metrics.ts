/**
 * ONE shared scroll/resize metrics source for the whole app.
 *
 * Replaces the previous pattern where ScrollProgress, Parallax,
 * ContainerScroll and StickySteps EACH registered their own scroll
 * listener and called setState on every frame.
 *
 * - window.scrollY is read inside a single rAF-throttled scroll handler.
 * - Page height (scrollHeight - innerHeight) is measured on resize and on
 *   real content growth via a body ResizeObserver — NOT on every scroll.
 * - Subscribers get synchronously-called callbacks (no React state needed);
 *   scroll-driven elements should mutate styles/refs, not re-render.
 * - The rAF handle, listeners and observer are fully cleaned up when the
 *   last subscriber leaves (module stays hot only while in use).
 */

export type ScrollMetrics = {
  y: number;
  max: number; // scrollable height (>= 1)
  progress: number; // y / max clamped to 0..1
};

type Listener = (m: ScrollMetrics) => void;

const listeners = new Set<Listener>();

const state: ScrollMetrics = { y: 0, max: 1, progress: 0 };

let raf = 0;
let attached = false;
let ro: ResizeObserver | null = null;

function computeMax(): number {
  return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
}

function measure() {
  state.max = computeMax();
  emit();
}

function emit() {
  state.y = window.scrollY;
  state.progress = Math.min(1, Math.max(0, state.y / state.max));
  for (const l of listeners) l(state);
}

function onScroll() {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    emit();
  });
}

function attach() {
  if (attached || typeof window === "undefined") return;
  attached = true;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measure);
  // content growth (accordions, images, route swap) also changes the height
  if (typeof ResizeObserver !== "undefined") {
    ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    ro.observe(document.body);
  }
  measure();
}

function detach() {
  if (!attached) return;
  attached = false;
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", measure);
  ro?.disconnect();
  ro = null;
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

export function subscribeScrollMetrics(fn: Listener): () => void {
  listeners.add(fn);
  attach();
  fn(state); // immediate sync with the current position
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0) detach();
  };
}

export function getScrollMetrics(): ScrollMetrics {
  return state;
}
