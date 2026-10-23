import { useEffect, useRef, useState } from "react";
import { Check, Copy, Mail, Terminal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildDraft, NO_RECIPIENT_NOTE } from "@/lib/contact";

const SUBJECTS = [
  "اتوماسیون n8n / Flowise",
  "سرور هوش مصنوعی",
  "سخت‌افزار GPU",
  "پشتیبانی و بهینه‌سازی",
] as const;

/** فقط گام‌های واقعی کپی — ادعای رمزنگاری/ارسال حذف شد (بدون پشتوانه). */
const LOG_LINES = [
  "> draft.assemble(subject, contact) ✔",
  "> clipboard.write() ✔",
  "> ready — paste into your mail client ✔",
];

export type ContactPreset = {
  /** نام مدل/خدمت برای خط موضوع و متن پیش‌نویس */
  topic: string;
  /** تنظیمات انتخابی غیرحساس (مثلاً «۲۵ کاربر همزمان») */
  detail?: string | undefined;
};

export function ContactTerminal({
  preset,
  onClose,
}: {
  preset?: ContactPreset | undefined;
  onClose?: (() => void) | undefined;
}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState<string>(preset?.topic ?? "مشاوره عمومی");
  const [logStep, setLogStep] = useState(-1);
  const timer = useRef<number | null>(null);
  const presetDetailRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (preset?.topic) setSubject(preset.topic);
    if (preset?.detail && preset.detail !== presetDetailRef.current) {
      presetDetailRef.current = preset.detail;
      setMessage((prev) => {
        const line = `تنظیمات انتخاب‌شده: ${preset.detail}`;
        if (prev.includes(line)) return prev;
        return prev ? `${prev}\n${line}` : line;
      });
    }
  }, [preset]);

  useEffect(
    () => () => {
      if (timer.current) window.clearInterval(timer.current);
    },
    [],
  );

  const draft = buildDraft({ subject, name, email, message });

  async function copyDraft(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      // animated transmission log
      setLogStep(0);
      if (timer.current) window.clearInterval(timer.current);
      timer.current = window.setInterval(() => {
        setLogStep((s) => {
          if (s + 1 >= LOG_LINES.length) {
            if (timer.current) window.clearInterval(timer.current);
            return LOG_LINES.length;
          }
          return s + 1;
        });
      }, 420);
    } catch {
      setCopied(false);
      setError(
        "کپی خودکار انجام نشد (دسترسی کلیپ‌بورد رد شد). متن پیش‌نویس پایین را انتخاب و دستی کپی کنید.",
      );
    }
  }

  return (
    <div className="terminal-window w-full" dir="rtl">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <span className="flex items-center gap-2 text-primary font-mono text-xs">
          <Terminal size={16} /> HUMAN_CONNECTION
        </span>
        {onClose ? (
          <Button variant="ghost" size="icon" aria-label="بستن پنجره ارتباط" onClick={onClose}>
            <X />
          </Button>
        ) : (
          <span className="terminal-dots" />
        )}
      </div>
      <div className="p-6 md:p-8">
        <p className="font-mono text-xs text-primary" dir="ltr">
          &gt; connecting to specialist_
          <span className="cursor-blink" aria-hidden />
        </p>
        <h2 className="mt-4 text-2xl font-bold">آن سوی کد، یک انسان است.</h2>

        {/* subject picker */}
        <p className="mt-5 text-xs text-muted-foreground">موضوع گفتگو را انتخاب کنید:</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSubject(s);
                setCopied(false);
                setLogStep(-1);
              }}
              aria-pressed={subject === s}
              className={`rounded-full border px-3 py-2 text-xs transition ${
                subject === s
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={copyDraft} className="mt-6 space-y-4">
          <label className="block text-sm">
            نام شما
            <input
              className="terminal-input mt-2"
              required
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setCopied(false);
              }}
              placeholder="نام و نام خانوادگی"
            />
          </label>
          <label className="block text-sm">
            ایمیل شما
            <input
              className="terminal-input mt-2"
              dir="ltr"
              type="email"
              required
              name="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setCopied(false);
              }}
              placeholder="you@company.com"
            />
          </label>
          <label className="block text-sm">
            پیام شما
            <textarea
              className="terminal-input mt-2"
              rows={4}
              required
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setCopied(false);
              }}
              placeholder="از پروژه‌تان بگویید…"
            />
          </label>
          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Mail size={14} className="mt-0.5 shrink-0" />
            {NO_RECIPIENT_NOTE}
          </p>
          <Button className="w-full h-12" type="submit">
            {copied ? <Check /> : <Copy />}
            {copied ? "متن ایمیل کپی شد" : "کپی متن ایمیل"}
          </Button>
          {logStep >= 0 && (
            <div
              className="rounded-md border border-primary/30 bg-primary/5 p-3 font-mono text-[11px]"
              dir="ltr"
              aria-hidden
            >
              {LOG_LINES.slice(0, logStep + 1).map((l, i) => (
                <p
                  key={l}
                  className={i === logStep ? "text-primary" : "text-muted-foreground"}
                  style={{ animation: i === logStep ? "sim-pop 0.3s ease-out" : undefined }}
                >
                  {l}
                </p>
              ))}
            </div>
          )}
          <p role="status" aria-live="polite" className="text-sm text-primary">
            {error || (copied ? "پیش‌نویس آماده است؛ هنوز برای کسی ارسال نشده." : "")}
          </p>
        </form>

        {/* پیش‌نمایش قابل انتخاب — برای کپی دستی وقتی Clipboard API در دسترس نیست */}
        <details className="mt-2 rounded-md border border-border bg-muted/20 p-3">
          <summary className="cursor-pointer text-xs font-bold text-muted-foreground select-none">
            پیش‌نمایش متن ایمیل (برای کپی دستی)
          </summary>
          <textarea
            readOnly
            value={draft}
            rows={6}
            dir="rtl"
            onFocus={(e) => e.currentTarget.select()}
            aria-label="پیش‌نمایش متن ایمیل"
            className="mt-2 w-full rounded border border-border bg-background/60 p-2 font-mono text-xs leading-relaxed text-foreground"
          />
        </details>
      </div>
    </div>
  );
}
