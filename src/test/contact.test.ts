import { describe, expect, it } from "vitest";
import { OFFICE_HOURS, isOfficeOpen, CONTACT_CHANNELS } from "@/lib/contact";

/** Build a UTC instant whose TEHRAN wall time is the given local values.
 *  Tehran = UTC+3:30 (no DST since 2022), so 10:00 Tehran == 06:30 UTC. */
function tehran(y: number, mo: number, d: number, h: number, mi = 0): Date {
  return new Date(Date.UTC(y, mo - 1, d, h - 3, mi - 30));
}

describe("office hours — honest open/closed, configurable", () => {
  // 2026-10-24 is a Saturday (شنبه, first working day in Iran)
  it("is open mid-morning on a working day", () => {
    expect(isOfficeOpen(tehran(2026, 10, 24, 10))).toBe(true);
  });

  it("is closed before opening and after closing hours", () => {
    expect(isOfficeOpen(tehran(2026, 10, 24, 7))).toBe(false);
    expect(isOfficeOpen(tehran(2026, 10, 24, 19))).toBe(false);
  });

  it("is closed on Friday (جمعه) even at noon", () => {
    // 2026-10-30 is a Friday
    expect(isOfficeOpen(tehran(2026, 10, 30, 12))).toBe(false);
  });

  it("respects the configured boundary hours", () => {
    expect(isOfficeOpen(tehran(2026, 10, 24, OFFICE_HOURS.startHour))).toBe(true);
    expect(isOfficeOpen(tehran(2026, 10, 24, OFFICE_HOURS.endHour))).toBe(false);
  });
});

describe("contact channels — single shared config", () => {
  it("keeps exactly the channels the site already published (nothing invented)", () => {
    expect(CONTACT_CHANNELS.map((c) => c.id)).toEqual(["telegram", "email", "phone"]);
  });

  it("every channel has a usable href matching its value", () => {
    for (const c of CONTACT_CHANNELS) {
      expect(c.href).toBeTruthy();
      expect(c.actionFa).toBeTruthy();
    }
    const tg = CONTACT_CHANNELS.find((c) => c.id === "telegram")!;
    expect(tg.href).toBe("https://t.me/hoosh_bartar");
    const mail = CONTACT_CHANNELS.find((c) => c.id === "email")!;
    expect(mail.href).toBe(`mailto:${mail.value}`);
    const tel = CONTACT_CHANNELS.find((c) => c.id === "phone")!;
    expect(tel.href).toMatch(/^tel:\+?\d/);
  });
});
