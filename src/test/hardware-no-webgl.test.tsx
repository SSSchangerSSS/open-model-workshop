import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { ModelList, SizingBody } from "@/routes/hardware";
import { MODELS, MAX_USERS } from "@/lib/sizing";

/**
 * The hardware calculator is a pure-DOM UI (ModelList + SizingBody) — it
 * must work with ZERO WebGL in the environment. These tests mount exactly
 * those pieces in jsdom (which has no canvas at all): if any three.js code
 * were required for the calculator, this suite would fail to import/render.
 * The «no network fetch of the three.js chunk in lite» behaviour is proven
 * separately with real browser resource-timing (see ui-performance-audit.md).
 */
function Harness() {
  const [selId, setSelId] = useState<string | null>(null);
  const [users, setUsers] = useState(10);
  const m = MODELS.find((x) => x.id === selId) ?? null;
  return (
    <>
      <ModelList models={MODELS} selId={selId} onPick={setSelId} total={MODELS.length} />
      {m && <SizingBody m={m} users={users} setUsers={setUsers} onQuote={() => {}} />}
    </>
  );
}

describe("hardware calculator — works without any WebGL", () => {
  it("renders all 61 model cards; no canvas exists anywhere in the tree", () => {
    render(<Harness />);
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(MODELS.length);
    expect(document.querySelector("canvas")).toBeNull();
  });

  it("selecting a model opens the sizing panel with a real estimate", () => {
    render(<Harness />);
    const qwen = screen.getByRole("button", { name: /کوئن ۲٫۵ ۷ میلیاردی/ });
    fireEvent.click(qwen);
    expect(screen.getByText(/برآورد هزینهٔ سخت‌افزار/)).toBeInTheDocument();
    expect(screen.getByText(/مناسب برای چه کارهایی؟/)).toBeInTheDocument();
    // honest estimate framing inside the panel
    expect(screen.getByText(/برآورد آموزشی بر پایهٔ قیمت قطعات نو/)).toBeInTheDocument();
    expect(document.querySelector("canvas")).toBeNull();
  });

  it("editable users input clamps zero / negative / oversized garbage", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: /کوئن ۲٫۵ ۷ میلیاردی/ }));
    const input = screen.getByLabelText("تعداد کاربران همزمان (عدد)");
    const commit = (v: string) => {
      fireEvent.change(input, { target: { value: v } });
      fireEvent.blur(input);
    };
    commit("0");
    expect((input as HTMLInputElement).value).toBe("1");
    commit("-5000");
    expect((input as HTMLInputElement).value).toBe("1");
    commit("99999");
    expect((input as HTMLInputElement).value).toBe(String(MAX_USERS));
    commit("2.5");
    expect((input as HTMLInputElement).value).toBe("3");
    // the price line stayed finite the whole time
    expect(screen.getByText(/برآورد هزینهٔ سخت‌افزار/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Infinity|NaN/);
  });

  it("search empty state renders a real empty state, not a silent gap", () => {
    render(<ModelList models={[]} selId={null} onPick={() => {}} total={MODELS.length} />);
    expect(screen.getByText(/مدلی با این مشخصات پیدا نشد/)).toBeInTheDocument();
  });
});
