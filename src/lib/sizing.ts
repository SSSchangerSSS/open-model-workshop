/* ------------------------------------------------------------------ */
/* Hardware sizing engine — open-weight models × concurrent users      */
/*                                                                     */
/* VRAM math: runtime weights (FP16/FP8) + per-user working memory     */
/* (LLM: KV cache @ 8K ctx · diffusion: activations per generation ·   */
/* ASR/TTS: stream buffer · embedding: query batch + index cache)      */
/* + ~8% activation/framework overhead.                                */
/* Serving assumption: vLLM continuous batching for text models,       */
/* PyTorch/Diffusers for image-video, one GPU node unless the card     */
/* count exceeds 8 (then a second node with InfiniBand).               */
/* Prices are rough street prices for NEW parts in USD (2026) —        */
/* estimation only, not a quote.                                       */
/* ------------------------------------------------------------------ */

import { MODELS } from "./models";

export type GpuKey = "rtx4090" | "rtx5090" | "l40s" | "a100" | "h100" | "h200" | "b200";

export type Gpu = {
  name: string;
  vram: number; // GB usable
  price: number; // USD, street estimate
  tdp: number; // watts
};

export const GPUS: Record<GpuKey, Gpu> = {
  rtx4090: { name: "RTX 4090", vram: 24, price: 1900, tdp: 450 },
  rtx5090: { name: "RTX 5090", vram: 32, price: 2600, tdp: 575 },
  l40s: { name: "L40S", vram: 48, price: 7800, tdp: 350 },
  a100: { name: "A100 80GB", vram: 80, price: 15000, tdp: 400 },
  h100: { name: "H100 80GB", vram: 80, price: 27000, tdp: 700 },
  h200: { name: "H200 141GB", vram: 141, price: 38000, tdp: 700 },
  b200: { name: "B200 192GB", vram: 192, price: 42000, tdp: 1000 },
};

/* ------------------------------------------------------------------ */
/* Categories — 9 galaxies: text, vision, agent, reasoning, image,     */
/* video, audio, 3D and embedding                                      */
/* ------------------------------------------------------------------ */

export type ModelCategory =
  "llm" | "vlm" | "agentic" | "reasoning" | "image" | "video" | "audio" | "threed" | "embed";

export type CategorySpec = {
  key: ModelCategory;
  fa: string; // Persian label (3D + chips)
  en: string; // mono tag
  color: string; // orbit ring / chip color
  descFa: string; // one-line: what this category is for
};

export const CATEGORIES: CategorySpec[] = [
  {
    key: "llm",
    fa: "چت و متن",
    en: "LLM",
    color: "#4dff88",
    descFa: "گفت‌وگو، نویسندگی، خلاصه‌سازی و پاسخ به پرسش",
  },
  {
    key: "vlm",
    fa: "بینایی و چندوجهی",
    en: "VISION",
    color: "#93c5fd",
    descFa: "فهم عکس، جدول، فرم و سند — ورودی تصویری برای چت و RAG",
  },
  {
    key: "agentic",
    fa: "عامل هوشمند",
    en: "AGENTIC",
    color: "#b18cff",
    descFa: "فراخوانی تابع، اتصال به n8n و کارهای چندمرحله‌ای",
  },
  {
    key: "reasoning",
    fa: "استدلال و کد",
    en: "REASONING",
    color: "#ff6b9d",
    descFa: "زنجیرهٔ فکر، ریاضی، کدنویسی و تحلیل سنگین",
  },
  {
    key: "image",
    fa: "تولید تصویر",
    en: "IMAGE GEN",
    color: "#ffd166",
    descFa: "ساخت تصویر از متن، پوستر و ویرایش خلاقانه",
  },
  {
    key: "video",
    fa: "تولید ویدیو",
    en: "VIDEO GEN",
    color: "#ff9e64",
    descFa: "کلیپ از متن یا عکس با تنظیمات استودیویی",
  },
  {
    key: "audio",
    fa: "صوت و گفتار",
    en: "AUDIO",
    color: "#6fd8dd",
    descFa: "گفتار به متن (STT) و متن به گفتار (TTS)",
  },
  {
    key: "threed",
    fa: "سه‌بعدی‌سازی",
    en: "3D GEN",
    color: "#c084fc",
    descFa: "عکس به مدل سه‌بعدی، مش و بافت PBR برای بازی و رندر",
  },
  {
    key: "embed",
    fa: "جست‌وجو و RAG",
    en: "EMBEDDING",
    color: "#7dffde",
    descFa: "بردار معنایی برای جست‌وجوی هوشمند و بازیابی",
  },
];

