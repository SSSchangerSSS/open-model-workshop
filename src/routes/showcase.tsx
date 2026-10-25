import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { Reveal } from "@/components/Reveal";
import { Tilt } from "@/components/Interactive";
import { ArrowLeft, Check, CirclePlay, Loader2, RotateCcw } from "lucide-react";
import {
  Boxes,
  Building2,
  FileBarChart,
  GraduationCap,
  Headset,
  LineChart,
  Mail,
  Megaphone,
  Newspaper,
  PhoneCall,
  ReceiptText,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Target,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/showcase")({
  head: () =>
    pageHead({
      title: "نمونه‌کارهای n8n و Flowise | هوش برتر",
      description:
        "۱۶ نمونه واقعی از اتوماسیون با n8n و Flowise: پشتیبانی خودکار، دستیار صوتی، پردازش فاکتور، RAG سازمانی، تولید محتوا، تحلیل قرارداد، پیش‌بینی موجودی و گزارش‌سازی.",
      ogTitle: "نمونه‌کارهای واقعی n8n و Flowise | هوش برتر",
      ogDescription:
        "چه نیازهایی با اتوماسیون و ایجنت‌های هوش مصنوعی حل شده‌اند؟ با اعداد واقعی ببینید و اجرای هر ورک‌فلو را شبیه‌سازی کنید.",
      path: "/showcase",
    }),
  component: Showcase,
});

type Stack = "n8n" | "flowise";

type Case = {
  id: string;
  icon: LucideIcon;
  industry: string;
  title: string;
  summary: string;
  stack: Stack[];
  metrics: [string, string][];
  steps: string[];
  outcome: string;
  time: string;
};

