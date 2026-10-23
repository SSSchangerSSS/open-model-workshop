import { describe, expect, it } from "vitest";
import {
  buildRacks,
  MODEL_LABELS,
  MODEL_RACK_SLOTS,
  RACKS_PER_SIDE,
  rackZ,
} from "@/lib/rack-layout";

describe("corridor rack layout — model rack mapping", () => {
  const racks = buildRacks();

  it("generates exactly 44 racks (22 per side) at the documented z grid", () => {
    expect(racks).toHaveLength(RACKS_PER_SIDE * 2);
    for (const r of racks) {
      expect(r.z).toBe(rackZ(r.i));
      expect(r.x).toBe(r.side === 0 ? -2.6 : 2.6);
    }
  });

  it("maps ALL FOUR model racks — Qwen, Llama, DeepSeek, Mistral — to exactly one real rack each", () => {
    const modelRacks = racks.filter((r) => r.model >= 0);
    expect(modelRacks).toHaveLength(4);
    for (let m = 0; m < MODEL_LABELS.length; m++) {
      const found = modelRacks.filter((r) => r.model === m);
      expect(found).toHaveLength(1);
      const rack = found[0]!;
      const slot = MODEL_RACK_SLOTS[m]!;
      expect(rack.side).toBe(slot.side);
      expect(rack.i).toBe(slot.i);
      expect(rack.label).toBe(MODEL_LABELS[m]!.label);
    }
  });

  it("alternates model racks between the two corridor sides", () => {
    const modelRacks = racks.filter((r) => r.model >= 0).sort((a, b) => b.z - a.z);
    for (let k = 1; k < modelRacks.length; k++) {
      expect(modelRacks[k]!.side).not.toBe(modelRacks[k - 1]!.side);
    }
  });

  it("keeps every (side, i) slot unique and inside the generated grid", () => {
    const seen = new Set<string>();
    for (const s of MODEL_RACK_SLOTS) {
      const key = `${s.side}:${s.i}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
      expect(s.i).toBeGreaterThanOrEqual(0);
      expect(s.i).toBeLessThan(RACKS_PER_SIDE);
    }
  });

  it("gives model racks and every even-index slot a label, odd infra slots none", () => {
    for (const r of racks) {
      if (r.model >= 0 || r.i % 2 === 0) expect(r.label).not.toBeNull();
      else expect(r.label).toBeNull();
    }
  });

  it("keeps rack display numbers sequential from 1", () => {
    racks.forEach((r, idx) => expect(r.no).toBe(idx + 1));
  });
});
