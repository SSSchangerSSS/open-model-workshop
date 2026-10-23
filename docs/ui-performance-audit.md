# ممیزی UI و کارایی — هوش برتر (open-model-workshop)

این سند در دو فاز تکمیل می‌شود: baseline (قبل از تغییر) و after (بعد از تغییر).
همهٔ اعداد واقعی و از خروجی دستورهای این مخزن هستند؛ بدون دادهٔ میدانی (RUM) صرفاً
اندازه‌گیری آزمایشگاهی گزارش می‌شود.

## ۱) Baseline — 2026-10-24، کامیت ed9b967 (main)

### وضعیت دستورها

| دستور | نتیجه |
|---|---|
| `bun run lint` | exit 0 — 0 error، 11 warning (react-refresh/only-export-components در فایل‌های ui و scroll-progress) |
| `tsc --noEmit` (script typecheck وجود نداشت؛ دستی اجرا شد) | **13 خطای type واقعی** — MatrixRain.tsx(28)، tour.ts (10 مورد، noUncheckedIndexedAccess)، vite.config.ts(16) |
| `bun run test` | 1 فایل، 1 تست پاس (app-routing) |
| `bun run build` (SSR/Lovable) | موفق |
| `PAGES_BASE_PATH=/open-model-workshop/ bun run build` | موفق — ۶ صفحه pre-render شد |

### اندازهٔ فایل‌های خروجی (production، سرد)

| فایل | حجم | gzip |
|---|---|---|
| `assets/index-*.js` (entry مشترک) | 347.51 kB | 111.08 kB |
| `assets/three-shared-*.js` (lazy — three.js) | 927.93 kB | 247.55 kB |
| `assets/BloomLayer-*.js` (lazy — postprocessing) | 82.98 kB | 22.66 kB |
| `assets/styles-*.css` | 118.23 kB | 19.91 kB |
| `assets/hardware-*.js` (route) | 44.05 kB | 13.61 kB |
| `assets/sizing-*.js` (shared data) | 55.31 kB | 15.08 kB |

بودجهٔ اولیهٔ موبایل (~250KB gzip): entry (111KB gzip) + styles (19.9KB) + route chunk +
… بدون three.js پایین‌تر از بودجه است؛ سهم اصلی entry است (TanStack router/runtime).

### درخواست‌های اولیه و preload (خروجی SSG واقعی)

- `index.html`: modulepreload های entry/routes/tour/device/Reveal/آیکون‌ها/MatrixBackdrop —
  **بدون** preload سه‌بعدی (خوب).
- `hardware/index.html`: preload سه‌بعدی ندارد، اما `GalaxyReveal` بعد از idle **روی همهٔ
  دستگاه‌ها از جمله موبایل** چانک ~950KB three.js را دانلود می‌کند (idle-کردن ≠ جلوگیری
  از دانلود روی دستگاه ضعیف).
- `#boot-overlay` در HTML prerendered همهٔ صفحات هست و **هیچ noscript/جایگزینی ندارد** —
  بدون JS، محتوا برای همیشه پوشیده می‌ماند.
- `<link rel="icon" href="/favicon.ico">` ریشه‌محور است — زیر `/open-model-workshop/` می‌شکند.

### باگ‌های قطعی بازتولیدشده (کد review)

1. `Intro.tsx:76` — `setTimeout(setGone, 3900)`؛ setter با `undefined` صدا زده می‌شود،
   state عوض نمی‌شود و **اینترو هرگز unmount نمی‌شود** (صدها عنصر متحرک در DOM می‌مانند).
2. `Datacenter.tsx:28` — `setTimeout(setReady, 1200)`؛ همان الگو — در مرورگرهای بدون
   `requestIdleCallback`، صحنهٔ سه‌بعدی هرگز ظاهر نمی‌شود. ضمناً هندل `requestIdleCallback`
   هیچ‌وقت cancel نمی‌شود.
3. `hardware.tsx useGalaxyReveal` — callback درست است (`fire = () => setReady(true)`) اما
   هندل idle cancel نمی‌شود.
4. `DatacenterScene.buildRacks` — `modelZ = [-9, -15.5, -22, -28.5]` در برابر z های تولیدشده
   `8.5 - i*3.0` (…, -6.5, **-9.5**, -12.5, **-15.5**, -18.5, **-21.5**, -24.5, **-27.5**, …):
   فقط `‑15.5` (Llama) تطبیق می‌کند؛ رک‌های Qwen، DeepSeek و Mistral هرگز ساخته نمی‌شوند
   و کلیک/highlight سه مدل کار نمی‌کند.
