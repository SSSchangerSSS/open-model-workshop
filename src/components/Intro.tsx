import { useEffect, useState } from "react";

const RACKS = 10;

function Rack({ side, i }: { side: "l" | "r"; i: number }) {
  const z = -i * 220;
  const x = side === "l" ? -260 : 260;
  return (
    <div
      className="absolute left-1/2 top-1/2 h-[340px] w-[200px] -ml-[100px] -mt-[170px] rounded-sm border border-primary/30 bg-card"
      style={{ transform: `translate3d(${x}px,0,${z}px) rotateY(${side === "l" ? 90 : -90}deg)` }}
    >
      {Array.from({ length: 14 }).map((_, k) => (
        <div key={k} className="mx-2 mt-1.5 flex h-4 items-center gap-1 rounded-[2px] bg-muted px-1">
          {Array.from({ length: 6 }).map((_, j) => (
            <span key={j} className="h-1 w-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${((i * 7 + k * 3 + j) % 10) * 0.15}s`, opacity: (k + j + i) % 3 ? 1 : 0.2 }} />
          ))}
          <span className="ms-auto h-1 w-6 rounded bg-accent/60" />
        </div>
      ))}
    </div>
  );
}

export function Intro() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("intro")) return;
    sessionStorage.setItem("intro", "1");
    setShow(true);
    const a = setTimeout(() => setLeaving(true), 3600);
    const b = setTimeout(() => setShow(false), 4400);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  if (!show) return null;
  return (
    <div className={`fixed inset-0 z-[100] overflow-hidden bg-background transition-opacity duration-700 ${leaving ? "opacity-0" : ""}`} style={{ perspective: "700px" }}>
      <div className="absolute inset-0 intro-fly" style={{ transformStyle: "preserve-3d" }}>
        {/* floor */}
        <div className="absolute left-1/2 top-1/2 h-[2400px] w-[520px] -ml-[260px] intro-floor" style={{ transform: "translate3d(0,170px,-1100px) rotateX(90deg)" }} />
        {/* ceiling lights */}
        {Array.from({ length: RACKS }).map((_, i) => (
          <div key={i} className="absolute left-1/2 top-1/2 h-2 w-[300px] -ml-[150px] bg-primary/70 blur-[2px]" style={{ transform: `translate3d(0,-200px,${-i * 220}px) rotateX(90deg)` }} />
        ))}
        {Array.from({ length: RACKS }).map((_, i) => <Rack key={"l" + i} side="l" i={i} />)}
        {Array.from({ length: RACKS }).map((_, i) => <Rack key={"r" + i} side="r" i={i} />)}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none intro-title">
        <div className="font-mono text-sm text-primary">&gt; booting datacenter…</div>
        <h1 className="mt-3 text-5xl md:text-7xl font-black text-gradient">هوش برتر</h1>
      </div>
      <button onClick={() => setShow(false)} className="absolute bottom-8 left-8 rounded-lg border bg-card/70 px-4 py-2 text-sm text-muted-foreground hover:text-primary">رد کردن ←</button>
    </div>
  );
}
