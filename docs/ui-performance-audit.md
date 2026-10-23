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

## ۲) After — پس از اصلاحات (کامیت‌های 1d2235e → فعلی)

همهٔ اعداد از خروجی واقعی همین مخزن است. روش مقایسه: production build یکسان
(PAGES_BASE_PATH=/open-model-workshop/، خروجی SSG)، cache سرد (rm -rf .output
node_modules/.nitro)، سه اجرا — خروجی سه اجرا بایت‌به‌بایت یکسان بود، پس میانه = همان مقدار.

### وضعیت دستورها (بعد)

| دستور | نتیجه |
|---|---|
| `bun run lint` | exit 0 — 0 error، 8 warning (همه react-refresh/only-export-components در فایل‌های ui — از baseline کاهش از 11) |
| `bun run typecheck` (script جدید `tsc --noEmit`) | exit 0 — ۰ خطا (baseline: 13 خطا) |
| `bun run test` | 9 فایل، **40 تست پاس** (baseline: 1 تست) |
| `bun run build` | موفق |
| `PAGES_BASE_PATH=... bun run build` | موفق — ۶ صفحه pre-render + 404.html در CI |

### اندازهٔ فایل‌های خروجی — قبل → بعد (SSG، سرد، میانهٔ ۳ اجرا)

| فایل | قبل | بعد | Δ gzip |
|---|---|---|---|
| `index-*.js` (entry مشترک) | 347.59 kB / **111.11 gzip** | 145.18 kB / **47.17 gzip** | **−64 gzip (−58%)** |
| `styles-*.css` | 118.29 / 19.93 | 85.13 / 15.16 | −4.8 gzip |
| `three-shared-*.js` (کد صحنه‌ها) | 927.93 / 247.55 | 19.07 / 7.14 | خود کتابخانهٔ three.js (~909 kB) حالا چانک مستقلِ فقط-سه‌بعدی است |
| `sizing-*.js` (دادهٔ ۶۱ مدل) | 55.31 / 15.08 | 55.45 / 15.17 | ثابت (داده‌ها حفظ شد) |
| `BloomLayer-*.js` (lazy) | 82.98 / 22.65 | 82.99 / 22.62 | ثابت |

بودجهٔ اولیهٔ موبایل (~250KB gzip): صفحهٔ خانه در حالت lite ≈ **95KB gzip**
(entry 47 + routes 11.6 + css 15.2 + sizing 15.2 + Reveal ~5 + MatrixBackdrop 1.1 + متفرقه) —
درون بودجه. سهم‌ها از خروجی واقعی build خوانده شد.

### اثبات شبکهٔ واقعی ( PerformanceTrace با resource timing مرورگر)

- بارگذاری موبایل `/hardware` (حالت پیش‌فرض): **صفر** درخواست برای three/Galaxy/Bloom —
  resource-timing مرورگر: `0`. فایل‌های JS واقعاً دریافتی: index، routes، hardware، sizing،
  Reveal، use-idle-reveal، آیکون‌ها.
- کلیک «فعال‌کردن نمای سه‌بعدی»: همان لحظه ۲ چانک سه‌بعدی fetch می‌شود — سه‌بعدی کاملاً
  opt-in است.
- overrideهای `?tier=full|lite` و `?idle=0` حفظ/افزوده شدند (تست دارند).

### تست‌های افزوده‌شده (9 فایل، 40 تست)

1. `rack-layout` — نگاشت صریح هر ۴ رک مدل (جانشین تطبیق شکنندهٔ مختصات)
2. `sizing` — clampUsers (۰/منفی/اعشاری/NaN/±∞/سقف) + سلامت فیزیکی خروجی برای ۶۱ مدل
3. `benchmarks` — صفر = دادهٔ معتبر، NaN/∞ = «ناموجود»؛ سازگاری BENCH با کاتالوگ؛ preset ها
4. `contact` — ساعت کاری پیکربندی‌پذیر (جمعه بسته، مرزهای ساعته)؛ کانال‌های مشترک
5. `use-idle-reveal` — مسیر بدون requestIdleCallback (callback با مقدار صریح)، cancel هندل idle، ?idle=0
6. `shell-menu` — منوی موبایل: skip link، aria-expanded/controls، فوکوس داخل dialog، Escape، بستن با ناوبری
7. `contact-copy` — کپی موفق/ناموفق (alert قابل مشاهده + پیش‌نویس انتخاب‌پذیر)، لینک واقعی کانال‌ها بدون دکمهٔ تودرتو
8. `hardware-no-webgl` — محاسبه‌گر کامل بدون هیچ canvas/WebGL (jsdom کلاً canvas ندارد)، clamp ورودی کاربر، حالت خالی جست‌وجو
9. `not-found` — 404 فارسی با اقدام بازگشت

### اسکرین‌شات‌های قبل/بعد

مسیر: `docs/screenshots/before|after/`
- `home-mobile.png` (390)، `home-320.png`، `home-desktop.png` (1440)
- `hardware-mobile.png` (فهرست پیش‌فرض)، `hardware-sheet.png` (پنل موبایل)،
  `hardware-3d-mobile.png` (پس از opt-in)، `hardware-desktop-3d.png` (tier=full)، `hardware-768.png`
- `contact-mobile.png`، `menu-open-390.png`، `notfound-320.png`

### شبیه‌سازی ≠ تست دستگاه واقعی

بررسی‌ها در کروم هدلس (دسکتاپ 1440 و موبایل 390/320/768 شبیه‌سازی‌شده) انجام شد.
**دستگاه واقعی لمس‌شدنی در دسترس نبود**؛ INP/انگشت‌لمس، کیبورد واقعی iOS/Android و
Save-Data روی دستگاه واقعی باید با یک دستگاه فیزیکی تأیید شود. Lighthouse اجرا نشد
(کروم کامل/سرویس Lighthouse در محیط در دسترس نبود) — عدد Lighthouse ادعا نمی‌شود.
دادهٔ میدانی (RUM) وجود ندارد؛ LCP/INP/CLS صدک ۷۵ قابل گزارش نیست.

### موارد حل‌نشده / باقی‌مانده

- **ارسال واقعی فرم**: endpoint سمت سرور تنظیم نشده؛ فرم فقط پیش‌نویس می‌سازد (عمدی و صادقانه).
- **تأیید کانال‌های تماس**: هندل‌ها از محتوای قبلی سایت منتقل شدند؛ owner باید واقعی‌بودنشان را تأیید کند (verified=false در `src/lib/contact.ts`).
- **هدرهای کش / CDN**: در اختیار GitHub Pages است؛ تنظیم دستی ندارد.
- **reduced-motion روی دستگاه واقعی** و **صف‌بندی INP** نیازمند تست فیزیکی.
- react-refresh warnings در فایل‌های باقی‌ماندهٔ ui (button/dialog/sheet/slider) بی‌خطرند (فقط DX).

