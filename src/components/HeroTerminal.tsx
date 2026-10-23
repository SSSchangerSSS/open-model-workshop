import { useEffect, useRef, useState } from "react";

type Line = { kind: "in" | "out" | "ok" | "err"; text: string };

const WELCOME: Line[] = [
  { kind: "ok", text: "اتصال برقرار شد — کنسول دیتاسنتر هوش برتر v2.4" },
  {
    kind: "out",
    text: "سوال دارید؟ فرمان help را بنویسید و Enter بزنید؛ یا همین‌طور در راهرو اسکرول کنید.",
  },
];

const COMMANDS: Record<string, { desc: string; run: () => string[] }> = {
  help: {
    desc: "نمایش همین راهنما",
    run: () => [
      "فرمان‌های موجود:",
      ...Object.keys(COMMANDS).map((c) => `  ${c.padEnd(10, " ")} — ${COMMANDS[c]!.desc}`),
      "نکته: لاتین تایپ کنید؛ خروجی‌ها فارسی‌اند.",
    ],
  },
  status: {
    desc: "وضعیت نمایشی دیتاسنتر",
    run: () => [
      "RACKS ......... 44/44 ONLINE (نمایشی)",
      "GPU-LOAD ...... " + (58 + Math.floor(Math.random() * 30)) + "% (نمایشی)",
      "TEMP .......... " + (54 + Math.floor(Math.random() * 12)) + "°C (نمایشی)",
      "THROUGHPUT .... " + (48 + Math.floor(Math.random() * 26)) + " tok/s (نمایشی)",
      "توجه: این ترمینال دموی آموزشی است — به دیتاسنتر واقعی وصل نیست.",
    ],
  },
  models: {
    desc: "مدل‌های آماده اجرا",
    run: () => [
      "Qwen      — گفتگو و پردازش فارسی",
      "Llama     — ایجنت‌های سازمانی",
      "DeepSeek  — استدلال و برنامه‌نویسی",
      "Mistral   — استنتاج سریع و محلی",
      "برای فعال‌کردن نور رک‌ها، دکمه‌های پایین صفحه را بزنید.",
    ],
  },
  services: {
    desc: "فهرست خدمات",
    run: () => [
      "1) اتوماسیون با n8n",
      "2) ایجنت و چت‌بات با Flowise",
      "3) استقرار سرور هوش مصنوعی",
      "4) بستن سخت‌افزار GPU",
      "5) راه‌اندازی مدل‌های Open-Weight",
      "6) پشتیبانی و بهینه‌سازی",
      "جزئیات: صفحه /services",
    ],
  },
  contact: {
    desc: "راه اتصال به متخصص",
    run: () => [
      "راه ارتباطی: دکمه «درخواست مشاوره» یا «ارتباط با متخصص» در همین صفحه،",
      "یا مسیر /contact — پیش‌نویس پیام ساخته و کپی می‌شود.",
    ],
  },
  whoami: {
    desc: "که هستید؟",
    run: () => ["guest — بازدیدکننده راهرو دیتاسنتر؛ سطح دسترسی: تماشا و کنجکاوی."],
  },
  matrix: {
    desc: "؟",
    run: () => [
      "به منزل خوش آمدید، نئو.",
      "راهروی سبز همان چیزی است که به آن «زیرساخت خودمیزبان» می‌گوییم.",
    ],
  },
  clear: { desc: "پاک‌کردن صفحه", run: () => [] },
};

export function HeroTerminal() {
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  function submit(cmd: string) {
    const raw = cmd.trim();
    if (!raw) return;
    const out: Line[] = [{ kind: "in", text: raw }];
    const key = raw.toLowerCase().replace(/^\//, "");
    const c = COMMANDS[key];
    if (!c) {
      out.push({
        kind: "err",
        text: `فرمان ناشناخته: ${raw} — برای فهرست فرمان‌ها help را بزنید.`,
      });
    } else if (key === "clear") {
      setLines(WELCOME);
      setValue("");
      return;
    } else {
      for (const t of c.run()) out.push({ kind: "out", text: t });
    }
    setLines((l) => [...l.slice(-60), ...out]);
    setHistory((h) => [raw, ...h].slice(0, 30));
    setHIdx(-1);
    setValue("");
  }

  return (
    <div
      className="terminal-window hero-terminal select-none"
      onClick={() => inputRef.current?.focus()}
      role="group"
      aria-label="ترمینال تعاملی دیتاسنتر"
    >
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <span className="flex items-center gap-2 text-primary font-mono text-[11px]" dir="ltr">
          <span className="terminal-dots" style={{ marginLeft: 0 }} />
          guest@dc-01 — demo console
        </span>
        <span className="font-mono text-[10px] text-muted-foreground" dir="ltr">
          TTY-01
        </span>
      </div>
      <div ref={boxRef} className="hero-terminal-body px-4 py-3 space-y-1" dir="rtl">
        {lines.map((l, i) => (
          <div
            key={i}
            dir={l.kind === "in" ? "auto" : undefined}
            className={
              l.kind === "in"
                ? "font-mono text-xs text-foreground/90"
                : l.kind === "err"
                  ? "text-xs text-red-400/90"
                  : l.kind === "ok"
                    ? "text-xs text-primary"
                    : "text-xs text-muted-foreground"
            }
          >
            {l.kind === "in" ? (
              <span dir="ltr" className="text-primary font-mono">
                $&nbsp;
              </span>
            ) : null}
            {l.text}
          </div>
        ))}
      </div>
      <form
        className="flex items-center gap-2 border-t px-4 py-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
      >
        <span dir="ltr" className="font-mono text-xs text-primary shrink-0">
          guest@dc-01:~$
        </span>
        <input
          ref={inputRef}
          value={value}
          dir="auto"
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              const n = Math.min(history.length - 1, hIdx + 1);
              if (n >= 0) {
                setHIdx(n);
                setValue(history[n] ?? "");
              }
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              const n = hIdx - 1;
              setHIdx(n);
              setValue(n >= 0 ? (history[n] ?? "") : "");
            }
          }}
          className="hero-terminal-input flex-1 bg-transparent text-sm outline-none"
          placeholder="فرمان را بنویسید… (help)"
          aria-label="ورودی فرمان ترمینال"
        />
        <span className="cursor-blink" aria-hidden />
      </form>
    </div>
  );
}
