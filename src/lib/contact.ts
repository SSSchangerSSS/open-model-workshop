/**
 * Single source of truth for contact information.
 *
 * صادق‌بودن داده‌ها (docs/ui-performance-audit.md):
 * - این مقادیر توسط ابزار ساخت سایت پیشنهاد شده‌اند و «تأییدشده» نیستند.
 *   تا زمانی که مالک سایت `verified: true` را صریحاً تنظیم نکند، رابط کاربری
 *   آن‌ها را به‌عنوان کانال تأییدنشده نمایش می‌دهد و مسیر مطمئن، ساخت/کپی
 *   پیش‌نویس پیام است (هیچ‌جا ارسال خودکار ادعا نمی‌شود).
 * - شماره/ایمیل جدید از هیچ منبعی ساخته نمی‌شود؛ همین مقادیر موجود حفظ
 *   شده‌اند. مالک می‌تواند مستقیماً همین‌جا ویرایش کند.
 */

export type ContactChannel = {
  key: string;
  label: string;
  value: string;
  /** href واقعی برای لینک استاندارد (tel:/mailto:/https) */
  href: string;
  ltr: boolean;
  /** فقط زمانی true بگذارید که خودتان مقصد را تأیید کرده باشید. */
  verified: boolean;
};

export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    key: "telegram",
    label: "تلگرام",
    value: "@hoosh_bartar",
    href: "https://t.me/hoosh_bartar",
    ltr: true,
    verified: false,
  },
  {
    key: "email",
    label: "ایمیل",
    value: "hello@hooshbartar.ir",
    href: "mailto:hello@hooshbartar.ir",
    ltr: true,
    verified: false,
  },
  {
    key: "phone",
    label: "تلفن دفتر",
    value: "۰۲۱ - ۹۱۰۰ ۰۰۰۰",
    href: "tel:+982191000000",
    ltr: false,
    verified: false,
  },
];

/**
 * ساعات کاری دفتر (به وقت تهران، ۰=یکشنبه … ۶=شنبه در Date#getDay).
 * مقدار null یعنی «تنظیم نشده» — در این حالت هیچ ادعای باز/بسته‌بودن زنده
 * نمایش داده نمی‌شود. برای فعال‌شدن وضعیت، مالک ساعت واقعی را اینجا بگذارد:
 *   مثال: { 0: [9, 18], 1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 14], 5: null, 6: [9, 18] }
 * (getDay: 0=Sunday … 5=Friday, 6=Saturday)
 */
export const OFFICE_HOURS_TEHRAN: Record<number, [number, number] | null> | null = null;

/** پیش‌نویس پیام مشترک بین فرم تماس و پنل‌های دیگر (سخت‌افزار، خدمات). */
export function buildDraft(input: {
  subject: string;
  name: string;
  email: string;
  message: string;
}): string {
  return `موضوع: درخواست مشاوره ${input.subject}\nنام: ${input.name}\nایمیل: ${input.email}\n\n${input.message}`;
}

export const NO_RECIPIENT_NOTE =
  "آدرس ایمیل مقصد هنوز تنظیم نشده است؛ با ثبت فرم فقط پیش‌نویس ساخته و کپی می‌شود — پیامی ارسال نمی‌شود.";
