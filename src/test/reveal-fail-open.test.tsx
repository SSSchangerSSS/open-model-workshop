import { render, screen, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Reveal } from "@/components/Reveal";

/**
 * T5 — reveal must FAIL OPEN.
 *  - No JS at all: the component never mounts, markup has no `reveal-arm`.
 *  - Component mounts (bundle executed): it arms + reveals via observer.
 *  - IO missing / observer throws: content still becomes visible (`in`).
 */

describe("Reveal — fail-open contract (T5)", () => {
  it("arms itself before paint and never drops the content", async () => {
    const { container } = render(
      <Reveal>
        <p>محتوای پنهان‌نشدنی</p>
      </Reveal>,
    );
    await act(async () => {});
    const el = container.firstElementChild as HTMLElement;
    if (typeof IntersectionObserver === "undefined") {
      // no observer at all → fail-open immediately
      expect(el.className).toContain("in");
    } else {
      // armed pre-paint (useLayoutEffect) — hiding state is owned by the
      // component, NOT by a global html.js class: if the bundle dies before
      // mounting Reveal, no reveal-arm ever lands on the markup
      expect(el.className).toContain("reveal-arm");
    }
    // content text stays in the DOM either way
    expect(screen.getByText("محتوای پنهان‌نشدنی")).toBeInTheDocument();
  });

  it("fail-open when IntersectionObserver is missing", async () => {
    const original = globalThis.IntersectionObserver;
    // @ts-expect-error simulate ancient browser
    delete globalThis.IntersectionObserver;
    try {
      const { container } = render(
        <Reveal>
          <p>بدون IO</p>
        </Reveal>,
      );
      await act(async () => {});
      const el = container.firstElementChild as HTMLElement;
      expect(el.className).toContain("in"); // shown, not hidden forever
    } finally {
      globalThis.IntersectionObserver = original;
    }
  });

  it("fail-open when the observer constructor throws", async () => {
    const original = globalThis.IntersectionObserver;
    class Broken {
      constructor() {
        throw new Error("setup failed");
      }
      observe() {}
      disconnect() {}
    }
    // @ts-expect-error test stub
    globalThis.IntersectionObserver = Broken;
    try {
      const { container } = render(
        <Reveal>
          <p>با IO خراب</p>
        </Reveal>,
      );
      await act(async () => {});
      const el = container.firstElementChild as HTMLElement;
      expect(el.className).toContain("in");
    } finally {
      globalThis.IntersectionObserver = original;
    }
  });
});
