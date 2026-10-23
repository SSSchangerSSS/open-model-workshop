import { Component, useEffect, useState, type ReactNode } from "react";

type BoundaryProps = {
  /** Rendered in place of the scene when it crashes or loses its GL context. */
  fallback: ReactNode;
  children: ReactNode;
};

type BoundaryState = { failed: boolean };

/**
 * WebGL scene error boundary.
 * A crashed scene (shader compile error, renderer exception, OOM…) must
 * never take the page — or the sizing calculator — down with it. The
 * fallback is always a usable static UI.
 */
export class SceneBoundary extends Component<BoundaryProps, BoundaryState> {
  override state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  override componentDidCatch(error: unknown) {
    console.error("[scene] WebGL scene failed:", error);
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * webglcontextlost guard — flips a flag so the host page can swap the dead
 * canvas for its static fallback. `preventDefault` keeps three.js from
 * throwing while it tries to restore; if the context IS restored we flip
 * back automatically.
 */
export function useContextLost(): boolean {
  const [lost, setLost] = useState(false);
  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const onLost = (e: Event) => {
      e.preventDefault();
      setLost(true);
    };
    const onRestored = () => setLost(false);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };
  }, []);
  return lost;
}

/** Small shared fallback panel for dead/lost scenes. */
export function SceneFailedNote({ label }: { label?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center" aria-live="polite">
      <p
        className="panel-glass rounded-lg px-4 py-2 font-mono text-xs text-muted-foreground"
        dir="rtl"
      >
        {label ?? "نمای سه‌بعدی در این دستگاه در دسترس نیست — بقیهٔ صفحه کار می‌کند."}
      </p>
    </div>
  );
}
