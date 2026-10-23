import { describe, expect, it } from "vitest";
import { MAX_USERS, MODELS, sanitizeUsers, sizeFor } from "@/lib/sizing";

describe("sizing engine — users validation policy", () => {
  it("sanitizeUsers: NaN / Infinity / 0 / negative / fractional / over-cap", () => {
    expect(sanitizeUsers(Number.NaN)).toBe(1);
    expect(sanitizeUsers(Number.POSITIVE_INFINITY)).toBe(MAX_USERS);
    expect(sanitizeUsers(Number.NEGATIVE_INFINITY)).toBe(1);
    expect(sanitizeUsers(0)).toBe(1);
    expect(sanitizeUsers(-10)).toBe(1);
    expect(sanitizeUsers(0.5)).toBe(1);
    expect(sanitizeUsers(10.9)).toBe(10);
    expect(sanitizeUsers(MAX_USERS + 1000)).toBe(MAX_USERS);
    expect(sanitizeUsers(25)).toBe(25);
  });

  it("sizeFor never divides by zero and never emits non-finite outputs", () => {
    for (const m of MODELS) {
      for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, 1e9, 0.4]) {
        const r = sizeFor(m, bad);
        expect(r.pricePerUser).toBeGreaterThan(0);
        expect(Number.isFinite(r.priceTotal)).toBe(true);
        expect(Number.isFinite(r.pricePerUser)).toBe(true);
        expect(r.gpus).toBeGreaterThanOrEqual(m.minGpus);
        expect(r.vramTotalGb).toBeGreaterThan(0);
        expect(r.watts).toBeGreaterThan(0);
      }
    }
  });

  it("scales monotonically with users (more users never gets cheaper)", () => {
    const m = MODELS[0]!;
    const small = sizeFor(m, 1);
    const big = sizeFor(m, MAX_USERS);
    expect(big.priceTotal).toBeGreaterThanOrEqual(small.priceTotal);
    expect(big.pricePerUser).toBeLessThanOrEqual(small.pricePerUser);
  });
});
