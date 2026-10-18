import { useEffect, useRef, useState } from "react";
import { Check, Copy, Mail, Terminal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUBJECTS = [
  "اتوماسیون n8n / Flowise",
  "سرور هوش مصنوعی",
  "سخت‌افزار GPU",
  "پشتیبانی و بهینه‌سازی",
] as const;

const LOG_LINES = [
  "> draft.assemble(subject, contact) ✔",
  "> encrypt(aes-256) ✔",
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
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState<string>(model);
  const [logStep, setLogStep] = useState(-1);
  const timer = useRef<number | null>(null);

  useEffect(() => setSubject(model), [model]);
  useEffect(
    () => () => {
      if (timer.current) window.clearInterval(timer.current);
    },
    [],
  );

  async function prepare(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await navigator.clipboard.writeText(
        `موضوع: درخواست مشاوره ${subject}\nنام: ${name}\nایمیل: ${email}\n\n${message}`,
      );
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
      setError("کپی انجام نشد؛ لطفاً متن پیام را دستی کپی کنید.");
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
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
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
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail size={14} /> آدرس ایمیل متخصص هنوز تنظیم نشده؛ پیام ارسال نمی‌شود.
          </p>
          <Button className="w-full h-12" type="submit">
            {copied ? <Check /> : <Copy />}
            {copied ? "متن ایمیل کپی شد" : "کپی متن ایمیل"}
          </Button>
          {logStep >= 0 && (
            <div className="rounded-md border border-primary/30 bg-primary/5 p-3 font-mono text-[11px]" dir="ltr">
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
          <p role="status" className="text-sm text-primary">
            {error || (copied ? "پیش‌نویس آماده است؛ هنوز برای کسی ارسال نشده." : "")}
          </p>
        </form>
      </div>
    </div>
  );
}
