# UI / Performance Audit — هوش برتر (open-model-workshop)

تاریخ: ۱۴۰۵ مهر / اکتبر ۲۰۲۶ · بازهٔ بررسی: baseline از commit `ed9b967` تا نسخهٔ فعلی این شاخه
ابزار: ESLint، tsc، Vitest (jsdom)، build واقعی Vite/Nitro، مرورگر هدست‌شده (Chromium via agent-browser) روی خروجی prerender سرویس‌شده زیر `/open-model-workshop/`

> صداقت گزارش: هر عددی که اینجا آمده از اجرای واقعی روی همین ماشین آمده است. Lighthouse و
> Chrome DevTools Performance در این محیط در دسترس نبودند (ثبت شده در «انجام‌نشده‌ها») و هیچ
> دادهٔ میدانی (CrUX/RUM) وجود ندارد؛ بنابراین INP/LCP/CLS صدک ۷۵ اندازه‌گیری نشده‌اند.
> شبیه‌سازی مرورگر، تست دستگاه واقعی نیست.

## ۱) روش baseline و نتایج قبل

- `bun run lint`: 0 error / 11 warning
- typecheck: اسکریپت وجود نداشت؛ `tsc --noEmit` دستی → **41 خطا** (tour.ts 11، DatacenterScene 11، HeroTerminal 3، MatrixRain 16)
- `bun run test`: 1 فایل / 1 تست (app-routing)
- `bun run build` (SSR) و `PAGES_BASE_PATH=/open-model-workshop/ bun run build` (SSG، 12 صفحه prerender): موفق
- حجم چانک‌های کلاینت (gzip):
  - `three-shared` (سه‌بعدی): **238KB** — با policy قبلی روی موبایلِ /hardware دانلود می‌شد
  - `index` (entry): **107KB**
- درخواست اولیه موبایل (390px، سرویس محلی خروجی SSG):
  - خانه: بدون three.js ✓ (ماتریکس ۲بعدی)
  - **/hardware: three.js بعد از ~2.4s idle دانلود می‌شد** (باگ تأییدشده با network log)
- مشکلات قابل بازتولید (با دلیل، جدا از ریسک/طراحی):
  - **قطعی**: `Intro.tsx` → `setTimeout(setGone, 3900)` مقدار true به setter نمی‌داد؛ DOM overlay هرگز حذف نمی‌شد (فقط CSS-hidden)
  - **قطعی**: `Datacenter.tsx` → fallback بدون `requestIdleCallback`: `setTimeout(setReady, 1200)` → state هرگز true نمی‌شد (صحنه هرگز ظاهر نمی‌شد)؛ handle رکوئست idle هم cancel نمی‌شد
  - **قطعی**: `buildRacks` → تطابق float مختصات؛ از 4 مدل فقط Llama (i=8, z=-15.5) به رک می‌خورد؛ Qwen/DeepSeek/Mistral برچسب/highlight/انتخاب نداشتند
  - **قطعی**: `sizing.sizeFor` → users=0 → `pricePerUser=Infinity`؛ منفی → KV منفی؛ NaN/∞ رد می‌شد
  - **قطعی**: `compare.tsx` → شمارش missing با truthiness (صفرِ معتبر = گم‌شده)؛ `max=0` → عرض میله `NaN%`
  - **قطعی**: favicon با `href="/favicon.ico"` زیر `/open-model-workshop/` → 404 (تأییدشده با curl)
  - **قطعی**: منوی موبایل بدون focus trap/restore؛ قفل اسکرول در resize به دسکتاپ باقی می‌ماند
  - **قطعی**: بدون JS، Reveal محتوا را نامرئی می‌کرد و Counter صفرِ گمراه‌کننده نشان می‌داد؛ rAF حلقهٔ Counter بعد از unmount ادامه داشت؛ ScrollProgress در هر رویداد scroll سایز کل سند را می‌خواند
  - **ریسک/ظاهری**: تلمتری تصادفی با برچسب «live»، UPTIME 99.98%، «آپ‌تایم تضمینی»، `encrypt(aes-256)`، کانال‌های تماس بدون تأیید، «نمونه‌کارهای واقعی» بدون مدرک
  - **طراحی**: فونت بدنه = Vazir Matrix (خوانایی کم)، hero موبایل با absolute و ارتفاع ثابت

## ۲) تغییرات انجام‌شده (مسیر فایل)

