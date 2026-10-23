import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContactTerminal } from "@/components/ContactTerminal";
import { ChannelCard } from "@/routes/contact";
import { CONTACT_CHANNELS } from "@/lib/contact";

const DRAFT = "موضوع: درخواست مشاوره سخت‌افزار GPU\nنام: تست\nایمیل: t@t.co\n\nسلام";

function mountTerminal() {
  return render(<ContactTerminal model="سخت‌افزار GPU" />);
}

async function fillAndSubmit() {
  fireEvent.change(screen.getByPlaceholderText("نام و نام خانوادگی"), {
    target: { value: "تست" },
  });
  fireEvent.change(screen.getByPlaceholderText("you@company.com"), {
    target: { value: "t@t.co" },
  });
  fireEvent.change(screen.getByPlaceholderText("از پروژه‌تان بگویید…"), {
    target: { value: "سلام" },
  });
  fireEvent.click(screen.getByRole("button", { name: /ساخت پیش‌نویس و کپی/ }));
}

describe("ContactTerminal — clipboard copy paths", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("copies the assembled draft and shows the honest «not sent» status", async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText: write } });
    mountTerminal();
    await fillAndSubmit();
    await waitFor(() => expect(screen.getByText(/متن ایمیل کپی شد/)).toBeInTheDocument());
    const arg = write.mock.calls[0]![0] as string;
    expect(arg).toContain("موضوع: درخواست مشاوره سخت‌افزار GPU");
    expect(arg).toContain("تست");
    expect(screen.getByText(/ارسال نشده/)).toBeInTheDocument();
    // honest transmission log — no fake encryption claims
    expect(screen.getByText(/> draft.assemble/)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("aes-256");
  });

  it("falls back to a selectable draft with a visible alert when the clipboard is denied", async () => {
    const write = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText: write } });
    mountTerminal();
    await fillAndSubmit();
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("کپی خودکار انجام نشد");
    // the manual-copy escape hatch is always there
    const draft = screen.getByLabelText("پیش‌نویس ایمیل برای کپی دستی") as HTMLTextAreaElement;
    expect(draft.readOnly).toBe(true);
    expect(draft.value).toContain("موضوع: درخواست مشاوره سخت‌افزار GPU");
  });
});

describe("ChannelCard — link + copy button", () => {
  it("renders the channel as a REAL link and keeps copy as a sibling", () => {
    const c = CONTACT_CHANNELS[0]!;
    render(<ChannelCard c={c} />);
    const link = screen.getByRole("link", { name: new RegExp(c.value) });
    expect(link).toHaveAttribute("href", c.href);
    expect(link.querySelector("button")).toBeNull(); // no button nested in the link
    expect(screen.getByRole("button", { name: `کپی ${c.label}` })).not.toBeNull();
    // the destination behaviour is stated in text, not hidden behind hover
    expect(screen.getByText(c.actionFa)).toBeInTheDocument();
  });

  it("shows a visible error when copying fails (never silent)", async () => {
    const write = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText: write } });
    const c = CONTACT_CHANNELS[0]!;
    render(<ChannelCard c={c} />);
    fireEvent.click(screen.getByRole("button", { name: `کپی ${c.label}` }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("کپی خودکار نشد"));
  });

  it("marks the mailto channel as «opens your mail app», not delivery", () => {
    const mail = CONTACT_CHANNELS.find((c) => c.id === "email")!;
    expect(mail.actionFa).toMatch(/ارسال نمی‌شود/);
  });
});
