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

/* ------------------------------------------------------------------ */
/* Categories — چت و متن، عامل هوشمند، استدلال، تصویر، ویدیو، صوت، RAG  */
/* ------------------------------------------------------------------ */

export type ModelCategory = "llm" | "agentic" | "reasoning" | "image" | "video" | "audio" | "embed";

export type CategorySpec = {
  key: ModelCategory;
  fa: string; // Persian label (3D + chips)
  en: string; // mono tag
  color: string; // sector / chip color
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
/* Model catalog — ordered by category so the 3D ring groups sectors   */
/* ------------------------------------------------------------------ */

export type ModelSpec = {
  id: string;
  cat: ModelCategory;
  en: string; // technical label shown in 3D + mono chips
  fa: string; // Persian display name
  params: string; // "7B" | "70B" | "671B MoE"
  precision: "FP16" | "FP8";
  weightsGb: number;
  kvGbPerUser: number; // per-user VRAM @ 8K ctx / per concurrent task
  gpu: GpuKey; // preferred card tier
  minGpus: number; // tensor-parallel minimum
  accent: string; // pod LED color
  tagFa: string; // one-line specialty
  useForFa: string; // the tasks this model is the right tool for
  descFa: string; // 1–2 sentences
  bestForFa: string[]; // 3 chips
  servingFa: string; // runtime/precision note shown under the price
};

export const MODELS: ModelSpec[] = [
  /* ---------------------------- LLM · چت و متن ---------------------------- */
  {
    id: "qwen2.5-7b",
    cat: "llm",
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
    useForFa: "چت‌بات فارسی فروش و پشتیبانی، خلاصه‌سازی گزارش‌ها و نامه‌نگاری خودکار روزمره.",
    descFa:
      "متعادل‌ترین نقطهٔ شروع؛ پشتیبانی قوی از فارسی، سرعت بالا و ارزان‌ترین استقرار. برای چت‌بات‌های فروش و پشتیبانی با ترافیک متوسط ایده‌آل است.",
    bestForFa: ["چت‌بات فارسی", "خلاصه‌سازی", "ایمیل‌های خودکار"],
    servingFa: "vLLM · کانتکست ۸K · batching پیوسته",
  },
  {
    id: "mistral-7b",
    cat: "llm",
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
    useForFa: "پاسخ لحظه‌ای در چت، استخراج داده از فرم و فاکتور، و برچسب‌گذاری خودکار تیکت‌ها.",
    descFa:
      "کوچک، سریع و کم‌مصرف؛ بیشترین توکن بر ثانیه به ازای هر دلار. برای وظایف پرتکرار مثل برچسب‌گذاری تیکت و استخراج داده از فرم‌ها بهینه است.",
    bestForFa: ["پاسخ لحظه‌ای", "استخراج داده", "دسته‌بندی تیکت"],
    servingFa: "vLLM · کانتکست ۸K · batching پیوسته",
  },
  {
    id: "qwen3-32b",
    cat: "llm",
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
    useForFa: "تحلیل قرارداد و متن حقوقی، تولید محتوای بازاریابی و پرسش‌وپاسخ پیشرفته روی اسناد.",
    descFa:
      "تعادل طلایی کیفیت و هزینه؛ در زبان فارسی و ریاضیات به‌مراتب قوی‌تر از مدل‌های ۷–۸B است و همچنان روی سخت‌افزار میانی قابل اجراست.",
    bestForFa: ["تحلیل قرارداد", "نوشتن محتوا", "پرسش‌وپاسخ پیشرفته"],
    servingFa: "vLLM · کانتکست ۸K · batching پیوسته",
  },
  {
    id: "llama3.3-70b",
    cat: "llm",
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
    useForFa:
      "دستیار دانش سازمانی، تحلیل گزارش‌های مدیریتی و چت‌بات‌هایی که خطا در آن‌ها پرهزینه است.",
    descFa:
      "قدرت GPT-4-class در وزن باز؛ برای دانش سازمانی حساس، تحلیل‌های پیچیده و چت‌بات‌هایی که خطا در آن‌ها پرهزینه است انتخاب می‌شود.",
    bestForFa: ["دانش سازمانی", "تحلیل پیچیده", "چت سطح بالا"],
    servingFa: "vLLM · کانتکست ۸K · batching پیوسته",
  },
  /* ------------------------ AGENTIC · عامل هوشمند ------------------------ */
  {
    id: "llama3.1-8b",
    cat: "agentic",
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
    useForFa: "ایجنت‌های n8n و Flowise، فراخوانی تابع و API، و گردش‌کارهای چندمرحله‌ای خودکار.",
    descFa:
      "استاندارد صنعت با اکوسیستم ابزار بی‌نظیر؛ در فراخوانی تابع (Tool Calling) پایدار است و برای ایجنت‌هایی که به n8n و APIها وصل می‌شوند انتخاب اول است.",
    bestForFa: ["ایجنت سازمانی", "فراخوانی تابع", "اتوماسیون گردش‌کار"],
    servingFa: "vLLM · JSON mode · tool-calling فعال",
  },
  {
    id: "mistral-small-24b",
    cat: "agentic",
    en: "MISTRAL SMALL · 24B",
    fa: "میسترال اسمال ۲۴ میلیاردی",
    params: "24B",
    precision: "FP16",
    weightsGb: 47,
    kvGbPerUser: 1.3,
    gpu: "l40s",
    minGpus: 2,
    accent: "#ff9e64",
    tagFa: "ایجنت چندزبانه و به‌صرفه",
    useForFa:
      "ایجنت RAG سازمانی، دستیار چندزبانه و گردش‌کارهایی که Function Calling پایدار می‌خواهند.",
    descFa:
      "مدل چندزبانهٔ کاربردی با توانایی Function Calling؛ گزینهٔ محبوب شرکت‌هایی که کیفیت میان‌رده می‌خواهند اما بودجهٔ H100 ندارند.",
    bestForFa: ["ایجنت RAG", "چندزبانه", "گزارش‌سازی"],
    servingFa: "vLLM · JSON mode · tool-calling فعال",
  },
  /* ------------------------ REASONING · استدلال و کد ------------------------ */
  {
    id: "ds-r1-70b",
    cat: "reasoning",
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
    useForFa:
      "حل مسئلهٔ ریاضی و منطقی، کدنویسی و دیباگ، و تحلیل‌هایی که زنجیرهٔ فکر باید قابل نمایش باشد.",
    descFa:
      "نسخهٔ دیستیل‌شدهٔ R1 با استدلال مرحله‌به‌مرحله؛ برای کدنویسی، حل مسئلهٔ ریاضی و سناریوهایی که باید منطق پاسخ قابل پیگیری باشد.",
    bestForFa: ["استدلال ریاضی", "کدنویسی", "تحلیل چندمرحله‌ای"],
    servingFa: "vLLM · کانتکست ۸K · خروجی زنجیرهٔ فکر",
  },
  {
    id: "deepseek-v3",
    cat: "reasoning",
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
    useForFa:
      "کیفیت حداکثری متن و کد، RAG سازمانی در مقیاس بزرگ و جایگزین کامل مدل‌های بسته روی سرور خودتان.",
    descFa:
      "معماری MoE با ۳۷ میلیارد پارامتر فعال در هر توکن؛ کیفیت در سطح بهترین مدل‌های تجاری، کاملاً روی سرور خودتان. حداقل یک نود ۸ کارته H200 می‌خواهد.",
    bestForFa: ["کیفیت حداکثری", "RAG سازمانی", "کد و استدلال سنگین"],
    servingFa: "SGLang / vLLM · FP8 · کانتکست ۸K",
  },
  /* ------------------------- IMAGE · تولید تصویر ------------------------- */
  {
    id: "sdxl",
    cat: "image",
    en: "SDXL 1.0",
    fa: "استیبل دیفیوژن XL",
    params: "3.5B",
    precision: "FP16",
    weightsGb: 7,
    kvGbPerUser: 2.5,
    gpu: "rtx4090",
    minGpus: 1,
    accent: "#e2ff6f",
    tagFa: "تصویرسازی کلاسیک متن‌باز",
    useForFa:
      "ساخت بنر و آواتار، تصویرسازی محتوا با LoRA شخصی‌سازی‌شده و ویرایش تصویر با ControlNet.",
    descFa:
      "پرکاربردترین مدل تصویرساز متن‌باز با اکوسیستم عظیم LoRA و ControlNet؛ روی یک کارت مصرفی اجرا می‌شود و برای حجم بالای تولید تصویر مقرون‌به‌صرفه است.",
    bestForFa: ["بنر و آواتار", "LoRA اختصاصی", "حجم تولید بالا"],
    servingFa: "Diffusers · ~۳۰ گام · ۱۰۲۴×۱۰۲۴ در هر تولید",
  },
  {
    id: "flux.1-dev",
    cat: "image",
    en: "FLUX.1 · DEV",
    fa: "فلاکس ۱ دیو",
    params: "12B",
    precision: "FP16",
    weightsGb: 23.5,
    kvGbPerUser: 4,
    gpu: "l40s",
    minGpus: 1,
    accent: "#ff5d5d",
    tagFa: "کیفیت تصویر در ردهٔ تجاری",
    useForFa:
      "تصویرسازی حرفه‌ای برند، نوشتن متن داخل تصویر (پوستر) و رتوش واقع‌گرایانهٔ عکس محصول.",
    descFa:
      "دقیق‌ترین مدل متن‌باز در پیروی از پرامپت و متن‌نویسی داخل تصویر؛ جزئیات به‌طور محسوسی بهتر از SDXL — در عوض سخت‌افزار قوی‌تر می‌خواهد.",
    bestForFa: ["متن داخل تصویر", "فتورئالیسم بالا", "ویرایش معنایی"],
    servingFa: "ComfyUI / Diffusers · ~۲۸ گام · ۱۰۲۴×۱۰۲۴",
  },
  /* ------------------------- VIDEO · تولید ویدیو ------------------------- */
  {
    id: "ltx-video",
    cat: "video",
    en: "LTX-VIDEO · 2B",
    fa: "ال‌تی‌ایکس ویدیو",
    params: "2B",
    precision: "FP16",
    weightsGb: 4.8,
    kvGbPerUser: 10,
    gpu: "l40s",
    minGpus: 1,
    accent: "#ff70d9",
    tagFa: "ویدیوی سریع و به‌صرفه",
    useForFa:
      "کلیپ کوتاه ۵ ثانیه‌ای برای شبکه‌های اجتماعی، تبدیل عکس به ویدیو و پیش‌نمایش استوری‌بورد.",
    descFa:
      "سبک‌ترین مدل ویدیوی متن‌بازِ جدی؛ روی یک کارت L40S چند تولید همزمان جا می‌شود و برای پیش‌نمایش سریع و محتوای شبکه‌های اجتماعی ساخته شده است.",
    bestForFa: ["کلیپ تبلیغاتی کوتاه", "عکس به ویدیو", "استوری‌بورد متحرک"],
    servingFa: "Diffusers · ۷۲۰p · ۵ ثانیه · ۲۴fps در هر تولید",
  },
  {
    id: "cogvideox-5b",
    cat: "video",
    en: "COGVIDEOX · 5B",
    fa: "کاگ‌ویدیو ۵ میلیاردی",
    params: "5B",
    precision: "FP16",
    weightsGb: 11.5,
    kvGbPerUser: 14,
    gpu: "l40s",
    minGpus: 1,
    accent: "#ffc46f",
    tagFa: "ویدیو با انسجام حرکتی بالا",
    useForFa: "تیزر محصول و کلیپ معرفی برند با حرکت دوربین روان و ساخت ویدیو از اسکریپت فارسی.",
    descFa:
      "مدل ویدیوی Zhipu با انسجام حرکتی قوی و درک بهتر پرامپت‌های پیچیده؛ برای کلیپ‌های برند و تیزرهای محصول جدی‌ترین گزینهٔ متن‌باز است.",
    bestForFa: ["تیزر و موشن‌برند", "حرکت دوربین روان", "پرامپت پیچیده"],
    servingFa: "Diffusers · ۷۲۰p×۴۸ فریم در هر تولید",
  },
  /* ------------------------- AUDIO · صوت و گفتار ------------------------- */
  {
    id: "whisper-large-v3",
    cat: "audio",
    en: "WHISPER · LARGE-V3",
    fa: "ویسپر لارج v3",
    params: "1.55B",
    precision: "FP16",
    weightsGb: 3.1,
    kvGbPerUser: 0.7,
    gpu: "rtx4090",
    minGpus: 1,
    accent: "#66ffe6",
    tagFa: "گفتار به متن فارسی و چندزبانه",
    useForFa: "پیاده‌سازی جلسات و تماس‌ها، زیرنویس خودکار ویدیو و ورودی صوتی چت‌بات تلفنی.",
    descFa:
      "استاندارد واقعی تشخیص گفتار متن‌باز؛ پشتیبانی از فارسی با نرخ خطای پایین، اجرای زنده روی یک کارت و خروجی زمان‌بندی‌شدهٔ کلمه‌به‌کلمه برای زیرنویس.",
    bestForFa: ["زیرنویس خودکار", "پیاده‌سازی تماس", "چت‌بات صوتی"],
    servingFa: "faster-whisper · استریم زنده · خروجی SRT",
  },
  {
    id: "kokoro-tts",
    cat: "audio",
    en: "KOKORO · 82M",
    fa: "کوکورو TTS",
    params: "82M",
    precision: "FP16",
    weightsGb: 0.2,
    kvGbPerUser: 0.3,
    gpu: "rtx4090",
    minGpus: 1,
    accent: "#ff9ec4",
    tagFa: "صدای طبیعی و بسیار ارزان",
    useForFa: "خواندن اخبار و مقالات، پاسخ صوتی ایجنت‌ها و تولید پادکست خودکار از متن.",
    descFa:
      "مدل تبدیل متن به گفتارِ فوق‌سبک با کیفیت شگفت‌آور؛ هزینهٔ استقرارش کسری از هر مدل دیگری در این سالن است و برای خروجی صوتی ربات‌ها ایده‌آل است.",
    bestForFa: ["متن به گفتار", "پادکست خودکار", "پاسخ صوتی ایجنت"],
    servingFa: "Kokoro ONNX · خروجی ۲۴kHz · تأخیر ~۱۰۰ms",
  },
  /* ------------------------ EMBED · جست‌وجو و RAG ------------------------ */
  {
    id: "bge-m3",
    cat: "embed",
    en: "BGE-M3",
    fa: "بی‌جی‌ای M3",
    params: "568M",
    precision: "FP16",
    weightsGb: 1.2,
    kvGbPerUser: 0.15,
    gpu: "rtx4090",
    minGpus: 1,
    accent: "#c0ff5e",
    tagFa: "موتور جست‌وجوی معنایی",
    useForFa:
      "جست‌وجوی معنایی در اسناد سازمانی، بازیابی برای RAG و دسته‌بندی خودکار تیکت‌ها و اسناد.",
    descFa:
      "امبدینگ چندزبانه با پشتیبانی از فارسی؛ کوچک، سریع و ارزان — ستون فقرات هر سیستم RAG و جست‌وجوی هوشمند سازمانی.",
    bestForFa: ["جست‌وجوی معنایی", "بازیابی RAG", "خوشه‌بندی اسناد"],
    servingFa: "sentence-transformers · بردار ۱۰۲۴بعدی · + FAISS",
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