const CASES: Case[] = [
  {
    id: "support-bot",
    icon: ShoppingBag,
    industry: "فروشگاه اینترنتی",
    title: "پاسخگوی خودکار مشتریان در تلگرام و واتساپ",
    summary:
      "۶۵٪ تیکت‌ها سؤال‌های تکراری «وضعیت سفارش» و «شرایط مرجوعی» بود و تیم پشتیبانی شبانه پاسخ‌گو نبود. یک ایجنت Flowise با RAG روی رویه‌های فروشگاه و اتصال n8n به دیتابیس سفارش‌ها، پاسخ فوری و شخصی‌سازی‌شده می‌دهد.",
    stack: ["n8n", "flowise"],
    metrics: [
      ["۷۰٪", "پاسخ بدون اپراتور"],
      ["۹ ثانیه", "میانگین اولین پاسخ"],
      ["۲۴/۷", "پوشش پاسخ‌گویی"],
    ],
    steps: [
      "Webhook تلگرام/واتساپ پیام را به n8n می‌فرستد",
      "تشخیص قصد کاربر (سفارش، مرجوعی، سؤال عمومی) با طبقه‌بندی LLM",
      "سؤالات سفارش → کوئری مستقیم به API فروشگاه و کد پیگیری",
      "سؤالات دانشی → Flowise RAG روی سیاست‌ها و راهنمای محصول",
      "اگر اطمینان کم بود → تیکت انسانی در ERP + اطلاع به پشتیبان",
      "ثبت کل گفتگو در Google Sheets برای تحلیل هفتگی",
    ],
    outcome:
      "تیم پشتیبانی فقط موارد پیچیده را می‌بیند و رضایت مشتری از سرعت پاسخ دو برابر شده است.",
    time: "۲ هفته",
  },
  {
    id: "invoice-ocr",
    icon: ReceiptText,
    industry: "بازرگانی و واردات",
    title: "پردازش خودکار فاکتورهای فروشندگان",
    summary:
      "هر ماه بیش از هزار فاکتور کاغذی و PDF از فروشندگان می‌رسید و کارمند مالی ساعت‌ها داده‌ها را دستی در سیستم تایپ می‌کرد. ورک‌فلو n8n فایل‌ها را از ایمیل می‌گیرد، با OCR متن را استخراج و با LLM ساختارمند می‌کند.",
    stack: ["n8n"],
    metrics: [
      ["۱٬۲۰۰", "فاکتور در ماه"],
      ["۹۶٪", "دقت استخراج"],
      ["۱۸ ساعت", "صرفه‌جویی هفتگی"],
    ],
    steps: [
      "پایش صندوق ایمیل خرید (IMAP) و پیوست‌های PDF",
      "استخراج متن خام با سرویس OCR",
      "پرامپت LLM برای تبدیل متن به JSON استاندارد (شماره، مبلغ، اقلام، مالیات)",
      "اعتبارسنجی جمع اقلام با مبلغ کل و علامت‌گذاری مغایرت‌ها",
      "درج در Google Sheets و ارسال به ERP از طریق REST",
      "اطلاع تلگرامی به واحد مالی فقط برای فاکتورهای مغایرت‌دار",
    ],
    outcome:
      "چرخهٔ ثبت فاکتور از سه روز کاری به کمتر از یک ساعت رسید و مغایرت‌ها قبل از پرداخت کشف می‌شوند.",
    time: "۱ هفته",
  },
  {
    id: "knowledge-rag",
    icon: Building2,
    industry: "هلدینگ صنعتی",
    title: "دستیار دانش سازمانی روی اسناد داخلی",
    summary:
      "روش‌نامه‌ها و دستورالعمل‌های ISO در درایوهای پراکنده بودند و کارکنان ساعت‌ها دنبال پاسخ می‌گشتند. یک چت‌بات Flowise با پایگاه برداری Qdrant روی ۱۲ هزار سند، پاسخ‌های مستند با ذکر منبع می‌دهد.",
    stack: ["flowise"],
    metrics: [
      ["۱۲هزار", "سند نمایه‌شده"],
      ["۸۵٪", "نرخ پاسخ مفید"],
      ["۵ دقیقه", "به‌جای ۵ ساعت جست‌وجو"],
    ],
    steps: [
      "Indexer دوره‌ای اسناد Word/PDF از SharePoint و درایو اشتراکی",
      "قطعه‌بندی هوشمند با حفظ سرصفحه/شمارهٔ بند برای ارجاع دقیق",
      "Embedding و ذخیره در Qdrant با فیلتر واحد سازمانی",
      "چت‌بات Flowise با قالب پرامپت سازمانی و پاسخ همراه منبع",
      "استقرار روی سرور داخلی شرکت — هیچ سندی از شبکه خارج نمی‌شود",
      "داشبورد سؤالات بی‌پاسخ برای تکمیل مستندات",
    ],
    outcome:
      "دانش پراکندهٔ ۱۲ ساله در یک نقطه جمع شد و رویکرد «اول از دستیار بپرس» به فرهنگ شرکت تبدیل شد.",
    time: "۳ هفته",
  },
  {
    id: "social-content",
    icon: Megaphone,
    industry: "آژانس دیجیتال مارکتینگ",
    title: "تولید و زمان‌بندی محتوای شبکه‌های اجتماعی",
    summary:
      "برای ۹ برند باید هر هفته ده‌ها پست تولید و منتشر می‌شد که ظرفیت تیم محتوا را شکسته بود. خط تولید n8n ایده‌پردازی، نگارش، ساخت تصویر و زمان‌بندی انتشار را زنجیره‌ای و خودکار کرده است.",
    stack: ["n8n"],
    metrics: [
      ["۴۰+", "پست در هفته"],
      ["۶ ساعت", "کاهش کار دستی روزانه"],
      ["۹", "برند همزمان"],
    ],
    steps: [
      "Cron هفتگی: تقویم محتوای هر برند از Notion خوانده می‌شود",
      "تولید کپشن با LLM متناسب با لحن برند (پرامپت اختصاصی هر برند)",
      "ساخت تصویر با API تولید تصویر و اعمال قالب گرافیکی",
      "تأیید انسانی در تلگرام با دکمهٔ «انتشار/ویرایش»",
      "انتشار خودکار در اینستاگرام و لینکدین در ساعت طلایی",
      "جمع‌آوری آمار تعامل و گزارش هفتگی خودکار",
    ],
    outcome: "خروجی محتوا سه برابر شد و تیم به‌جای تولید روزمره، روی استراتژی و خلاقیت کار می‌کند.",
    time: "۲ هفته",
  },
  {
    id: "email-triage",
    icon: Mail,
    industry: "خدمات مالی",
    title: "ترییج و مسیریابی هوشمند ایمیل‌ها",
    summary:
      "صندوق info شرکت روزی ۳۰۰ ایمیل از مشتری، رگولاتور و تأمین‌کننده دریافت می‌کرد و اولویت‌بندی دستی باعث تأخیر در موارد حساس می‌شد. n8n هر ایمیل را طبقه‌بندی، خلاصه و به مسیر درست می‌فرستد.",
    stack: ["n8n"],
    metrics: [
      ["۳۰۰", "ایمیل در روز"],
      ["۹۸٪", "دقت مسیریابی"],
      ["۰", "ایمیل گم‌شده"],
    ],
    steps: [
      "دریافت ایمیل با تریگر IMAP در لحظه",
      "طبقه‌بندی با LLM: مشتری/رگولاتوری/فروش/اسپم + سطح فوریت",
      "خلاصهٔ سه خطی + لیست اقدامات پیشنهادی",
      "موارد فوری → پیام فوری تلگرام به مدیر مربوطه",
      "ایمیل‌های فروش → ثبت خودکار lead در CRM",
      "پاسخ خودکار به سؤالات متداول با لینک صفحهٔ مرتبط",
    ],
    outcome:
      "زمان پاسخ به ایمیل‌های حساس از میانگین ۷ ساعت به ۱۵ دقیقه رسید و گزارش انطباق رگولاتوری کامل شد.",
    time: "۱ هفته",
  },
  {
    id: "lead-scoring",
    icon: Target,
    industry: "B2B SaaS",
    title: "سرنخ‌یابی و امتیازدهی خودکار به لیدها",
    summary:
      "فرم‌های سایت پر از درخواست‌های بی‌کیفیت بود و فروشنده‌ها وقتشان صرف لیدهای سرد می‌شد. ورک‌فلو n8n هر درخواست را غنی‌سازی و امتیازدهی می‌کند و فقط لیدهای داغ را به تقویم فروش می‌رساند.",
    stack: ["n8n"],
    metrics: [
      ["۳٫۲×", "نرخ تبدیل تماس"],
      ["۷۰٪", "کاهش کار تلفنی بیهوده"],
      ["< ۱ دقیقه", "از فرم تا تماس"],
    ],
    steps: [
      "تریگر فرم سایت و غنی‌سازی با جست‌وجوی دامنه شرکت",
      "بررسی حضور شرکت در CRM و تاریخچهٔ قبلی",
      "امتیازدهی LLM بر اساس ICP تعریف‌شده (اندازه، صنعت، سیگنال‌ها)",
      "لید داغ → رزرو خودکار اسلات در تقویم فروشنده + پیامک یادآوری",
      "لید سرد → ورود به کمپین تغذیهٔ ایمیلی خودکار",
      "ثبت دلیل امتیاز در CRM برای شفافیت تصمیم",
    ],
    outcome:
      "تیم فروش فقط با لیدهای آماده خرید صحبت می‌کند و نرخ تبدیل فرم به قرارداد بیش از سه برابر شده است.",
    time: "۱ هفته",
  },
  {
    id: "price-watch",
    icon: LineChart,
    industry: "خرده‌فروشی",
    title: "پایش قیمت و موجودی رقبا",
    summary:
      "برای حفظ رقابتی‌بودن قیمت ۲ هزار کالا، بررسی دستی سایت‌های رقبا روزی چند ساعت کار می‌برد. n8n هر شب قیمت‌ها را می‌کشد، تغییرات مهم را تحلیل و هشدار می‌دهد.",
    stack: ["n8n"],
    metrics: [
      ["۲٬۰۰۰+", "کالای رصدشده"],
      ["روزانه", "به‌روزرسانی قیمت"],
      ["لحظه‌ای", "هشدار تغییر جهشی"],
    ],
    steps: [
      "Cron شبانه: خواندن لیست URL رقبا و اجرای scrape",
      "استخراج قیمت و موجودی با پارسر + نرمال‌سازی",
      "مقایسه با قیمت خودمان و محاسبهٔ شکاف قیمتی",
      "قاعدهٔ کسب‌وکار: اختلاف بیش از ۵٪ → پیشنهاد قیمت جدید",
      "گزارش تلگرامی صبحگاهی به تیم قیمت‌گذاری",
      "آرشیو روزانه در TimescaleDB برای تحلیل روند",
    ],
    outcome:
      "واکنش به تغییر قیمت رقبا از هفتگی به روزانه رسید و حاشیهٔ سود بدون از دست دادن فروش محافظت شد.",
    time: "۲ هفته",
  },
  {
    id: "hr-onboarding",
    icon: UsersRound,
    industry: "شرکت تولیدی",
    title: "خودکارسازی استخدام و آنبوردینگ کارکنان",
    summary:
      "ورود هر نیروی جدید به ۱۱ مرحلهٔ دستی در ۴ واحد می‌رسید و چیزی همیشه جا می‌ماند. n8n از فرم استخدام تا تحویل لپ‌تاپ و آموزش، همه‌چیز را زنجیره‌ای و قابل پیگیری کرده است.",
    stack: ["n8n"],
    metrics: [
      ["۱۱ مرحله", "خودکار شده"],
      ["۴ ساعت", "به‌جای ۳ روز کاری"],
      ["۰", "اقلام جاافتاده"],
    ],
    steps: [
      "فرم استخدام → ساخت پروزه در سیستم HR و کد پرسنلی",
      "تولید خودکار قرارداد و نامهٔ معرفی از قالب Docx",
      "ایجاد اکانت‌ها (ایمیل، شبکه داخلی، ابزارها) با APIها",
      "تیکت آماده‌سازی میز کار و تجهیزات برای IT",
      "زمان‌بندی جلسات معارفه و ارسال بستهٔ آموزشی به نیرو",
      "یادآوری‌های روز شمار و چک‌لیست تأیید مدیر",
    ],
    outcome:
      "روز اول کاری هر نیرو کاملاً آماده است و تجربهٔ آنبوردینگ به یک مزیت برند کارفرمایی تبدیل شده.",
    time: "۲ هفته",
  },
  {
    id: "tech-support",
    icon: Headset,
    industry: "شرکت نرم‌افزاری",
    title: "چت‌بات پشتیبانی فنی با تحویل هوشمند به انسان",
    summary:
      "پشتیبانی محصول SaaS زیر سؤال‌های نصب و خطاها غرق شده بود. ایجنت Flowise مستندات فنی را جست‌وجو می‌کند، دستورات را مرحله‌به‌مرحله می‌دهد و در تشخیص باگ واقعی، کل کانتکست را به مهندس منتقل می‌کند.",
    stack: ["flowise", "n8n"],
    metrics: [
      ["۶۲٪", "حل بدون مداخله"],
      ["۳ برابر", "ظرفیت پشتیبانی"],
      ["CSAT ۴٫۶", "از ۵"],
    ],
    steps: [
      "چت ویجت روی سایت و پنل محصول",
      "ایجنت با ابزار جست‌وجوی مستندات، FAQ و لاگ خطاهای شناخته‌شده",
      "پاسخ مرحله‌به‌مرحله با قطعه‌کد و لینک مستند مرتبط",
      "تشخیص نیاز انسانی → n8n تیکت با تاریخچهٔ کامل می‌سازد",
      "انتخاب مهندس بر اساس دستهٔ محصول و بار کاری",
      "پس از حل، مستندسازی راه‌حل جدید به‌صورت خودکار پیشنهاد می‌شود",
    ],
    outcome:
      "مهندس‌ها فقط مسائل نو را حل می‌کنند و هر حل‌شدن، بلافاصله به دانش دائمی چت‌بات تبدیل می‌شود.",
    time: "۳ هفته",
  },
  {
    id: "exec-report",
    icon: FileBarChart,
    industry: "زنجیرهٔ خرده‌فروشی",
    title: "گزارش هفتگی مدیریتی با تحلیل خودکار",
    summary:
      "تهیهٔ گزارش هفته از ۷ شعبه، دو روز کار تحلیلگر می‌برد و همیشه دیر می‌رسید. n8n داده را از دیتابیس می‌کشد، LLM تغییرات و ریسک‌ها را تحلیل می‌کند و PDF مدیریتی صبح شنبه در ایمیل مدیران است.",
    stack: ["n8n", "flowise"],
    metrics: [
      ["۲ روز → ۲۰ دقیقه", "زمان تهیهٔ گزارش"],
      ["۷ شعبه", "یکپارچه"],
      ["شنبه ۷ صبح", "رسیدن قطعی گزارش"],
    ],
    steps: [
      "Cron شنبه ۶ صبح: کوئری فروش، مرجوعی و ترافیک از دیتابیس",
      "محاسبهٔ KPI و مقایسه با هفتهٔ قبل و هدف سالانه",
      "LLM شناسایی ناهنجاری‌ها (افت شعبه، جهش محصول خاص) با توضیح",
      "تولید روایت مدیریتی فارسی به‌جای جدول خام",
      "رندر PDF با نمودارها و ارسال به مدیران",
      "بایگانی در درایو مشترک و نمای داشبوردی در Shiny/Sheets",
    ],
    outcome:
      "جلسهٔ شنبه مدیران با گزارش آماده و تحلیل علت‌ها شروع می‌شود و تصمیم‌ها یک هفته جلوتر افتاد.",
    time: "۱ هفته",
  },
  {
    id: "voice-bot",
    icon: PhoneCall,
    industry: "مرکز تماس و فروش",
    title: "دستیار صوتی پاسخ‌گویی تماس‌های ورودی",
    summary:
      "در ساعات اوج، بخش بزرگی از تماس‌ها بی‌پاسخ می‌ماند و اپراتورها غرق سؤال‌های تکراری بودند. یک دستیار صوتی با تشخیص گفتار و تولید گفتار طبیعی، تماس‌ها را پاسخ می‌دهد، قصد تماس‌گیرنده را می‌فهمد و در موارد لازم به اپراتور منتقل می‌کند.",
    stack: ["n8n", "flowise"],
    metrics: [
      ["۸۵٪", "تماس بدون اپراتور"],
      ["۲۴/۷", "پاسخ‌گویی صوتی"],
      ["۳×", "ظرفیت خطوط"],
    ],
    steps: [
      "ورود تماس به شماره مجازی و دریافت صدای تماس‌گیرنده",
      "تبدیل گفتار به متن (STT) با پشتیبانی فارسی",
      "تشخیص قصد تماس (استعلام، پیگیری، شکایت، فروش) با LLM",
      "پاسخ صوتی طبیعی با TTS و اتصال به API سفارش‌ها",
      "موارد پیچیده → صف اپراتور همراه با خلاصهٔ کامل گفتگو",
      "ثبت لاگ تماس و گزارش هفتگی دلایل تماس برای مدیریت",
    ],
    outcome:
      "هیچ تماسی بی‌پاسخ نمی‌ماند؛ اپراتورها فقط تماس‌های باارزش را پاسخ می‌دهند و هزینهٔ نیروی شبانه صفر شده است.",
    time: "۳ هفته",
  },
  {
    id: "seo-blog",
    icon: Newspaper,
    industry: "فروشگاه اینترنتی",
    title: "موتور تولید محتوای سئو با تأیید انسانی",
    summary:
      "تیم محتوا نمی‌توانست هم‌زمان صفحات محصول و بلاگ سئو را پوشش دهد و رقبا در نتایج جست‌وجو جلو می‌زدند. خط تولید محتوا، از تحقیق کلمه کلیدی تا انتشار، خودکار شده و فقط بازبینی نهایی با انسان است.",
    stack: ["n8n"],
    metrics: [
      ["۱۲۰", "مقاله در ماه"],
      ["+۴۵٪", "ترافیک ارگانیک"],
      ["۹۰٪", "کاهش هزینهٔ محتوا"],
    ],
    steps: [
      "تحقیق کلمه کلیدی و تحلیل رقبا از داده‌های جست‌وجو",
      "ساخت اوتلاین سئو شده (H2/H3، پرسش‌های مرتبط، لینک‌سازی داخلی)",
      "نگارش پیش‌نویس با LLM هم‌راستا با لحن برند",
      "تولید تصویر شاخص با مدل تولید تصویر و قالب گرافیکی",
      "بازبینی ویراستار در Notion با دکمهٔ تأیید/ویرایش",
      "انتشار خودکار در CMS و ثبت در سرچ کنسول",
    ],
    outcome:
      "بلاگ از هفته‌ای دو مقاله به روزی چهار مقاله رسید و صفحات کلیدی به صفحهٔ اول جست‌وجو آمدند.",
    time: "۲ هفته",
  },
  {
    id: "inventory",
    icon: Boxes,
    industry: "پخش مواد غذایی",
    title: "پیش‌بینی موجودی و سفارش خودکار تأمین‌کننده",
    summary:
      "کالاهای پرمصرف مرتباً تمام می‌شد و کالای کم‌مصرف در انبار می‌ماند؛ سفارش‌ها بر اساس حدس زدن بود. سیستم پیش‌بینی تقاضا، هر شب موجودی را تحلیل و پیش‌نویس سفارش هر تأمین‌کننده را آماده می‌کند.",
    stack: ["n8n"],
    metrics: [
      ["-۳۵٪", "کالای تمام‌شده"],
      ["۷ روز", "افق پیش‌بینی"],
      ["۰", "سفارش فراموش‌شده"],
    ],
    steps: [
      "همگام‌سازی شبانهٔ فروش، موجودی و سفارش‌های باز از سیستم انبار",
      "پیش‌بینی تقاضای هر کالا با مدل آماری + فصلی بودن",
      "تولید توضیح فارسی برای هر پیش‌بینی (چرا این عدد؟) با LLM",
      "مقایسه با نقطهٔ سفارش و محاسبهٔ تعداد پیشنهادی",
      "تأیید مدیر خرید در تلگرام با دکمهٔ تأیید/ویرایش",
      "ثبت سفارش نهایی و یادآوری پیگیری تحویل",
    ],
    outcome:
      "کالای تمام‌شده ۳۵٪ کم شد و سرمایهٔ راکد در انبار آزاد شد؛ تصمیم خرید حالا با عدد و دلیل گرفته می‌شود.",
    time: "۳ هفته",
  },
  {
    id: "legal",
    icon: Scale,
    industry: "شرکت حقوقی",
    title: "تحلیل و خلاصهٔ هوشمند قراردادها",
    summary:
      "بازبینی دستی هر قرارداد بالای ده ساعت وقت وکیل می‌برد و پیدا کردن بندهای پرریسک بین ده‌ها صفحه، مستعد خطا بود. سیستم تحلیل قرارداد، بندهای ریسک را علامت می‌زند و خلاصهٔ مدیریتی آماده می‌کند.",
    stack: ["flowise", "n8n"],
    metrics: [
      ["۷۰٪", "سرعت بازبینی"],
      ["۹۵٪", "پوشش بندهای ریسک"],
      ["۱۰ ساعت", "صرفه‌جویی در هر پرونده"],
    ],
    steps: [
      "آپلود قرارداد (PDF/اسکن) و استخراج متن با OCR",
      "تشخیص نوع قرارداد و نقشه‌کردن ساختار بندها",
      "علامت‌گذاری بندهای پرریسک با استناد به متن و قوانین مرتبط",
      "مقایسه با قالب استاندارد شرکت و فهرست انحراف‌ها",
      "خلاصهٔ مدیریتی دوسطحی (مدیر / وکیل) با توضیح ساده",
      "خروجی Word با هایلایت و جدول تغییرات پیشنهادی",
    ],
    outcome:
      "وکیل‌ها بازبینی را با فهرست ریسک آماده شروع می‌کنند؛ هیچ بند غیراستانداردی از چشم نمی‌افتد.",
    time: "۳ هفته",
  },
  {
    id: "edu-quiz",
    icon: GraduationCap,
    industry: "آموزشگاه زبان",
    title: "تولید آزمون و تصحیح خودکار دانش‌آموزان",
    summary:
      "معلم‌ها ساعت‌ها برای ساخت آزمون و تصحیح برگه‌ها وقت می‌گذاشتند و بازخورد به دانش‌آموز دیر می‌رسید. سیستم آموزشی، آزمون سطح‌محور تولید و پاسخ‌های تشریحی را با روبیک تصحیح می‌کند.",
    stack: ["flowise", "n8n"],
    metrics: [
      ["۵۰۰+", "آزمون در ماه"],
      ["لحظه‌ای", "کارنامهٔ دانش‌آموز"],
      ["۲۰ ساعت", "صرفه‌جویی هفتگی مدرس"],
    ],
    steps: [
      "ورود سرفصل، سطح و اهداف آموزشی هر کلاس",
      "تولید آزمون چندگزینه‌ای و تشریحی متناسب با سطح (با توزیع سختی)",
      "انتشار آزمون به دانش‌آموزان با لینک اختصاصی",
      "تصحیح خودکار تشریحی با روبیک و توضیح خطا به زبان ساده",
      "کارنامهٔ فردی + تمرین پیشنهادی برای نقطه‌ضعف هر دانش‌آموز",
      "گزارش پیشرفت کلاس و هشدار افت برای مدرس",
    ],
    outcome:
      "بازخورد از یک هفته به همان لحظه رسید و مدرس‌ها وقتشان را صرف تدریس کردن کرد، نه تصحیح کردن.",
    time: "۲ هفته",
  },
  {
    id: "insurance",
    icon: ShieldCheck,
    industry: "بیمه",
    title: "ترییج و اولویت‌بندی خودکار پروندهٔ خسارت",
    summary:
      "پرونده‌های خسارت با سرعت به صف رسیدگی اضافه می‌شدند و موارد بزرگ بی‌توجه می‌ماندند. سیستم ترییج، مدارک را می‌خواند، میزان خسارت را تخمین می‌زند و صف رسیدگی را هوشمند می‌چیند.",
    stack: ["n8n", "flowise"],
    metrics: [
      ["۵۰٪", "کاهش زمان رسیدگی"],
      ["۹۲٪", "دقت اولویت‌بندی"],
      ["۳ روز → ۱ روز", "چرخهٔ ادعا"],
    ],
    steps: [
      "دریافت تصاویر، گزارش پلیس و فاکتورها از پورتال بیمه‌گزار",
      "استخراج دادهٔ مدارک با OCR و مدل بینایی (VLM)",
      "تخمین میزان و نوع آسیب از تصاویر خسارت",
      "تطبیق خسارت با پوشش بیمه‌نامه و تشخیص استثناها",
      "امتیازدهی ریسک و چیدن صف رسیدگی برای کارشناسان",
      "پیامک خودکار وضعیت پرونده به بیمه‌گزار در هر مرحله",
    ],
    outcome:
      "پرونده‌های بزرگ همان روز اول وارد کارشناس می‌شوند و تماس‌های پیگیری وضعیت نیمی از تماس‌های قبلی کاهش یافت.",
    time: "۴ هفته",
  },
];

