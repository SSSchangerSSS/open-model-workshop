import { describe, expect, it } from "vitest";
import { MODELS, MAX_USERS, GPUS, clampUsers, sizeFor } from "@/lib/sizing";

describe("sizing engine — concurrent users validation", () => {
  it("clamps invalid users inputs to a sane, finite value", () => {
    expect(clampUsers(0)).toBe(1);
    expect(clampUsers(-5)).toBe(1);
    expect(clampUsers(-0.5)).toBe(1);
    expect(clampUsers(2.4)).toBe(2);
    expect(clampUsers(2.6)).toBe(3);
    expect(clampUsers(Number.NaN)).toBe(1);
    expect(clampUsers(Number.POSITIVE_INFINITY)).toBe(MAX_USERS);
    expect(clampUsers(Number.NEGATIVE_INFINITY)).toBe(1);
    expect(clampUsers(MAX_USERS + 500)).toBe(MAX_USERS);
    expect(clampUsers(10)).toBe(10);
  });

  const m = MODELS[0]!;

  it("never divides by zero and never emits Infinity/NaN — even for users=0", () => {
    const r = sizeFor(m, 0);
    expect(Number.isFinite(r.pricePerUser)).toBe(true);
    expect(Number.isFinite(r.priceTotal)).toBe(true);
    expect(r.kvGb).toBeGreaterThanOrEqual(0);
  });

  it("treats negative users as 1", () => {
    const r = sizeFor(m, -25);
    expect(r.kvGb).toBeCloseTo(Math.round(m.kvGbPerUser * 1 * 10) / 10, 5);
  });

  it("caps oversized inputs at MAX_USERS", () => {
    const r = sizeFor(m, 100000);
    expect(r.kvGb).toBeCloseTo(Math.round(m.kvGbPerUser * MAX_USERS * 10) / 10, 5);
  });

  it("keeps the physical sanity of the result: VRAM fits, nodes cover GPUs", () => {
    for (const model of MODELS) {
      for (const users of [0, 1, 7.5, 25, 100, 99999]) {
        const r = sizeFor(model, users);
        expect(r.gpus).toBeGreaterThanOrEqual(model.minGpus);
        expect(r.vramTotalGb).toBeGreaterThanOrEqual(r.vramUsedGb);
        expect(r.nodes).toBe(Math.ceil(r.gpus / 8));
        expect(r.priceTotal).toBeGreaterThan(0);
        expect(r.pricePerUser).toBeGreaterThan(0);
        expect(Number.isFinite(r.watts)).toBe(true);
        expect(r.gpu).toBe(GPUS[model.gpu]);
      }
    }
  });
});