5. `sizing.ts sizeFor` — `users` اعتبارسنجی نمی‌شود: `users=0 → pricePerUser=Infinity`،
   منفی/اعشاری → KV منفی/اعشاری.
6. `compare.tsx` — تشخیص «داده ندارد» با falsy (`!row.m[key]`) → عدد ۰ معتبر «موجود» حساب
   نمی‌شود؛ `max=0` → عرض میله `NaN%`.
7. `Reveal.tsx Counter` — بدون JS مقدار «۰» در HTML اولیه می‌ماند (گمراه‌کننده)؛ حلقهٔ rAF
   بعد از unmount ادامه می‌یابد (cleanup ندارد).
8. `Reveal` — در HTML اولیه `opacity:0` است؛ بدون JS محتوای داخل Reveal هرگز دیده نمی‌شود.
9. `__root.tsx` — favicon ریشه‌محور (بند بالا)؛ 404/خطا انگلیسی و بدون اقدام فارسی.
10. `ContactTerminal` — خطای Clipboard فقط در ترمینال نمایش داده می‌شود اما در
    `ChannelCard` کاملاً ساکت است؛ `href` کانال‌ها تعریف شده ولی **هرگز به لینک تبدیل
    نمی‌شود**؛ دکمهٔ کپی داخل کارت است (لینک تودرتو ندارد — مشکل معکوس: لینک غایب است).
11. ادعاهای بی‌پشتوانه: `ContactTerminal LOG_LINES` شامل `> encrypt(aes-256) ✔`؛
    `contact.tsx` شامل `[tunnel: aes-256 · operator standing by]`؛ وضعیت «دفتر باز» فقط از
    جمعه‌بودن نتیجه می‌شود؛ `HeroTerminal status` اعداد تصادفی را به‌عنوان تلمتری زنده
    نشان می‌دهد؛ `benchmarks.ts` desc قیمت API می‌گوید «اجرای خصوصی رایگان است».
12. `Shell.tsx` منوی موبایل — dialog دست‌ساز بدون focus trap/بازگردانی فوکوس/inert و بدون
    aria-controls؛ در resize به دسکتاپ منوی باز رها می‌شود.
13. `ScrollFX.tsx` — `ScrollProgress`، `useProgress` (در ContainerScroll/Parallax/StickySteps)
    هر کدام scroll listener و setState مستقل دارند؛ ارتفاع صفحه در هر اسکرول دوباره
    اندازه‌گیری می‌شود نه در resize.
14. `SectorHUD.tsx` — حلقهٔ rAF دائمی حتی در سکون.
15. `StickySteps` — بخش ~280vh + `h-screen` روی موبایل.
16. فونت بدنه = «Vazir Matrix» (نمایشی/ماتریکسی) برای کل متن فارسی — خوانایی پایین.
17. `crt-scanlines` سراسری با `mix-blend-mode: overlay` روی همهٔ متن/فرم‌ها + scanline روی
    پنجرهٔ ترمینال (`.terminal-window::after`) که روی input ها می‌افتد.

### ریسک‌های نیازمند تست (قطعی نیست، باید سنجیده شود)

- رفتار `content-visibility:auto` با `contain-intrinsic-size` ثابت (جهش ارتفاع).
- حفظ شدن قفل اسکرول در مرز تغییر اندازه به دسکتاپ.
- دانلود خودکار three.js در حالت lite فقط از مسیر رندر شرطی (چانک preload نمی‌شود —
  باید با تست/شبکه تأیید شود).
- lifecycle صحنهٔ fixed در /services و /contact (توقف رندر خارج از دید).

### پیشنهادهای طراحی (در صورت موافقت اعمال شد/می‌شود)

- عنوان ارزش‌محور خانه: «هوش مصنوعی و اتوماسیون، روی زیرساخت خودتان» + دو CTA.
- فونت بدنهٔ فارسی خوانا self-hosted (Vazirmatn، OFL) — ماتریکسی فقط برند/تزئین.
- حذف افکت CRT از روی متن و فرم‌ها.
- موبایل: مقایسهٔ قبل/بعد بدون نیاز به drag.

## ۲) After — پس از اصلاحات

(در پایان کار تکمیل می‌شود.)
