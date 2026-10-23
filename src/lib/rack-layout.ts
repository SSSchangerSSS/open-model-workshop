/**
 * Corridor rack layout — pure data, no three.js.
 * Kept dependency-free so unit tests (and the sizing/UI code) can import it
 * without pulling the ~950KB WebGL chunk into the graph.
 *
 * Racks are generated per side at z = 8.5 - i * 3.0 (i = 0..21).
 * The four MODEL racks are placed via an explicit (side, i) slot map —
 * the previous implementation compared a hand-written z list
 * ([-9, -15.5, -22, -28.5]) against the generated coordinates and only
 * -15.5 ever matched, so 3 of the 4 model racks never existed.
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

/** Explicit, testable slot map: one rack per model, alternating sides. */
export const MODEL_RACK_SLOTS: ReadonlyArray<{ side: 0 | 1; i: number }> = [
  { side: 0, i: 6 }, // z = -9.5  · left  · Qwen
  { side: 1, i: 9 }, // z = -18.5 · right · Llama
  { side: 0, i: 10 }, // z = -21.5 · left  · DeepSeek
  { side: 1, i: 13 }, // z = -30.5 · right · Mistral
];

export const RACKS_PER_SIDE = 22;
export const RACK_Z_STEP = 3.0;
export const RACK_Z_START = 8.5;

/** z coordinate of the rack at (side, i) — must match the 3D generator. */
export function rackZ(i: number): number {
  return RACK_Z_START - i * RACK_Z_STEP;
}

export type RackLayout = {
  side: 0 | 1;
  i: number;
  x: number;
  z: number;
  seed: number;
  label: string | null;
  model: number; // 0..3 for model racks, -1 for infrastructure racks
  no: number; // 1-based display number across both sides
};

export function buildRacks(): RackLayout[] {
  const racks: RackLayout[] = [];
  let infra = 0;
  for (let side = 0; side < 2; side++) {
    const x = side === 0 ? -2.6 : 2.6;
    for (let i = 0; i < RACKS_PER_SIDE; i++) {
      const slotIdx = MODEL_RACK_SLOTS.findIndex((s) => s.side === side && s.i === i);
      let label: string | null = null;
      let model = -1;
      if (slotIdx >= 0) {
        label = MODEL_LABELS[slotIdx]?.label ?? null;
        model = slotIdx;
      } else if (i % 2 === 0) {
        label = INFRA_LABELS[infra % INFRA_LABELS.length] ?? null;
        infra++;
      }
      racks.push({
        side: side as 0 | 1,
        i,
        x,
        z: rackZ(i),
        seed: (side * 31 + i * 7.13) % 100,
        label,
        model,
        no: racks.length + 1,
      });
    }
  }
  return racks;
}

/** Tooltip copy per model rack (and the default for infrastructure racks). */
export const RACK_FA: ReadonlyArray<string> = [
  "رک Qwen — گفتگو و پردازش زبان فارسی. کلیک: انتخاب مدل",
  "رک Llama — ایجنت‌های سازمانی. کلیک: انتخاب مدل",
  "رک DeepSeek — استدلال و کدنویسی. کلیک: انتخاب مدل",
  "رک Mistral — استنتاج سریع و محلی. کلیک: انتخاب مدل",
];

export const RACK_FA_INFRA = "رک زیرساخت — خاموش و بی‌خطر؛ فقط چراغ‌هایش می‌رقصند.";
