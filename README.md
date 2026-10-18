<div align="center">

# هوش برتر — Open Model Workshop

**سایت رسمی خدمات اتوماسیون فرایندها و زیرساخت هوش مصنوعی خودمیزبان (Self-Hosted)**

اتوماسیون کسب‌وکار با n8n و Flowise · استقرار سرور هوش مصنوعی · بستن سخت‌افزار GPU · اجرای مدل‌های Open-Weight

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-SSR-FF4154)](https://tanstack.com/start)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Bun](https://img.shields.io/badge/Bun-Package_Manager-FBF0DF?logo=bun&logoColor=black)](https://bun.sh)
[![Built with Lovable](https://img.shields.io/badge/Built_with-Lovable-FF6B6B)](https://lovable.dev)

</div>

---

## 📖 درباره پروژه

این پروژه، وب‌سایت رسمی **«هوش برتر»** است؛ یک مجموعه خدمات تخصصی که به کسب‌وکارها کمک می‌کند هوش مصنوعی را **روی زیرساخت خودشان** اجرا کنند و فرایندهای تکراری را خودکار نمایند. تمرکز اصلی سایت بر سه محور است: اول، طراحی و پیاده‌سازی اتوماسیون‌های سازمانی با ابزارهایی مانند n8n و Flowise؛ دوم، مشاوره و اجرای کامل استقرار سرورهای هوش مصنوعی شامل Docker، درایورها، CUDA، مانیتورینگ و امنیت؛ و سوم، بستن (اسمبل) سخت‌افزار GPU متناسب با مدل و بودجه مشتری و راه‌اندازی مدل‌های open-weight مانند Llama، Qwen، DeepSeek و Mistral با موتورهایی مثل vLLM و Ollama.

مزیت کلیدی این رویکرد، **حفظ حاکمیت داده** است: داده‌های سازمان هرگز از زیرساخت مشتری خارج نمی‌شود، هزینه‌های ماهانه API حذف می‌شود و وابستگی به سرویس‌های خارجی و محدودیت‌های آن‌ها از بین می‌رود. سایت شامل سه صفحه اصلی است: صفحه نخست (معرفی ارزش پیشنهادی و آمارها)، صفحه خدمات (شرح کامل سرویس‌ها) و صفحه تماس (رزرو جلسه مشاوره رایگان).

## 🧩 خدمات پوشش داده‌شده در سایت

| خدمت                                | توضیح                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| 🤖 **اتوماسیون و ایجنت‌های هوشمند** | اتصال CRM، تلگرام، ایمیل و API‌ها با n8n؛ چت‌بات‌های RAG روی اسناد سازمان با Flowise |
| 🖥️ **استقرار سرور هوش مصنوعی**      | Docker، درایور و CUDA، مانیتورینگ، بکاپ‌گیری و امنیت — آماده بهره‌برداری             |
| 🔧 **بستن سخت‌افزار GPU**           | انتخاب و اسمبل قطعات متناسب با مدل موردنظر و بودجه مشتری                             |
| 🧠 **اجرای مدل‌های Open-Weight**    | Llama، Qwen، DeepSeek، Mistral با vLLM، Ollama و llama.cpp                           |

## 🛠️ پشته فناوری

| لایه                 | فناوری                                                     |
| -------------------- | ---------------------------------------------------------- |
| **فریم‌ورک**         | TanStack Start (SSR) + React 19 + TanStack Router / Query  |
| **زبان**             | TypeScript 5.8 (حالت strict)                               |
| **بیلد**             | Vite 8 + Nitro 3 (هدف پیش‌فرض Cloudflare Workers)          |
| **استایل**           | Tailwind CSS 4 + tw-animate-css + فونت وزیرمتن (Vazirmatn) |
| **کامپوننت‌ها**      | shadcn-style UI روی Radix UI + lucide-react                |
| **فرم و اعتبارسنجی** | react-hook-form + zod                                      |
| **نمودار و سه‌بعدی** | Recharts + Three.js (@react-three/fiber, drei)             |
| **تست**              | Vitest + Testing Library + jsdom                           |
| **کیفیت کد**         | ESLint 9 + Prettier + eslint-plugin-react-hooks            |
| **مدیریت پکیج**      | Bun (قفل‌شده با `bun.lock`)                                |

## 📂 ساختار پروژه

```text
├── .github/workflows/     # GitHub Actions (دیپلوی GitHub Pages)
├── public/                # فایل‌های استاتیک (favicon، robots.txt)
├── src/
│   ├── assets/            # تصاویر و فونت‌ها
│   ├── components/        # کامپوننت‌های UI (shadcn-style) و بخش‌های صفحه
│   ├── hooks/             # هوک‌های سفارشی React
│   ├── lib/               # توابع کمکی
│   ├── routes/            # مسیرهای سایت (TanStack Router)
│   │   ├── __root.tsx     # قالب ریشه (هدر/فوتر)
│   │   ├── index.tsx      # صفحه نخست
│   │   ├── services.tsx   # صفحه خدمات
│   │   └── contact.tsx    # صفحه تماس
│   ├── server.ts          # ورودی SSR (پوشش خطاهای سرور)
│   └── styles.css         # استایل‌های سراسری (Tailwind 4)
├── vite.config.ts         # کانفیگ Vite/Nitro + حالت استاتیک Pages
└── roadmap.md             # نقشه راه پروژه
```

## 🚀 شروع سریع

### پیش‌نیازها

- **Bun 1.2+** (پیشنهادی) — [راهنمای نصب](https://bun.sh/docs/installation)
- یا **Node.js 20+** همراه با npm

### نصب و اجرا

```sh
# ۱) کلون ریپازیتوری
git clone https://github.com/SSSchangerSSS/open-model-workshop.git
cd open-model-workshop

# ۲) نصب وابستگی‌ها (با Bun)
bun install

# ۳) اجرای سرور توسعه
bun run dev
```

سایت روی آدرسی که Vite اعلام می‌کند (معمولاً `http://localhost:8080`) در دسترس است.

<details>
<summary>اجرای بدون Bun (با npm)</summary>

```sh
npm install
npm run dev
```

</details>

## ⚙️ اسکریپت‌های در دسترس

| اسکریپت        | دستور (Bun)          | کارکرد                         |
| -------------- | -------------------- | ------------------------------ |
| توسعه          | `bun run dev`        | سرور توسعه با HMR              |
| بیلد پروداکشن  | `bun run build`      | بیلد SSR (هدف Cloudflare)      |
| بیلد توسعه     | `bun run build:dev`  | بیلد در حالت development       |
| پیش‌نمایش بیلد | `bun run preview`    | اجرای محلی خروجی بیلد          |
| تست            | `bun run test`       | اجرای یک‌باره تست‌ها با Vitest |
| تست مداوم      | `bun run test:watch` | تست‌ها در حالت watch           |
| لینت           | `bun run lint`       | بررسی کیفیت کد با ESLint       |
| فرمت           | `bun run format`     | یکدست‌سازی کد با Prettier      |

## 📦 استقرار (Deployment)

### GitHub Pages

این ریپازیتوری شامل یک ورک‌فلو آماده در `.github/workflows/deploy-pages.yml` است که با هر اجرا، نسخه‌ای **کاملاً استاتیک و pre-render شده (SSG)** از سایت را روی GitHub Pages منتشر می‌کند.

نحوه کار: وقتی متغیر محیطی `PAGES_BASE_PATH` ست شده باشد (فقط داخل ورک‌فلو)، کانفیگ Vite مسیر پایه را روی `/<نام-ریپازیتوری>/` تنظیم می‌کند و TanStack Start هر سه مسیر را به‌صورت HTML استاتیک prerender می‌کند. بیلدهای عادی (Lovable و اجرای محلی) بدون این متغیر، دقیقاً مانند قبل به‌صورت SSR بیلد می‌شوند و هیچ تغییری نمی‌کنند.

> ⚠️ **نکته مهم:** GitHub Pages برای ریپازیتوری‌های private فقط در پلن‌های پولی (GitHub Pro و بالاتر) در دسترس است. در پلن رایگان، برای فعال‌سازی Pages باید ریپازیتوری public شود.

### Lovable

این پروژه با [Lovable](https://lovable.dev) ساخته شده و ادامه توسعه آن از طریق [ویرایشگر Lovable](https://lovable.dev/projects/1ca2f978-9514-439a-b323-57daa885ee51) نیز امکان‌پذیر است:

- توضیح دهید چه می‌خواهید بسازید؛ Lovable کد را تولید می‌کند.
- هر تغییر در Lovable مستقیماً روی این ریپازیتوری commit می‌شود.
- مالکیت کد کاملاً در اختیار شماست؛ push به `main` با Lovable همگام می‌شود.

## 🤝 همکاری در توسعه

پیش از ارسال تغییرات، لطفاً موارد زیر را رعایت کنید:

```sh
# اطمینان از سلامت کد پیش از commit
bun run lint
bun run test
bun run build
```

سبک کد توسط Prettier و قواعد ESLint مدیریت می‌شود؛ از کامیت‌های کوچک و توصیفی استفاده کنید.

## فونت و مجوزها

هویت بصری سایت با فونت اختصاصی **«وزیرماتریکس» (Vazir Matrix)** شکل گرفته است؛ یک فونت پیکسلی/ترمینالی فارسی که به‌صورت مشتق از [وزیرمتن](https://github.com/rastikerdar/vazirmatn) ساخته شده (اسکریپت `scripts/make_matrix_font.py` در مخزن ابزارهای پروژه). وزیرمتن تحت مجوز **SIL Open Font License 1.1** منتشر می‌شود و این مشتق نیز تحت همان مجوز توزیع می‌شود؛ نام خانواده فونت برای احترام به قواعد OFL به «Vazir Matrix» تغییر یافته است. بقیه اجزای پروژه مطابق مالکیت مخزن اصلی است.