### باگ‌های قطعی
| فایل | تغییر |
|---|---|
| `src/components/Intro.tsx` | `setGone(true)` صریح؛ خروج از مسیر بحرانی موبایل: overlay فقط وقتی `html.intro-armed` هست (JS روشن، اولین بازدید، عرض ≥768، motion مجاز) — اسکریپت inline در `__root.tsx` قبل از اولین paint |
| `src/components/Datacenter.tsx`, `src/routes/hardware.tsx`, `src/lib/idle.ts` (جدید) | هوک مشترک `useWhenIdle` با callback صریح `setReady(true)` و cleanup کامل (`cancelIdleCallback` + `clearTimeout`) |
| `src/lib/datacenter-racks.ts` (جدید) + `DatacenterScene.tsx` | نگاشت صریح `MODEL_RACK_SLOTS` (side,index) به‌جای تطابق float؛ ماژول خالص بدون three.js برای تست |
| `src/lib/sizing.ts` | `sanitizeUsers`: NaN/-∞→1، +∞→سقف، کسری→floor، سقف `MAX_USERS`؛ `sizeFor` ورودی را خودش اعتبارسنجی می‌کند (صفر تقسیم ممنوع) |
| `src/routes/compare.tsx`, `src/lib/benchmarks.ts` | `isMissingMetric` (صفر ≠ ناموجود)؛ گارد max=0؛ lookup دفاعی مدل/بنچ؛ سطر «ناموجود» به‌جای حذف ساکت؛ NaN از نمودار حذف |
| `src/routes/__root.tsx`, `src/lib/base.ts` (جدید), `src/lib/error-page.ts` | favicon/canonical/لینک خانه با `withBase(BASE_URL)`؛ 404 و خطا فارسی با اقدام کاربردی |
| `src/components/Shell.tsx` | منوی موبایل با Radix Dialog (focus trap/restore، Escape، scroll-lock با cleanup، عنوان قابل‌خواندن، aria-controls)؛ بستن خودکار در resize به دسکتاپ؛ skip link؛ حذف ادعای UPTIME/SYS.ONLINE |
| `src/components/ContactTerminal.tsx`, `src/routes/contact.tsx`, `src/lib/contact.ts` (جدید) | حذف `aes-256`؛ خطای Clipboard با پیام و پیش‌نمایش قابل‌انتخاب؛ کپی جدا از لینک؛ کانفیگ مشترک با فلگ `verified` و نشان «تأییدنشده»؛ وضعیت دفتر فقط با `OFFICE_HOURS_TEHRAN` تنظیم‌شده (پیش‌فرض: بدون ادعا)؛ preset مدل/کاربر از URL |
| `src/components/Reveal.tsx` | Reveal: بدون JS/reduced-motion/in-view → محتوا دیده می‌شود (انیمیشن opt-in با `data-reveal`)؛ Counter: مقدار نهایی به‌عنوان پیش‌فرض، rAF با cleanup |
| `src/components/ScrollFX.tsx` | یک listener مشترک rAF-throttled؛ transform با ref و بدون setState در فریم؛ اندازه‌گیری ارتفاع با ResizeObserver نه هر اسکرول؛ StickySteps در همه‌جا ارتفاع طبیعی (حذف h-screen چندصدvh) |
| `src/components/Interactive.tsx`, `SectorHUD.tsx` | افکت‌های pointer فقط با hover:fine و بدون reduced-motion؛ HUD از حلقهٔ rAF دائمی به scroll-driven |
| `src/routes/hardware.tsx` | موبایل: نمای پیش‌فرض = فهرست با جست‌وجو/دسته/شمارش/حالت خالی؛ جزئیات در Sheet پایین با ورودی عددی + slider + preset؛ سه‌بعدی فقط با دکمهٔ «فعال‌کردن نمای سه‌بعدی» (دانلود chunk فقط با intent)؛ انتخاب با `id` پایدار؛ CTA با `?model=&users=` به تماس |
| `src/components/SceneBoundary.tsx` (جدید) | ErrorBoundary + مدیریت `webglcontextlost` با fallback قابل استفاده برای هر دو صحنه |
| `src/routes/index.tsx`, `services.tsx`, `showcase.tsx`, `HeroTerminal.tsx`, `CorridorStatus.tsx` | صادق‌سازی داده‌ها (نمایشی/برآورد/هدف)؛ کنترل قبل/بعدِ بدون drag در موبایل؛ marquee فقط دسکتاپ؛ حذف meter دائمی کارت‌ها |

### سیستم طراحی / موبایل
- `src/styles.css`: بدنه → **Vazirmatn** (متغیر، سلف‌هاست، OFL — `src/assets/fonts/Vazirmatn-Variable.woff2` + `OFL.txt`)؛ Vazir Matrix فقط برند/عناوین کوتاه/جزئیات ترمینال (`--font-display`)؛ 16px پایه با line-height 1.75؛ input ≥16px (بدون زوم iOS)؛ `:focus-visible` سراسری؛ hero موبایل flow با safe-area و بدون absolute؛ marquee استاتیک در موبایل؛ اسکریم خوانایی پشت کپی hero
- `.skip-link` و هدف‌های لمسی ≥44px در کنترل‌های جدید (`min-h-11`)

## ۳) نتایج بعد (همان تنظیمات، سرویس محلی خروجی SSG)

