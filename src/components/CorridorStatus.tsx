import { useEffect, useRef, useState } from "react";

const BOOT_LINE = "> ssh operator@dc-01.corridor — connected. telemetry stream (نمایشی):";

function pad(n: number, w = 2) {
  return n.toString().padStart(w, "0");
}

function faTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function CorridorStatus() {
  const [tick, setTick] = useState(0);
  const tps = useRef(58);
  const [clock, setClock] = useState("--:--:--");

  useEffect(() => {
    const t = setInterval(() => {
      setTick((n) => n + 1);
      tps.current = Math.max(44, Math.min(76, tps.current + Math.round((Math.random() - 0.5) * 8)));
      setClock(faTime(new Date()));
    }, 1400);
    setClock(faTime(new Date()));
    return () => clearInterval(t);
  }, []);

  const gpu = 62 + ((tick * 7) % 33);
  const temp = 58 + ((tick * 3) % 9);

  return (
    <section
      aria-label="تلمتری نمایشی دیتاسنتر — شبیه‌سازی، نه مانیتورینگ واقعی"
      className="border-y border-primary/20 bg-background/60 backdrop-blur-md"
      dir="ltr"
    >
      <div className="max-w-6xl mx-auto px-6 py-4 font-mono text-[11px] md:text-xs flex flex-wrap items-center gap-x-6 gap-y-2 justify-between">
        <span className="text-primary/80">{BOOT_LINE}</span>
        <span className="flex flex-wrap items-center gap-x-5 gap-y-1 text-muted-foreground">
          <span>
            TIME <b className="text-primary">{clock}</b>
          </span>
          <span>
            THROUGHPUT <b className="text-primary">{tps.current} tok/s</b>
          </span>
          <span>
            GPU-LOAD <b className="text-primary">{gpu}%</b>
          </span>
          <span>
            TEMP <b className={temp > 64 ? "text-accent" : "text-primary"}>{temp}°C</b>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="status-dot" />
            <b className="text-primary">44/44 RACKS</b>
          </span>
        </span>
      </div>
    </section>
  );
}
