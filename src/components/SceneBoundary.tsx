import { Component, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * WebGL scene guard (docs/ui-performance-audit.md §WebGL):
 * - ErrorBoundary: a crash inside the R3F tree (shader compile, OOM, bad
 *   driver) swaps to a usable fallback instead of blanking the whole page —
 *   the calculator/list around the scene keeps working.
 * - webglcontextlost: GPU resets (tab backgrounding on phones) are caught on
 *   the canvas and surface the same fallback with a recovery action.
 */

type BoundaryProps = {
  fallback: ReactNode;
  children: ReactNode;
};

class SceneErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch(error: unknown) {
    console.error("[SceneBoundary] WebGL scene crashed:", error);
  }
  override render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

/** Listens for GPU context loss on any canvas rendered inside. */
function useContextLost(onLost: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const handler = (e: Event) => {
      e.preventDefault(); // allow the browser to offer a restore later
      console.warn("[SceneBoundary] WebGL context lost");
      onLost();
    };
    root.addEventListener("webglcontextlost", handler);
    return () => root.removeEventListener("webglcontextlost", handler);
  }, [onLost]);
  return ref;
}

export function SceneBoundary({ fallback, children }: BoundaryProps) {
  const [lost, setLost] = useState(false);
  const ref = useContextLost(
    // stable-ish: boundary only cares that it flips the flag once
    useRef(() => setLost(true)).current,
  );
  if (lost) return <>{fallback}</>;
  return (
    <div ref={ref} className="contents">
      <SceneErrorBoundary fallback={fallback}>{children}</SceneErrorBoundary>
    </div>
  );
}
