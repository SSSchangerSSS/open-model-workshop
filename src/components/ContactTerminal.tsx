import { useState } from "react";
import { Copy, Check, Mail, Terminal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  async function prepare(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await navigator.clipboard.writeText(
        `موضوع: درخواست مشاوره ${model}\nنام: ${name}\nایمیل: ${email}\n\n${message}`,
      );
      setCopied(true);
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
        </p>
        <h2 className="mt-4 text-2xl font-bold">آن سوی کد، یک انسان است.</h2>
        <p className="mt-2 text-sm text-muted-foreground">موضوع گفتگو: {model}</p>
        <form onSubmit={prepare} className="mt-7 space-y-4">
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
          <p role="status" className="text-sm text-primary">
            {error || (copied ? "پیش‌نویس آماده است؛ هنوز برای کسی ارسال نشده." : "")}
          </p>
        </form>
      </div>
    </div>
  );
}
