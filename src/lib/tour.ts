/**
 * Guided scroll tour through the corridor.
 * Scroll progress (0→1) maps to camera waypoints with eased dwell stops,
 * so the walk "pauses" at each sector exactly like a datacenter tour.
 */

export type TourStop = {
  at: number; // scroll progress 0→1
  z: number; // camera depth
  zone: string; // latin zone code
  fa: string; // persian sector name
  en: string; // latin sector name
};

export const TOUR: readonly TourStop[] = [
  { at: 0.0, z: 12, zone: "GATE", fa: "ورودی دیتاسنتر", en: "MAIN GATE" },
  { at: 0.14, z: -4, zone: "SEC-01", fa: "ردیف اتوماسیون · n8n", en: "AUTOMATION ROW" },
  { at: 0.3, z: -15.5, zone: "SEC-02", fa: "رک‌های مدل‌های زبانی", en: "LLM RACKS" },
  { at: 0.48, z: -28.5, zone: "SEC-03", fa: "رک GPU · آموزش مدل", en: "GPU TRAINING" },
  { at: 0.66, z: -40, zone: "SEC-04", fa: "ذخیره‌سازی و شبکه", en: "STORAGE · NET" },
  { at: 0.84, z: -49, zone: "APPROACH", fa: "در حال نزدیک‌شدن به هسته", en: "CORE APPROACH" },
  { at: 1.0, z: -52.6, zone: "CORE", fa: "هسته هوش مصنوعی", en: "AI CORE" },
] as const;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** Camera depth for a scroll progress value. */
export function tourZ(p: number): number {
  const t = clamp01(p);
  for (let i = 0; i < TOUR.length - 1; i++) {
    const a = TOUR[i];
    const b = TOUR[i + 1];
    if (!a || !b) break;
    if (t <= b.at || i === TOUR.length - 2) {
      const span = b.at - a.at || 1;
      return a.z + (b.z - a.z) * ease(clamp01((t - a.at) / span));
    }
  }
  return TOUR[TOUR.length - 1]?.z ?? 0;
}

/** The sector the visitor is currently in (or approaching). */
export function zoneAt(p: number): TourStop {
  const t = clamp01(p);
  let stop: TourStop = TOUR[0] ?? {
    at: 0,
    z: 12,
    zone: "GATE",
    fa: "ورودی دیتاسنتر",
    en: "MAIN GATE",
  };
  for (const s of TOUR) if (t >= s.at - 0.02) stop = s;
  return stop;
}

/** Walk depth 0→1 for HUD meters. */
export function depth01(z: number): number {
  const start = TOUR[0]?.z ?? 12;
  const end = TOUR[TOUR.length - 1]?.z ?? -52.6;
  return clamp01((start - z) / (start - end));
}

/** Nearest rack number (2..44, both sides) to a camera depth; rows every 3 units. */
export function rackNoAt(z: number): number {
  return Math.min(44, Math.max(2, Math.round(((8.5 - z) / 3) * 2)));
}
