/* ------------------------------------------------------------------ */
/* Benchmark snapshot — مقایسهٔ مدل‌ها با دادهٔ مرجع                     */
/* Sources: Artificial Analysis (artificialanalysis.ai — Intelligence  */
/* Index v4.3.2, arena ELO, speed & cost measurements) and BenchLM     */
/* (benchlm.ai — BenchAlign v5.8 leaderboard), snapshot مهر/اکتبر ۲۰۲۶. */
/*                                                                     */
/* Evidence levels:                                                    */
/*   "verified"  = number read directly from the source leaderboard    */
/*   "estimated" = normalized from source anchors + published papers;  */
/*                 good enough to rank, not a lab measurement.         */
/* Self-host numbers (VRAM, hardware cost) come from the site's own    */
/* sizing engine (src/lib/sizing.ts) and are labelled as estimate.     */
/* Refresh: re-check both sites and update values + snapshot date.     */
/* ------------------------------------------------------------------ */

import { MODELS, type ModelCategory } from "./sizing";

export type MetricSpec = {
  key: string;
  fa: string; // Persian axis label
  unit: string; // unit shown next to the value
  higherBetter: boolean;
  descFa: string; // one-line: what this axis actually means
};

/* One metric registry row per category — the chart builder reads this
   so every category gets its own axes without special-casing. */
export const METRICS: Record<ModelCategory, MetricSpec[]> = {
  llm: [
    {
      key: "iq",
      fa: "شاخص کیفیت",
      unit: "",
      higherBetter: true,
      descFa: "کیفیت کلی نرمال‌شده روی مقیاس ۰–۱۰۰ (هوش، دانش، کد)",
    },
    {
      key: "tps",
      fa: "سرعت خروجی",
      unit: "توکن/ث",
      higherBetter: true,
      descFa: "توکن بر ثانیه هنگام تولید پاسخ",
    },
    {
      key: "price",
      fa: "قیمت API",
      unit: "$/M توکن",
      higherBetter: false,
      descFa: "قیمت ترکیبی API به ازای هر میلیون توکن — اجرای خصوصی رایگان است",
    },
    {
      key: "ctx",
      fa: "کانتکست",
      unit: "K توکن",
      higherBetter: true,
      descFa: "حداکثر توکن ورودی+خروجی در یک درخواست",
    },
  ],
  vlm: [
    {
      key: "iq",
      fa: "شاخص کیفیت",
      unit: "",
      higherBetter: true,
      descFa: "کیفیت فهم تصویر+متن، نرمال‌شده روی ۰–۱۰۰",
    },
    {
      key: "tps",
      fa: "سرعت خروجی",
      unit: "توکن/ث",
      higherBetter: true,
      descFa: "توکن بر ثانیه هنگام توصیف تصویر",
    },
    {
      key: "price",
      fa: "قیمت API",
      unit: "$/M توکن",
      higherBetter: false,
      descFa: "قیمت ترکیبی API به ازای هر میلیون توکن",
    },
    {
      key: "ctx",
      fa: "کانتکست",
      unit: "K توکن",
      higherBetter: true,
      descFa: "حداکثر توکن در یک درخواست چندوجهی",
    },
  ],
  agentic: [
    {
      key: "iq",
      fa: "شاخص کیفیت",
      unit: "",
      higherBetter: true,
      descFa: "کیفیت کار عامل‌محور (فراخوانی ابزار، وظایف چندمرحله‌ای)",
    },
    {
      key: "tps",
      fa: "سرعت خروجی",
      unit: "توکن/ث",
      higherBetter: true,
      descFa: "توکن بر ثانیه — برای ایجنت‌های بلندمکالمه حیاتی است",
    },
    {
      key: "price",
      fa: "قیمت API",
      unit: "$/M توکن",
      higherBetter: false,
      descFa: "قیمت ترکیبی API — برای ایجنتِ پرترافیک ضریب‌دار مهم است",
    },
    {
      key: "ctx",
      fa: "کانتکست",
      unit: "K توکن",
      higherBetter: true,
      descFa: "حافظهٔ کاری ایجنت در یک جلسه",
    },
  ],
  reasoning: [
    {
      key: "iq",
      fa: "شاخص استدلال",
      unit: "",
      higherBetter: true,
      descFa: "ریاضی، کد، استدلال چندمرحله‌ای — نرمال‌شده روی ۰–۱۰۰",
    },
    {
      key: "tps",
      fa: "سرعت خروجی",
      unit: "توکن/ث",
      higherBetter: true,
      descFa: "توکن بر ثانیه شامل زنجیرهٔ فکر",
    },
    {
      key: "price",
      fa: "قیمت API",
      unit: "$/M توکن",
      higherBetter: false,
      descFa: "قیمت ترکیبی API — مدل‌های استدلالی توکن فکر هم می‌سوزانند",
    },
    {
      key: "ctx",
      fa: "کانتکست",
      unit: "K توکن",
      higherBetter: true,
      descFa: "حداکثر توکن در یک درخواست",
    },
  ],
  image: [
    {
      key: "elo",
      fa: "امتیاز آرنا",
      unit: "ELO",
      higherBetter: true,
      descFa: "رتبهٔ الوی انتخاب انسانی در آرنای متن‌به‌تصویر",
    },
    {
      key: "si",
      fa: "زمان تولید",
      unit: "ثانیه/تصویر",
      higherBetter: false,
      descFa: "زمان ساخت یک تصویر ۱۰۲۴px روی کارت کلاس H100",
    },
  ],
  video: [
    {
      key: "elo",
      fa: "امتیاز آرنا",
      unit: "ELO",
      higherBetter: true,
      descFa: "رتبهٔ الوی انتخاب انسانی در آرنای تولید ویدیو",
    },
    {
      key: "sv",
      fa: "زمان تولید",
      unit: "ثانیه/کلیپ",
      higherBetter: false,
      descFa: "زمان ساخت کلیپ ۵ ثانیه‌ای روی کارت کلاس H100",
    },
  ],
  audio: [
    {
      key: "quality",
      fa: "کیفیت صوت",
      unit: "/۱۰۰",
      higherBetter: true,
      descFa: "کیفیت نرمال‌شده: برای STT بر پایهٔ WER و برای TTS بر پایهٔ طبیعی‌بودن",
    },
    {
      key: "rtfx",
      fa: "ضریب بلادرنگ",
      unit: "×",
      higherBetter: true,
      descFa: "چند برابر زنده‌تر پردازش می‌کند (۳۰× یعنی یک فایل ۱۰ دقیقه‌ای در ۲۰ ثانیه)",
    },
  ],
  threed: [
    {
      key: "quality",
      fa: "کیفیت مش",
      unit: "/۱۰۰",
      higherBetter: true,
      descFa: "کیفیت هندسه، بافت و جزئیات خروجی سه‌بعدی",
    },
    {
      key: "st",
      fa: "زمان تولید",
      unit: "ثانیه/مدل",
      higherBetter: false,
      descFa: "زمان ساخت یک مش از یک تصویر ورودی",
    },
  ],
  embed: [
    {
      key: "mteb",
      fa: "امتیاز MTEB",
      unit: "",
      higherBetter: true,
      descFa: "بنچمارک استاندارد بازیابی معنایی و خوشه‌بندی چندزبانه",
    },
    {
      key: "thr",
      fa: "توان عملیاتی",
      unit: "سند/ث",
      higherBetter: true,
      descFa: "تعداد سند قابل امبد در ثانیه روی یک کارت کلاس H100",
    },
    {
      key: "dims",
      fa: "ابعاد بردار",
      unit: "بعد",
      higherBetter: false,
      descFa: "اندازهٔ بردار — بعد کمتر یعنی پایگاه‌دادهٔ برداری کوچک‌تر",
    },
  ],
};

