import { describe, expect, it } from "vitest";
import {
  CORRIDOR_DZ,
  CORRIDOR_Z0,
  INFRA_LABELS,
  MODEL_LABELS,
  MODEL_RACK_SLOTS,
  RACKS_PER_SIDE,
  RACK_FA,
  buildRacks,
  rackZ,
} from "@/lib/datacenter-racks";

describe("datacenter buildRacks — explicit model→rack mapping", () => {
  const racks = buildRacks();

  it("builds exactly 44 racks (2 sides × 22)", () => {
    expect(racks).toHaveLength(RACKS_PER_SIDE * 2);
  });

  it("every one of the 4 expected model racks exists, exactly once, with the right label", () => {
    for (let mi = 0; mi < MODEL_LABELS.length; mi++) {
      const label = MODEL_LABELS[mi]!;
      const hits = racks.filter((r) => r.model === mi);
      expect(hits, `model ${mi} (${label.short}) must map to exactly one rack`).toHaveLength(1);
      expect(hits[0]!.label).toBe(label.label);
    }
  });

  it("model rack slots are valid (inside the corridor) and alternate sides", () => {
    expect(MODEL_RACK_SLOTS).toHaveLength(MODEL_LABELS.length);
    MODEL_RACK_SLOTS.forEach((slot) => {
      expect(slot.i).toBeGreaterThanOrEqual(0);
      expect(slot.i).toBeLessThan(RACKS_PER_SIDE);
    });
    const sides = MODEL_RACK_SLOTS.map((s) => s.side);
    for (let i = 1; i < sides.length; i++) {
      expect(sides[i]).not.toBe(sides[i - 1]);
    }
  });

  it("model rack z coordinates are on the real generated grid (8.5 - i*3)", () => {
    MODEL_RACK_SLOTS.forEach((slot, mi) => {
      const rack = racks.find((r) => r.model === mi)!;
      expect(rack.pos[2]).toBeCloseTo(rackZ(slot.i), 10);
      expect(rack.pos[2]).toBeCloseTo(CORRIDOR_Z0 - slot.i * CORRIDOR_DZ, 10);
      // and the rack actually sits on the matching side
      expect(rack.pos[0]).toBe(slot.side === 0 ? -2.6 : 2.6);
    });
  });

  it("no model rack ever carries an infra label, and picking alternates with highlight", () => {
    const modelRacks = racks.filter((r) => r.model >= 0);
    expect(modelRacks).toHaveLength(MODEL_LABELS.length);
    for (const r of modelRacks) {
      expect(INFRA_LABELS).not.toContain(r.label);
      expect(RACK_FA.has(r.model)).toBe(true);
    }
  });
});
