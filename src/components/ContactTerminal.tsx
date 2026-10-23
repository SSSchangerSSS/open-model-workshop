import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Mail, Terminal, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT_CHANNELS, loadHardwareInquiry } from "@/lib/contact";

const SUBJECTS = [
  "اتوماسیون n8n / Flowise",
  "سرور هوش مصنوعی",
  "سخت‌افزار GPU",
  "پشتیبانی و بهینه‌سازی",
] as const;

/* Honest transmission log — this is a DRAFT assembler, not a sender.
   No encryption / tunnel / delivery claims without an actual endpoint. */
const LOG_LINES = [
  "> draft.assemble(subject, contact) ✔",
  "> clipboard.write() ✔",
  "> ready — paste into your mail client ✔",
];

export function ContactTerminal({
  model = "مشاوره عمومی",
  onClose,
}: {
  model?: string;
  onClose?: () => void;
}) {
  // a saved hardware inquiry (from /hardware) prefills the draft — non-sensitive data only
  const [hw] = useState(() => loadHardwareInquiry());
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(() =>
    hw
      ? `از صفحهٔ برآورد سخت‌افزار می‌آیم:\nمدل: ${hw.modelFa} (${hw.modelEn})\nکاربران همزمان: ${hw.users}\nسخت‌افزار برآوردی: ${hw.gpus}\nبودجهٔ سخت‌افزار برآوردی: $${hw.priceTotalUsd.toLocaleString("en-US")}\n\n`
      : "",
  );
  const [subject, setSubject] = useState<string>(hw ? "سخت‌افزار GPU" : model);
  const [logStep, setLogStep] = useState(-1);
  const timer = useRef<number | null>(null);

  // an explicit `model` prop (3D corridor dialog) wins, but never over a
  // saved hardware inquiry prefill
  useEffect(() => {
    if (!hw) setSubject(model);
  }, [model, hw]);
  useEffect(
    () => () => {
      if (timer.current) window.clearInterval(timer.current);
    },
    [],
  );

  const draft = useMemo(
    () => `موضوع: درخواست مشاوره ${subject}\nنام: ${name}\nایمیل: ${email}\n\n${message}`,
    [subject, name, email, message],
  );

  const hasDraft = name.trim() !== "" || message.trim() !== "";

  async function prepare(e: React.FormEvent) {
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
      // visible, recoverable failure — the selectable draft below is the fallback
      setError(
        "کپی خودکار انجام نشد (دسترسی کلیپ‌بورد داده نشد). متن پیش‌نویس را از کادر زیر دستی انتخاب و کپی کنید.",
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
              className={`min-h-11 rounded-full border px-3 py-2 text-xs transition ${
                subject === s
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={prepare} className="mt-6 space-y-4">
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
              name="message"
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
            <span>
              آدرس ایمیل متخصص هنوز تنظیم نشده؛ این فرم <b>پیام ارسال نمی‌کند</b> — فقط پیش‌نویس
              می‌سازد که خودتان کپی می‌کنید.
            </span>
          </p>
          <Button className="min-h-12 w-full" type="submit">
            {copied ? <Check /> : <Copy />}
            {copied ? "متن ایمیل کپی شد" : "ساخت پیش‌نویس و کپی"}
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
          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-md border border-amber-400/30 bg-amber-400/10 p-3 text-xs leading-relaxed text-amber-200"
            >
              <TriangleAlert size={14} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}
          {/* Selectable draft — works even when the Clipboard API is blocked
              (insecure context, permissions prompt denied, private mode). */}
          {(hasDraft || copied) && (
            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">
                پیش‌نویس ایمیل (قابل انتخاب و کپی دستی):
              </p>
              <textarea
                readOnly
                value={draft}
                rows={6}
                dir="rtl"
                aria-label="پیش‌نویس ایمیل برای کپی دستی"
                onFocus={(e) => e.currentTarget.select()}
                className="terminal-input font-mono text-xs leading-relaxed"
              />
            </div>
          )}
          <p role="status" className="min-h-5 text-sm text-primary">
            {error
              ? ""
              : copied
                ? "پیش‌نویس آماده است؛ هنوز برای کسی ارسال نشده — آن را در ایمیل خودتان بچسبانید."
                : ""}
          </p>
        </form>

        <p className="mt-5 border-t border-primary/15 pt-4 text-xs leading-relaxed text-muted-foreground">
          کانال‌های مستقیم:{" "}
          {CONTACT_CHANNELS.map((c, i) => (
            <span key={c.id}>
              {i > 0 && " · "}
              <a
                href={c.href}
                className="text-primary underline-offset-4 hover:underline"
                {...(c.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {c.value}
              </a>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
