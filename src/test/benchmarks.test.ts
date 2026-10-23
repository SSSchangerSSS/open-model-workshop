import { describe, expect, it } from "vitest";
import { BENCH, isMissingMetric, METRICS, benchModels, benchOf } from "@/lib/benchmarks";
import { MODELS } from "@/lib/sizing";

describe("benchmarks — zero vs missing semantics", () => {
  it("isMissingMetric: 0 is a VALID value, undefined/null/NaN are missing", () => {
    expect(isMissingMetric(0)).toBe(false);
    expect(isMissingMetric(0.0)).toBe(false);
    expect(isMissingMetric(-3)).toBe(false);
    expect(isMissingMetric(undefined)).toBe(true);
    expect(isMissingMetric(null)).toBe(true);
    expect(isMissingMetric(Number.NaN)).toBe(true);
  });

  it("dataset sanity: every stored metric is a finite number (no NaN/Infinity/nulls)", () => {
    for (const [id, row] of Object.entries(BENCH)) {
      for (const [key, v] of Object.entries(row.m)) {
        if (v === undefined) continue;
        expect(typeof v, `${id}.${key}`).toBe("number");
        expect(Number.isFinite(v), `${id}.${key} must be finite`).toBe(true);
      }
    }
  });

  it("every category exposes at least one metric and one benched model", () => {
    for (const cat of Object.keys(METRICS) as Array<keyof typeof METRICS>) {
      expect(METRICS[cat]!.length).toBeGreaterThan(0);
      expect(benchModels(cat).length).toBeGreaterThan(0);
    }
  });

  it("benchOf returns undefined for unknown ids (never throws)", () => {
    expect(benchOf("no-such-model")).toBeUndefined();
    const anyBenched = MODELS.find((m) => BENCH[m.id]);
    expect(anyBenched).toBeDefined();
    expect(benchOf(anyBenched!.id)).toBeDefined();
  });
});
