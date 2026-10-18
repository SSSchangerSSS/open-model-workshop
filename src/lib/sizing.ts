/* ------------------------------------------------------------------ */
/* Hardware sizing engine — open-weight models × concurrent users      */
/*                                                                     */
/* VRAM math: runtime weights (FP16/FP8) + per-user KV cache at 8K     */
/* context (GQA tensors, 2 bytes) + ~8% activation/framework overhead. */
/* Serving assumption: vLLM continuous batching, one GPU node unless   */
/* the card count exceeds 8 (then a second node with InfiniBand).      */
/* Prices are rough street prices for NEW parts in USD (2026) —        */
/* estimation only, not a quote.                                       */
/* ------------------------------------------------------------------ */

export type GpuKey = "rtx4090" | "rtx5090" | "l40s" | "a100" | "h100" | "h200";

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
};

export type ModelSpec = {
  id: string;
  en: string; // technical label shown in 3D + mono chips
  fa: string; // Persian display name
  params: string; // "7B" | "70B" | "671B MoE"
  precision: "FP16" | "FP8";
  weightsGb: number;
  kvGbPerUser: number; // KV cache per concurrent user @ 8K ctx
  gpu: GpuKey; // preferred card tier
  minGpus: number; // tensor-parallel minimum
  accent: string; // pod LED color
  tagFa: string; // one-line specialty
  descFa: string; // 1–2 sentences
  bestForFa: string[]; // 3 chips
};

