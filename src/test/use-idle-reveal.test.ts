import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useIdleReveal } from "@/lib/use-idle-reveal";

/**
 * useIdleReveal — the explicit-value contract:
 * the fallback timer MUST call setReady(true) (never an undefined argument),
 * the idle path is cancelled on unmount, and the ?idle=0 QA override forces
 * the fallback branch even when requestIdleCallback exists.
 * (Fake timers throughout — assertions stay synchronous, no waitFor.)
 */
describe("useIdleReveal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    window.history.replaceState(null, "", "/");
  });

  it("resolves via the setTimeout fallback when requestIdleCallback is missing", () => {
    vi.stubGlobal("requestIdleCallback", undefined);
    const { result } = renderHook(() => useIdleReveal(1200, 2500));
    expect(result.current).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(result.current).toBe(true);
  });

  it("forces the fallback path with ?idle=0 even when requestIdleCallback exists", () => {
    const ric = vi.fn(() => 1);
    vi.stubGlobal("requestIdleCallback", ric);
    window.history.replaceState(null, "", "/?idle=0");
    const { result } = renderHook(() => useIdleReveal(700, 2500));
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(result.current).toBe(true);
    expect(ric).not.toHaveBeenCalled();
  });

  it("does not flip after unmount (timer cleaned up)", () => {
    vi.stubGlobal("requestIdleCallback", undefined);
    const { result, unmount } = renderHook(() => useIdleReveal(800, 2500));
    unmount();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current).toBe(false);
  });

  it("uses requestIdleCallback with a hard timeout and cancels the handle on unmount", () => {
    const ric = vi.fn(() => 2);
    const cic = vi.fn();
    vi.stubGlobal("requestIdleCallback", ric);
    vi.stubGlobal("cancelIdleCallback", cic);
    const { result, unmount } = renderHook(() => useIdleReveal(1200, 2500));
    expect(ric).toHaveBeenCalledWith(expect.any(Function), { timeout: 2500 });
    expect(result.current).toBe(false);
    unmount();
    expect(cic).toHaveBeenCalledWith(2); // idle handle cancelled
  });
});
