import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { Reveal } from "@/components/Reveal";
import { ArrowLeft } from "lucide-react";
import {
  Building2,
  FileBarChart,
  Headset,
  LineChart,
  Mail,
  Megaphone,
  ReceiptText,
  ShoppingBag,
  Target,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/showcase")({
  head: () => ({
    meta: [
      { title: "نمونه‌کارهای n8n و Flowise | هوش برتر" },
      {
        name: "description",
        content:
          "۱۰ نمونه واقعی از اتوماسیون با n8n و Flowise: پشتیبانی خودکار، پردازش فاکتور، RAG سازمانی، تولید محتوا، سرنخ‌یابی و گزارش‌سازی.",
      },
      { property: "og:title", content: "نمونه‌کارهای واقعی n8n و Flowise | هوش برتر" },
      {
        property: "og:description",
        content:
          "چه نیازهایی با اتوماسیون و ایجنت‌های هوش مصنوعی حل شده‌اند؟ با اعداد واقعی ببینید.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
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
  return (
    <Reveal delay={(index % 2) * 90}>
      <article className="rack-card p-6 h-full hover:border-primary/70 transition group">
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
          <span className="shrink-0 rounded-md border border-primary/30 bg-primary/10 p-2.5 text-primary">
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
              className="rounded-md border border-border bg-muted/30 px-2 py-3 text-center"
            >
              <div className="text-base md:text-lg font-black text-primary leading-tight">{v}</div>
              <div className="mt-1 text-[10px] leading-snug text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>

        <details dir="rtl" className="group mt-5 border-t border-primary/15 pt-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold">
            <span>معماری ورک‌فلو</span>
            <span className="text-primary text-xl leading-none group-open:rotate-45 transition shrink-0">
              +
            </span>
          </summary>
          <ol className="mt-4 space-y-2.5">
            {c.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <span className="font-mono text-[11px] text-accent shrink-0 mt-0.5" dir="ltr">
                  [{String(i + 1).padStart(2, "0")}]
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex items-start gap-2.5 rounded-md border border-primary/25 bg-primary/5 p-3">
            <span className="status-dot shrink-0 mt-1.5" />
            <p className="text-sm leading-relaxed">
              <span className="font-bold text-primary">نتیجه: </span>
              {c.outcome}
            </p>
          </div>
          <p className="mt-3 font-mono text-[11px] text-muted-foreground" dir="rtl">
            زمان استقرار: <span className="text-primary">{c.time}</span>
          </p>
        </details>
      </article>
    </Reveal>
  );
}

function Showcase() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const shown = CASES.filter((c) => matches(c.stack, filter));

  return (
    <Shell>
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <p className="font-mono text-xs text-primary" dir="ltr">
          &gt; ls /cases --real-world --with-metrics
        </p>
        <h1 className="mt-4 text-4xl font-black">
          نمونه‌کارهای <span className="text-gradient">واقعی</span> n8n و Flowise
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          ده نیاز واقعی کسب‌وکارها که با اتوماسیون n8n و ایجنت‌های Flowise حل شده‌اند؛ نام مشتری‌ها
          محرمانه است اما معماری، اعداد و نتایج واقعی‌اند. روی هر نمونه کلیک کنید تا معماری ورک‌فلو
          را مرحله‌به‌مرحله ببینید.
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
                    ? "border-primary bg-primary/15 text-primary"
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
