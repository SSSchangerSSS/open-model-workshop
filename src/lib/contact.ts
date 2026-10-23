/**
 * Single source of truth for contact channels and office hours.
 *
 * Honest-data rules:
 * - The handles below are exactly what the site already published; nothing
 *   new was invented. If a channel is unconfirmed, keep it displayed as a
 *   draft/copy affordance instead of a hard "call us" promise.
 * - There is NO sending endpoint: the contact form assembles a draft only.
 *   Real delivery requires a configured server endpoint + success response,
 *   and any secret/key must live server-side, never in this client bundle.
 * - Office status is derived from the configurable work hours below — never
 *   from "it is not Friday, so we must be open".
 */

export type ContactChannel = {
  id: string;
  icon: "telegram" | "mail" | "phone";
  label: string;
  value: string;
  href: string;
  /** Where the href leads, shown to the user so mailto/tel never surprises. */
  actionFa: string;
  /** true = owner-confirmed destination; false = treat as unverified. */
  verified: boolean;
};

export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    id: "telegram",
    icon: "telegram",
    label: "تلگرام",
    value: "@hoosh_bartar",
    href: "https://t.me/hoosh_bartar",
    actionFa: "باز کردن گفتگو در تلگرام",
    verified: false,
  },
  {
    id: "email",
    icon: "mail",
    label: "ایمیل",
    value: "hello@hooshbartar.ir",
    href: "mailto:hello@hooshbartar.ir",
    actionFa: "باز کردن برنامهٔ ایمیل شما (mailto) — پیام مستقیم ارسال نمی‌شود",
    verified: false,
  },
  {
    id: "phone",
    icon: "phone",
    label: "تلفن دفتر",
    value: "۰۲۱ - ۹۱۰۰ ۰۰۰۰",
    href: "tel:+982191000000",
    actionFa: "برقراری تماس تلفنی",
    verified: false,
  },
];

export const OFFICE_HOURS = {
  /** 0=Saturday … 6=Friday (Intl weekday index in fa-IR calendar is ISO-like
   *  when using en-US locale with Asia/Tehran timezone: 0=Sunday — mapped below). */
  openWeekdaysFa: "شنبه تا پنجشنبه",
  /** Office is CLOSED on these Intl weekdays (en-US locale: 0=Sun…6=Sat). */
  closedWeekdays: [5], // Friday
  startHour: 9, // 09:00 Tehran time
  endHour: 18, // 18:00 Tehran time
  noteFa: "ساعات کاری دفتر: شنبه تا پنجشنبه، ۹ تا ۱۸ (به وقت تهران)",
} as const;

/** Honest open/closed from real Tehran time + the configurable hours above. */
export function isOfficeOpen(now: Date): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(now);
  const weekdayShort = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const idx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekdayShort);
  if ((OFFICE_HOURS.closedWeekdays as readonly number[]).includes(idx)) return false;
  return hour >= OFFICE_HOURS.startHour && hour < OFFICE_HOURS.endHour;
}

/** Non-sensitive payload kept when navigating from the hardware estimator
 *  to /contact — model name + settings only, never credentials. */
export type HardwareInquiry = {
  modelId: string;
  modelFa: string;
  modelEn: string;
  users: number;
  gpus: string;
  priceTotalUsd: number;
};

const HW_KEY = "hw-inquiry";

export function saveHardwareInquiry(q: HardwareInquiry): void {
  try {
    sessionStorage.setItem(HW_KEY, JSON.stringify(q));
  } catch {
    /* private mode — feature is optional */
  }
}

export function loadHardwareInquiry(): HardwareInquiry | null {
  try {
    const raw = sessionStorage.getItem(HW_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as HardwareInquiry;
    return v && typeof v.modelId === "string" ? v : null;
  } catch {
    return null;
  }
}

export function clearHardwareInquiry(): void {
  try {
    sessionStorage.removeItem(HW_KEY);
  } catch {
    /* noop */
  }
}
