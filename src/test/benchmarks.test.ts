import { describe, expect, it } from "vitest";
import { BENCH, METRICS, benchOf, hasMetric, metricValue } from "@/lib/benchmarks";
import { MODELS, type ModelCategory } from "@/lib/sizing";

describe("benchmark helpers — zero is data, not 'missing'", () => {
  it("treats 0 as a VALID finite metric value", () => {
    // synthetic entry to prove the contract without touching shipped data
    BENCH["__test-zero"] = { ev: "verified", m: { price: 0, tps: 0 } };
    expect(metricValue("__test-zero", "price")).toBe(0);
    expect(hasMetric("__test-zero", "price")).toBe(true);
    delete BENCH["__test-zero"];
  });

  it("reports missing / non-finite values as absent — never as 0", () => {
    BENCH["__test-bad"] = { ev: "estimated", m: { x: Number.NaN, y: Number.POSITIVE_INFINITY } };
    expect(metricValue("__test-bad", "x")).toBeUndefined();
    expect(metricValue("__test-bad", "y")).toBeUndefined();
    expect(hasMetric("__test-bad", "nope")).toBe(false);
    expect(metricValue("no-such-id", "iq")).toBeUndefined();
    delete BENCH["__test-bad"];
  });

  it("every shipped benchmark row belongs to a real catalog model", () => {
    const ids = new Set(MODELS.map((m) => m.id));
    for (const id of Object.keys(BENCH)) {
      if (id.startsWith("__test")) continue;
      expect(ids.has(id), `BENCH id "${id}" has no MODELS entry`).toBe(true);
    }
  });

  it("every category declares at least one metric with a finite description", () => {
    const cats = new Set<ModelCategory>(MODELS.map((m) => m.cat));
    for (const c of cats) {
      expect(METRICS[c].length, `category ${c} has no metrics`).toBeGreaterThan(0);
    }
  });
});

describe("compare page data integrity", () => {
  it("dual-mode presets reference models that exist (with bench rows)", () => {
    const presets = [
      ["kimi-k3", "deepseek-v4-pro"],
      ["gpt-oss-120b", "qwen3-32b"],
      ["flux.2-dev", "qwen-image"],
      ["wan2.2-a14b", "hunyuan-video-1.5"],
    ];
    for (const [a, b] of presets) {
      expect(
        MODELS.find((m) => m.id === a),
        `preset model ${a} missing`,
      ).toBeTruthy();
      expect(
        MODELS.find((m) => m.id === b),
        `preset model ${b} missing`,
      ).toBeTruthy();
      expect(benchOf(a!)).toBeTruthy();
      expect(benchOf(b!)).toBeTruthy();
    }
  });
});