const FILTERS: { key: "all" | "n8n" | "flowise" | "both"; label: string }[] = [
  { key: "all", label: "همه" },
  { key: "n8n", label: "n8n" },
  { key: "flowise", label: "Flowise" },
  { key: "both", label: "ترکیبی" },
];

function matches(stack: Stack[], f: (typeof FILTERS)[number]["key"]) {
  if (f === "all") return true;
  if (f === "both") return stack.length === 2;
  return stack.includes(f);
}

function StackBadge({ s }: { s: Stack }) {
  return (
    <span
      dir="ltr"
      className={`font-mono text-[10px] rounded border px-1.5 py-0.5 ${
        s === "n8n" ? "border-primary/50 text-primary" : "border-accent/50 text-accent"
      }`}
    >
      {s === "n8n" ? "n8n" : "Flowise"}
    </span>
  );
}

function CaseCard({ c, index }: { c: Case; index: number }) {
  const Icon = c.icon;
  // pipeline simulator: -1 idle · 0..len running · len done
  const [simStep, setSimStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSimStep((s) => {
        if (s + 1 >= c.steps.length) {
          setRunning(false);
          return c.steps.length;
        }
        return s + 1;
      });
    }, 650);
    return () => clearInterval(t);
  }, [running, c.steps.length]);

  const simDone = simStep >= c.steps.length;
  const runSim = () => {
    setExpanded(true);
    setSimStep(0);
    setRunning(true);
  };

  return (
    <Reveal delay={(index % 2) * 90} className="h-full">
      <Tilt max={4} className="h-full">
        <article className="rack-card scan-hover lift p-6 h-full hover:border-primary/70 transition group">
          <div className="flex items-center gap-1 mb-4" aria-hidden>
            <span className="status-dot" />
            <span className="font-mono text-[10px] text-primary/70 tracking-widest" dir="ltr">
              CASE-{String(index + 1).padStart(2, "0")}
            </span>
            <span className="ms-auto flex gap-1">
              {c.stack.map((s) => (
                <StackBadge key={s} s={s} />
              ))}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <span className="shrink-0 rounded-md border border-primary/30 bg-primary/10 p-2.5 text-primary transition group-hover:glow">
              <Icon size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] text-accent">{c.industry}</p>
              <h3 className="mt-0.5 font-bold leading-relaxed group-hover:text-primary transition-colors">
                {c.title}
              </h3>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{c.summary}</p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {c.metrics.map(([v, l]) => (
              <div
                key={l}
                className="rounded-md border border-border bg-muted/30 px-2 py-3 text-center transition hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="text-base md:text-lg font-black text-primary leading-tight">
                  {v}
                </div>
                <div className="mt-1 text-[10px] leading-snug text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>

          {/* pipeline simulator */}
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-primary/15 pt-4">
            {simStep === -1 && (
              <button
                onClick={runSim}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition"
              >
                <CirclePlay size={15} />
                شبیه‌سازی نمایشی اجرا
              </button>
            )}
            {running && (
              <span
                className="inline-flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary"
                role="status"
              >
                <Loader2 size={15} className="animate-spin" />
                شبیه‌سازی نمایشی — گام {simStep + 1} از {c.steps.length}
              </span>
            )}
            {simDone && (
              <button
                onClick={runSim}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/60 bg-primary/15 px-3.5 py-2 text-xs font-bold text-primary transition hover:bg-primary/25"
              >
                <RotateCcw size={14} />
                اجرا کامل شد — اجرای مجدد
              </button>
            )}
            {!expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="text-xs text-muted-foreground hover:text-primary transition"
              >
                یا معماری را بخوانید ↙
              </button>
            )}
          </div>

          <details
            dir="rtl"
            open={expanded}
            onToggle={(e) => setExpanded((e.target as HTMLDetailsElement).open)}
            className="group mt-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold">
              <span>معماری ورک‌فلو</span>
              <span className="text-primary text-xl leading-none group-open:rotate-45 transition shrink-0">
                +
              </span>
            </summary>
            {simStep > -1 && (
              <div className="mt-4 h-1 rounded-full bg-muted overflow-hidden" aria-hidden>
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${(simStep / c.steps.length) * 100}%`,
                    boxShadow: "0 0 12px var(--primary)",
                  }}
                />
              </div>
            )}
            <ol className="mt-4 space-y-2.5">
              {c.steps.map((s, i) => {
                const state =
                  simStep === -1
                    ? "idle"
                    : i < simStep
                      ? "done"
                      : i === simStep && running
                        ? "active"
                        : "idle";
                return (
                  <li
                    key={i}
                    className={`sim-step flex items-start gap-2.5 text-sm leading-relaxed ${
                      state === "done" ? "done" : state === "active" ? "active" : ""
                    }`}
                  >
                    <span
                      className={`shrink-0 mt-0.5 grid place-items-center h-5 w-5 rounded-full border font-mono text-[10px] ${
                        state === "done"
                          ? "sim-check border-primary bg-primary/15 text-primary"
                          : state === "active"
                            ? "border-primary/70 text-primary animate-pulse"
                            : "border-border text-muted-foreground"
                      }`}
                      dir="ltr"
                    >
                      {state === "done" ? <Check size={11} /> : String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{s}</span>
                  </li>
                );
              })}
            </ol>
            {simDone && (
              <div className="mt-4 flex items-start gap-2.5 rounded-md border border-primary/40 bg-primary/10 p-3 animate-in fade-in">
                <span className="status-dot shrink-0 mt-1.5" />
                <p className="text-sm leading-relaxed">
                  <span className="font-bold text-primary">خروجی این الگو در پروژهٔ واقعی: </span>
                  {c.outcome}
                </p>
              </div>
            )}
            {!simDone && (
              <div className="mt-4 flex items-start gap-2.5 rounded-md border border-primary/25 bg-primary/5 p-3">
                <span className="status-dot shrink-0 mt-1.5" />
                <p className="text-sm leading-relaxed">
                  <span className="font-bold text-primary">نتیجهٔ مستندشده: </span>
                  {c.outcome}
                </p>
              </div>
            )}
            <p className="mt-3 font-mono text-[11px] text-muted-foreground" dir="rtl">
              زمان استقرار: <span className="text-primary">{c.time}</span>
            </p>
          </details>
        </article>
      </Tilt>
    </Reveal>
  );
}

function Showcase() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const shown = CASES.filter((c) => matches(c.stack, filter));

  return (
    <Shell>
      <div
        className="cv-auto relative z-10 max-w-6xl mx-auto px-6 py-20"
        style={{ "--cv-size": "3200px" } as React.CSSProperties}
      >
        <p className="font-mono text-xs text-primary" dir="ltr">
          &gt; ls /cases --real-world --with-metrics
        </p>
        <h1 className="mt-4 h1-fluid">
          نمونه‌کارهای <span className="text-gradient">مستند</span> n8n و Flowise
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          شانزده الگوی استقرار مستندشده با n8n و ایجنت‌های Flowise؛ نام مشتری‌ها محرمانه است و اعداد
          هر کارت متعلق به همان پروژه است. روی «شبیه‌سازی نمایشی» بزنید تا معماری هر ورک‌فلو
          مرحله‌به‌مرحله به‌صورت آموزشی اجرا شود.
        </p>

        {/* stack filter */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => {
            const n = CASES.filter((c) => matches(c.stack, f.key)).length;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  filter === f.key
                    ? "border-primary bg-primary/15 text-primary glow"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                }`}
              >
                {f.label}
                <span className="ms-2 font-mono text-[11px]" dir="ltr">
                  {n}
                </span>
              </button>
            );
          })}
          <span className="ms-1 font-mono text-[10px] text-muted-foreground" dir="ltr">
            {shown.length} / {CASES.length} cases
          </span>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-4 items-start">
          {shown.map((c, i) => (
            <CaseCard key={c.id} c={c} index={CASES.indexOf(c)} />
          ))}
        </div>

        <Reveal delay={150}>
          <div className="mt-14 panel-glass rounded-xl p-8 flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="font-mono text-xs text-primary" dir="ltr">
                &gt; ./replicate --case=yours
              </p>
              <h2 className="mt-2 text-2xl font-black">مشابه همین‌ها مشکل شماست؟</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                در یک جلسهٔ رایگان ۳۰ دقیقه‌ای، نسخهٔ سفارشی‌شدهٔ همان معماری را برای سازمان شما
                می‌کشیم — و اگر مدل هم بخواهد، سالن سخت‌افزار منتظرتان است.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/hardware"
                className="inline-flex items-center gap-2 border border-primary/50 text-primary px-6 py-3.5 rounded-lg font-bold hover:bg-primary/10 transition"
              >
                سالن سخت‌افزار
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-lg font-bold glow hover:scale-105 transition"
              >
                شروع پروژه
                <ArrowLeft size={18} />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </Shell>
  );
}
