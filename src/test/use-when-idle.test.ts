import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWhenIdle } from "@/lib/idle";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("useWhenIdle — explicit callback + full cleanup", () => {
  beforeEach(() => {
    // jsdom has no requestIdleCallback → exercises the setTimeout fallback
    vi.useFakeTimers();
  });

  it("calls setReady(true) explicitly via the timeout fallback (old bug: bare setter never fired)", async () => {
    const { result } = renderHook(() => useWhenIdle(true, 1200));
    expect(result.current).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1199);
    });
    expect(result.current).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(true);
  });

  it("cancels the pending timeout on unmount (no state update after unmount)", async () => {
    const { result, unmount } = renderHook(() => useWhenIdle(true, 1200));
    unmount();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current).toBe(false);
  });

  it("never becomes ready when disabled (compact tier keeps 3D off)", async () => {
    const { result } = renderHook(() => useWhenIdle(false, 100));
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(result.current).toBe(false);
  });

  it("uses requestIdleCallback when available and cancels it on unmount", async () => {
    let idleCb: (() => void) | undefined;
    let cancelled = false;
    (window as unknown as Record<string, unknown>)["requestIdleCallback"] = (cb: () => void) => {
      idleCb = cb;
      return 1;
    };
    (window as unknown as Record<string, unknown>)["cancelIdleCallback"] = () => {
      cancelled = true;
    };

    const { result, unmount } = renderHook(() => useWhenIdle(true, 1800));
    expect(typeof idleCb).toBe("function");
    unmount();
    expect(cancelled).toBe(true);
    // firing after unmount must not throw / must not change unmounted state
    expect(() => act(() => idleCb?.())).not.toThrow();
    expect(result.current).toBe(false);

    delete (window as unknown as Record<string, unknown>)["requestIdleCallback"];
    delete (window as unknown as Record<string, unknown>)["cancelIdleCallback"];
  });

  it("reveals through requestIdleCallback when it fires while mounted", async () => {
    const cbs: Array<() => void> = [];
    (window as unknown as Record<string, unknown>)["requestIdleCallback"] = (cb: () => void) => {
      cbs.push(cb);
      return cbs.length;
    };
    (window as unknown as Record<string, unknown>)["cancelIdleCallback"] = () => {};

    const { result } = renderHook(() => useWhenIdle(true, 1800));
    act(() => {
      cbs.forEach((cb) => cb());
    });
    expect(result.current).toBe(true);

    delete (window as unknown as Record<string, unknown>)["requestIdleCallback"];
    delete (window as unknown as Record<string, unknown>)["cancelIdleCallback"];
  });
});