export type Evidence = "verified" | "estimated";

export type BenchRow = {
  ev: Evidence;
  m: Partial<Record<string, number>>;
};

const V = (m: Partial<Record<string, number>>): BenchRow => ({ ev: "verified", m });
const E = (m: Partial<Record<string, number>>): BenchRow => ({ ev: "estimated", m });

export const BENCH: Record<string, BenchRow> = {
  /* ------------------------- چت و متن ------------------------- */
  "qwen2.5-7b": E({ iq: 30, tps: 60, price: 0.18, ctx: 32 }),
  "mistral-7b": E({ iq: 24, tps: 78, price: 0.15, ctx: 32 }),
  "gemma3-27b": E({ iq: 38, tps: 55, price: 0.3, ctx: 128 }),
  "qwen3-32b": E({ iq: 42, tps: 48, price: 0.35, ctx: 128 }),
  "gpt-oss-120b": E({ iq: 58, tps: 130, price: 0.3, ctx: 128 }),
  "llama4-scout": E({ iq: 46, tps: 85, price: 0.25, ctx: 10000 }),
  "llama3.3-70b": E({ iq: 44, tps: 65, price: 0.5, ctx: 128 }),
  "gpt-oss-20b": E({ iq: 48, tps: 165, price: 0.1, ctx: 128 }),
  "phi-4": E({ iq: 34, tps: 72, price: 0.12, ctx: 16 }),

  /* --------------------- بینایی و چندوجهی --------------------- */
  "qwen2.5-vl-7b": E({ iq: 40, tps: 60, price: 0.2, ctx: 32 }),
  "qwen2.5-vl-32b": E({ iq: 46, tps: 45, price: 0.4, ctx: 32 }),
  "internvl3-14b": E({ iq: 43, tps: 55, price: 0.25, ctx: 32 }),
  "glm-4.5v": E({ iq: 55, tps: 55, price: 0.6, ctx: 64 }),
  "minicpm-v-4.5": E({ iq: 38, tps: 65, price: 0.15, ctx: 32 }),

  /* ----------------------- عامل هوشمند ------------------------ */
  "llama3.1-8b": E({ iq: 28, tps: 70, price: 0.18, ctx: 128 }),
  "mistral-small-24b": E({ iq: 40, tps: 62, price: 0.25, ctx: 128 }),
  "minimax-m2": V({ iq: 54, tps: 100, price: 0.35, ctx: 200 }),
  "glm-4.6": E({ iq: 52, tps: 80, price: 0.55, ctx: 200 }),
  "glm-5.3": V({ iq: 71, tps: 66, ctx: 1000 }),
  "kimi-k2.6": E({ iq: 66, tps: 40, price: 2.4, ctx: 256 }),
  "kimi-k3": V({ iq: 70, tps: 44, price: 6, ctx: 1050 }),
  "qwen3-coder-480b": E({ iq: 60, tps: 50, price: 0.9, ctx: 256 }),
  "devstral-small": E({ iq: 42, tps: 65, price: 0.3, ctx: 128 }),

  /* ----------------------- استدلال و کد ----------------------- */
  "ds-r1-70b": E({ iq: 46, tps: 40, price: 0.6, ctx: 128 }),
  "qwq-32b": E({ iq: 44, tps: 50, price: 0.35, ctx: 128 }),
  "deepseek-v3": E({ iq: 50, tps: 55, price: 1.1, ctx: 128 }),
  "deepseek-v4-flash": V({ iq: 62, tps: 208, price: 0.45, ctx: 512 }),
  "deepseek-v4-pro": E({ iq: 74, tps: 60, price: 1.35, ctx: 512 }),
  "deepseek-r1-0528": E({ iq: 48, tps: 45, price: 0.9, ctx: 128 }),
  "phi-4-reasoning-plus": E({ iq: 42, tps: 55, price: 0.15, ctx: 32 }),

  /* ------------------------ تولید تصویر ------------------------ */
  sdxl: E({ elo: 1020, si: 3.5 }),
  "flux.1-dev": E({ elo: 1065, si: 4 }),
  "flux.2-dev": E({ elo: 1100, si: 6.5 }),
  "qwen-image": E({ elo: 1095, si: 7 }),
  "hunyuan-image-3": E({ elo: 1115, si: 12 }),
  "sd3.5-large": E({ elo: 1055, si: 5 }),
  "qwen-image-edit": E({ elo: 1090, si: 7.5 }),

  /* ------------------------ تولید ویدیو ------------------------ */
  "ltx-video": E({ elo: 1005, sv: 12 }),
  "cogvideox-5b": E({ elo: 990, sv: 40 }),
  "wan2.2-5b": E({ elo: 1040, sv: 25 }),
  "wan2.2-a14b": E({ elo: 1075, sv: 70 }),
  "hunyuan-video-1.5": E({ elo: 1080, sv: 60 }),
  "mochi-1": E({ elo: 1000, sv: 90 }),
  framepack: E({ elo: 1030, sv: 55 }),

  /* ------------------------ صوت و گفتار ------------------------ */
  "whisper-large-v3": V({ quality: 88, rtfx: 15 }),
  "kokoro-tts": E({ quality: 84, rtfx: 30 }),
  "f5-tts": E({ quality: 86, rtfx: 22 }),
  chatterbox: E({ quality: 83, rtfx: 25 }),
  "gpt-sovits": E({ quality: 80, rtfx: 15 }),
  "musicgen-medium": E({ quality: 78, rtfx: 2.5 }),

  /* ------------------------ سه‌بعدی‌سازی ------------------------ */
  triposr: E({ quality: 62, st: 15 }),
  trellis: E({ quality: 82, st: 30 }),
  "hunyuan3d-2.1": E({ quality: 88, st: 45 }),
  instantmesh: E({ quality: 70, st: 12 }),
  stablefast3d: E({ quality: 66, st: 3 }),
  "direct3d-s2": E({ quality: 90, st: 60 }),

  /* ----------------------- جست‌وجو و RAG ----------------------- */
  "bge-m3": V({ mteb: 66.4, thr: 800, dims: 1024 }),
  "qwen3-embedding-8b": V({ mteb: 70.6, thr: 400, dims: 4096 }),
  "bge-reranker-v2-m3": V({ mteb: 71, thr: 600, dims: 1024 }),
  "qwen3-embedding-0.6b": V({ mteb: 64.3, thr: 1500, dims: 1024 }),
  "multilingual-e5-large": V({ mteb: 63.7, thr: 900, dims: 1024 }),
};

export const SNAPSHOT_FA = "اسنپ‌شات مهر ۱۴۰۵ / اکتبر ۲۰۲۶";

/** Row for a model id — always defined for catalog ids (runtime guard). */
export function benchOf(id: string): BenchRow | undefined {
  return BENCH[id];
}

/** All catalog models of a category that carry benchmark data. */
export function benchModels(cat: ModelCategory) {
  return MODELS.filter((m) => m.cat === cat && BENCH[m.id]);
}
