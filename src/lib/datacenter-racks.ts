/**
 * Corridor rack layout — pure data module (no three.js imports) so unit
 * tests can verify the model→rack mapping without pulling the WebGL stack.
 */

export const MODEL_LABELS = [
  { short: "QWEN", label: "QWEN · چت فارسی" },
  { short: "LLAMA", label: "LLAMA · ایجنت سازمانی" },
  { short: "DEEPSEEK", label: "DEEPSEEK · استدلال" },
  { short: "MISTRAL", label: "MISTRAL · استنتاج سریع" },
] as const;

export const INFRA_LABELS = [
  "N8N · WORKFLOWS",
  "FLOWISE · RAG",
  "GPU RIG · RTX 4090",
  "ذخیره‌سازی · NVME",
  "COOLING · INROW",
  "QDRANT · VECTOR DB",
  "VLLM · SERVE",
  "مانیتورینگ ۲۴/۷",
  "BACKUP · SNAPSHOT",
  "امنیت · فایروال",
] as const;

export type RackData = {
  pos: [number, number, number];
  seed: number;
  label: string | null;
  model: number;
  no: number;
};

/**
 * Explicit model → rack placement, by (side, index) — NEVER by float
 * matching. The old code matched modelZ against z = 8.5 - i * 3.0, and only
 * -15.5 ever hit an actual rack z (i = 8): Qwen/DeepSeek/Mistral racks fell
 * through to infra labels and could never highlight or pick.
 * Each model gets a valid rack slot, alternating sides, in the walk path.
 */
export const MODEL_RACK_SLOTS: Array<{ side: 0 | 1; i: number }> = [
  { side: 0, i: 5 }, // Qwen      z = -6.5  (left)
  { side: 1, i: 8 }, // Llama     z = -15.5 (right)
  { side: 0, i: 10 }, // DeepSeek  z = -21.5 (left)
  { side: 1, i: 13 }, // Mistral   z = -30.5 (right)
];

export const RACKS_PER_SIDE = 22;
export const CORRIDOR_Z0 = 8.5;
export const CORRIDOR_DZ = 3.0;

/** Rack z for a (side, index) slot — exported for tests. */
export function rackZ(i: number): number {
  return CORRIDOR_Z0 - i * CORRIDOR_DZ;
}

export function buildRacks(): RackData[] {
  const racks: RackData[] = [];
  const modelBySlot = new Map<string, number>();
  MODEL_RACK_SLOTS.forEach((slot, mi) => {
    if (slot.i < 0 || slot.i >= RACKS_PER_SIDE) return; // guard: invalid slot
    modelBySlot.set(`${slot.side}:${slot.i}`, mi);
  });
  let infra = 0;
  for (let side = 0; side < 2; side++) {
    const x = side === 0 ? -2.6 : 2.6;
    for (let i = 0; i < RACKS_PER_SIDE; i++) {
      const z = rackZ(i);
      const mi = modelBySlot.get(`${side}:${i}`);
      let label: string | null = null;
      let model = -1;
      if (mi !== undefined) {
        label = MODEL_LABELS[mi]?.label ?? null;
        model = mi;
      } else if (i % 2 === 0) {
        label = INFRA_LABELS[infra++ % INFRA_LABELS.length] ?? null;
      }
      racks.push({
        pos: [x, 1.16, z],
        seed: (side * 31 + i * 7.13) % 100,
        label,
        model,
        no: racks.length + 1,
      });
    }
  }
  return racks;
}

/** Persian hover description per model rack (-1 = infra rack). */
export const RACK_FA = new Map<number, string>([
  [-1, "رک زیرساخت — خاموش و بی‌خطر؛ فقط چراغ‌هایش می‌رقصند."],
  [0, "رک Qwen — گفتگو و پردازش زبان فارسی. کلیک: انتخاب مدل"],
  [1, "رک Llama — ایجنت‌های سازمانی. کلیک: انتخاب مدل"],
  [2, "رک DeepSeek — استدلال و کدنویسی. کلیک: انتخاب مدل"],
  [3, "رک Mistral — استنتاج سریع و محلی. کلیک: انتخاب مدل"],
]);