export const CATEGORY_MAP: Record<ModelCategory, CategorySpec> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
) as Record<ModelCategory, CategorySpec>;

/* ------------------------------------------------------------------ */
/* Model catalog — lives in models.ts (61 open-weight models)          */
/* ------------------------------------------------------------------ */

export { MODELS };

export type ModelSpec = {
  id: string;
  cat: ModelCategory;
  en: string; // technical label shown in 3D + mono chips
  fa: string; // Persian display name
  params: string; // "7B" | "70B" | "671B MoE"
  precision: "FP16" | "FP8" | "MXFP4";
  weightsGb: number;
  kvGbPerUser: number; // per-user VRAM @ 8K ctx / per concurrent task
  gpu: GpuKey; // preferred card tier
  minGpus: number; // tensor-parallel minimum
  accent: string; // planet LED color
  tagFa: string; // one-line specialty
  useForFa: string; // the tasks this model is the right tool for
  descFa: string; // 1–2 sentences
  bestForFa: string[]; // 3 chips
  servingFa: string; // runtime/precision note shown under the price
};

export type SizingResult = {
  gpu: Gpu;
  gpus: number;
  nodes: number;
  vramTotalGb: number;
  weightsGb: number;
  kvGb: number;
  vramUsedGb: number;
  cpuCores: number;
  ramGb: number;
  nvmeTb: number;
  watts: number;
  priceGpu: number;
  pricePlatform: number;
  priceRam: number;
  priceStorage: number;
  priceNet: number;
  priceTotal: number;
  pricePerUser: number;
  powerMonthlyUsd: number;
};

export const KWH_USD = 0.18; // industrial electricity, rough
export const CTX_NOTE = "کانتکست ۸K · vLLM با batching پیوسته";

function nodeBaseCost(gpusPerNode: number): number {
  if (gpusPerNode <= 2) return 4500; // single EPYC, chassis, PSU, 10GbE
  if (gpusPerNode <= 4) return 7500; // dual EPYC platform
  return 12000; // 8-GPU server platform
}

export function sizeFor(m: ModelSpec, users: number): SizingResult {
  const gpu = GPUS[m.gpu];
  const weights = m.weightsGb * 1.08; // CUDA context, activations, framework
  const kv = m.kvGbPerUser * users;
  const vramUsed = weights + kv;
  const gpus = Math.max(m.minGpus, Math.ceil(vramUsed / gpu.vram));
  const nodes = Math.ceil(gpus / 8);
  const perNode = Math.ceil(gpus / nodes);
  const ramGb = 128 + gpus * 24;
  const nvmeTb = Math.max(2, Math.ceil((m.weightsGb * 2.5) / 1000));
  const cpuCores = 16 + gpus * 8;
  const watts = gpus * gpu.tdp + nodes * 900;
  const priceGpu = gpus * gpu.price;
  const pricePlatform = nodes * nodeBaseCost(perNode);
  const priceRam = Math.round(ramGb * 3.5);
  const priceStorage = nvmeTb * 130;
  const priceNet = nodes > 1 ? (nodes - 1) * 6000 : 0; // InfiniBand/RoCE link
  const priceTotal = priceGpu + pricePlatform + priceRam + priceStorage + priceNet;
  const powerMonthlyUsd = Math.round(((watts / 1000) * 730 * KWH_USD) / 5) * 5;
  return {
    gpu,
    gpus,
    nodes,
    vramTotalGb: gpus * gpu.vram,
    weightsGb: m.weightsGb,
    kvGb: Math.round(kv * 10) / 10,
    vramUsedGb: Math.round(vramUsed),
    cpuCores,
    ramGb,
    nvmeTb,
    watts,
    priceGpu,
    pricePlatform,
    priceRam,
    priceStorage,
    priceNet,
    priceTotal,
    pricePerUser: Math.round(priceTotal / users),
    powerMonthlyUsd,
  };
}

/** Cap so the configurator stays honest (one cluster, not a datacenter). */
export const MAX_USERS = 256;
export const USER_PRESETS = [1, 5, 10, 25, 50, 100];