export const MODELS: ModelSpec[] = [
  {
    id: "qwen2.5-7b",
    en: "QWEN 2.5 · 7B",
    fa: "کوئن ۲٫۵ ۷ میلیاردی",
    params: "7B",
    precision: "FP16",
    weightsGb: 15.2,
    kvGbPerUser: 0.5,
    gpu: "rtx4090",
    minGpus: 1,
    accent: "#4dff88",
    tagFa: "چت فارسی و کارهای روزمره",
    descFa:
      "متعادل‌ترین نقطهٔ شروع؛ پشتیبانی قوی از فارسی، سرعت بالا و ارزان‌ترین استقرار. برای چت‌بات‌های فروش و پشتیبانی با ترافیک متوسط ایده‌آل است.",
    bestForFa: ["چت‌بات فارسی", "خلاصه‌سازی", "ایمیل‌های خودکار"],
  },
  {
    id: "llama3.1-8b",
    en: "LLAMA 3.1 · 8B",
    fa: "لاما ۳٫۱ ۸ میلیاردی",
    params: "8B",
    precision: "FP16",
    weightsGb: 16,
    kvGbPerUser: 1,
    gpu: "rtx4090",
    minGpus: 1,
    accent: "#6fd8dd",
    tagFa: "ایجنت و ابزارمحور",
    descFa:
      "استاندارد صنعت با اکوسیستم ابزار بی‌نظیر؛ در فراخوانی تابع (Tool Calling) پایدار است و برای ایجنت‌هایی که به n8n و APIها وصل می‌شوند انتخاب اول است.",
    bestForFa: ["ایجنت سازمانی", "فراخوانی تابع", "طبقه‌بندی متن"],
  },
  {
    id: "mistral-7b",
    en: "MISTRAL · 7B",
    fa: "میسترال ۷ میلیاردی",
    params: "7B",
    precision: "FP16",
    weightsGb: 14.5,
    kvGbPerUser: 0.9,
    gpu: "rtx4090",
    minGpus: 1,
    accent: "#b18cff",
    tagFa: "استنتاج سریع و سبک",
    descFa:
      "کوچک، سریع و کم‌مصرف؛ بیشترین توکن بر ثانیه به ازای هر دلار. برای وظایف پرتکرار مثل برچسب‌گذاری تیکت و استخراج داده از فرم‌ها بهینه است.",
    bestForFa: ["پاسخ لحظه‌ای", "استخراج داده", "دسته‌بندی تیکت"],
  },
  {
    id: "qwen3-32b",
    en: "QWEN 3 · 32B",
    fa: "کوئن ۳ ۳۲ میلیاردی",
    params: "32B",
    precision: "FP16",
    weightsGb: 65.6,
    kvGbPerUser: 2.1,
    gpu: "l40s",
    minGpus: 2,
    accent: "#ffd166",
    tagFa: "کیفیت نزدیک به مدل‌های بزرگ",
    descFa:
      "تعادل طلایی کیفیت و هزینه؛ در زبان فارسی و ریاضیات به‌مراتب قوی‌تر از مدل‌های ۷–۸B است و همچنان روی سخت‌افزار میانی قابل اجراست.",
    bestForFa: ["تحلیل قرارداد", "نوشتن محتوا", "پرسش‌وپاسخ پیشرفته"],
  },
  {
    id: "mistral-small-24b",
    en: "MISTRAL SMALL · 24B",
    fa: "میسترال اسمال ۲۴ میلیاردی",
    params: "24B",
    precision: "FP16",
    weightsGb: 47,
    kvGbPerUser: 1.3,
    gpu: "l40s",
    minGpus: 2,
    accent: "#ff9e64",
    tagFa: "چندزبانه و به‌صرفه",
    descFa:
      "مدل چندزبانهٔ کاربردی با توانایی Function Calling؛ گزینهٔ محبوب شرکت‌هایی که کیفیت میان‌رده می‌خواهند اما بودجهٔ H100 ندارند.",
    bestForFa: ["چندزبانه", "ایجنت RAG", "گزارش‌سازی"],
  },
  {
    id: "llama3.3-70b",
    en: "LLAMA 3.3 · 70B",
    fa: "لاما ۳٫۳ ۷۰ میلیاردی",
    params: "70B",
    precision: "FP16",
    weightsGb: 141,
    kvGbPerUser: 2.5,
    gpu: "a100",
    minGpus: 2,
    accent: "#79c0ff",
    tagFa: "کلاس سازمانی",
    descFa:
      "قدرت GPT-4-class در وزن باز؛ برای دانش سازمانی حساس، تحلیل‌های پیچیده و چت‌بات‌هایی که خطا در آن‌ها پرهزینه است انتخاب می‌شود.",
    bestForFa: ["دانش سازمانی", "تحلیل پیچیده", "ایجنت چندمرحله‌ای"],
  },
  {
    id: "ds-r1-70b",
    en: "DEEPSEEK R1 · 70B",
    fa: "دیپ‌سیک R1 دیستیل ۷۰B",
    params: "70B",
    precision: "FP16",
    weightsGb: 141,
    kvGbPerUser: 2.5,
    gpu: "a100",
    minGpus: 2,
    accent: "#ff6b9d",
    tagFa: "استدلال زنجیره‌ای",
    descFa:
      "نسخهٔ دیستیل‌شدهٔ R1 با استدلال مرحله‌به‌مرحله؛ برای کدنویسی، حل مسئلهٔ ریاضی و سناریوهایی که باید منطق پاسخ قابل پیگیری باشد.",
    bestForFa: ["استدلال ریاضی", "کدنویسی", "تحلیل چندمرحله‌ای"],
  },
  {
    id: "deepseek-v3",
    en: "DEEPSEEK V3 · 671B",
    fa: "دیپ‌سیک V3 / R1 کامل",
    params: "671B MoE",
    precision: "FP8",
    weightsGb: 670,
    kvGbPerUser: 2,
    gpu: "h200",
    minGpus: 6,
    accent: "#7dffde",
    tagFa: "پرچم‌دار — رقیب مدل‌های بسته",
    descFa:
      "معماری MoE با ۳۷ میلیارد پارامتر فعال در هر توکن؛ کیفیت در سطح بهترین مدل‌های تجاری، کاملاً روی سرور خودتان. حداقل یک نود ۸ کارته H200 می‌خواهد.",
    bestForFa: ["کیفیت حداکثری", "RAG سازمانی", "کد و استدلال سنگین"],
  },
];

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