- lint: **0 error** / 11 warning (مثل baseline — همگی `react-refresh` در ui/* و ماژول‌های داده)
- `bun run typecheck` (اسکریپت جدید در package.json): **0 خطا**
- `bun run test`: **8 فایل / 30 تست — همه پاس** (جدید: نگاشت ۴ رک، callback بدون `requestIdleCallback` و cleanup، صفر/ناموجود نمودار، مرزهای users، منو و فوکوس، کپی موفق/ناموفق، فایندر بدون WebGL، routing)
- build SSR و SSG (12 صفحه): موفق؛ favicon در خروجی prerender = `/open-model-workshop/favicon.ico` ✓ (بود: `/favicon.ico` → 404)
- حجم چانک‌ها (gzip): `three-shared` 238KB (فقط با intent/دسکتاپ) · `index` **99KB** (−8) · Reveal 17KB · hardware 14KB · sizing 14KB
- بودجهٔ bundle اولیه موبایل (~250KB هدف): entry+routes+صفحه ≈ **130–150KB gzip** — زیر بودجه؛ سه‌بعدی خارج از مسیر اولیه موبایل
- رفتار مرورگر (390×844، خروجی SSG):
  - خانه: بدون اینترو، بدون three.js، دو CTA دیده می‌شوند، scrollWidth-clientWidth = **0**
  - /hardware: قبل از کلیک، **هیچ درخواست three.js نیست**؛ بعد از «فعال‌کردن نمای سه‌بعدی» فقط یک بار `three-shared` لود می‌شود؛ خروج از نمای ۳بعدی ممکن است
  - /contact?model=…&users=25: موضوع و متن پیش‌نویس از پارامتر پر می‌شود
- فونت‌ها: JetBrains Mono 31KB + VazirMatrix sub ×2 ≈ 58KB + Vazirmatn 111KB (تک‌فایل متغیر؛ جایگزین فونت‌های بیشتر نشد — فونت اضافه‌ای حذف‌شدنی پیدا نکردیم)
- اسکرین‌شات‌ها: `docs/screenshots/{before,after}-{home,hardware,contact}-mobile-390.png` و `after-home-desktop-1440.png`

## ۴) فرض‌های ثبت‌شده

1. مقصد تماس‌ها تأیید نشده → همهٔ کانال‌ها `verified:false` با نشان «تأییدنشده»؛ ارسال واقعی وجود ندارد (فقط پیش‌نویس) — تا مالک `src/lib/contact.ts` را تأیید کند.
2. `OFFICE_HOURS_TEHRAN = null` (ساعت کاری واقعی در دسترس نبود) → هیچ ادعای باز/بسته نمایش داده نمی‌شود؛ با تنظیم کردن، وضعیت از ساعت تهران محاسبه می‌شود.
3. canonical/sitemap روی هاست `ssschangersss.github.io/open-model-workshop/` ثابت مانده‌اند؛ استقرار ریشهٔ دامنه مسیر درست را از `BASE_URL` می‌گیرد ولی هاست canonical را باید در استقرار جدید به‌روزرسانی کرد.
4. اعداد صفحهٔ «نمونه‌کارها» برآورد/سناریوی مرجع معرفی شدند، چون مدرک مستند در ریپو نیست.
5. تست فایل‌های UI با mock کردن ماژول router در Shell انجام شد چون RouterProvider کامل + شل HTML در jsdom teardown نمی‌شد؛ رفتار دیالوگ با Radix واقعی است.

## ۵) انجام‌نشده‌ها / محدودیت‌ها (صادقانه)

- **Lighthouse اجرا نشد** — ابزار در این محیط نصب نبود؛ هدف ۹۰+ ادعا نمی‌شود. برای اندازه‌گیری: `npx lighthouse http://localhost:8902/open-model-workshop/ --preset=perf --form-factor=mobile` روی خروجی SSG.
- **دستگاه واقعی / شبکهٔ واقعی**: همهٔ بررسی‌ها شبیه‌سازی viewport است؛ Galaxy M12 واقعی تست نشد. ذخیره‌سازی مقادیر Save-Data/deviceMemory در `isCompactDevice` حفظ شده ولی روی سخت‌افزار واقعی سنجیده نشده.
- **دادهٔ میدانی CWV وجود ندارد**؛ LCP/INP/CLS صدک ۷۵ گزارش نمی‌شود و TBT جای آن داده نمی‌شود.
- سه‌بعدی با context-loss واقعی تست نشد (فقط مسیر کد + boundary).
- `?tier=full|lite` برای تست حفظ شده.

## ۶) تعریف اتمام — وضعیت فعلی

- موبایل بدون اینتروی مسدودکننده ✓ (دسکتاپ: اینترو فقط اولین بازدید، با skip و حذف واقعی DOM)
- بدون نیاز به سه‌بعدی: محاسبه‌گر/مقایسه/جست‌وجو کامل بدون Canvas ✓ (تست‌شده)
- قابلیت‌های قبلی حذف نشده‌اند: ۶۱ مدل، ۹ دسته، بنچمارک، تور راهرو، ترمینال، شبیه‌ساز، فیلتر خدمات ✓
- تماس صادقانه، خطاهای قابل بازیابی، 404 فارسی ✓
- بهبود عملکرد با دادهٔ قابل بررسی: network log و اندازهٔ چانک در همین سند؛ بدون درصدسازی
