import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactTerminal } from "@/components/ContactTerminal";

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

const fill = () => {
  fireEvent.change(screen.getByPlaceholderText("نام و نام خانوادگی"), {
    target: { value: "سارا" },
  });
  fireEvent.change(screen.getByPlaceholderText("you@company.com"), {
    target: { value: "sara@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("از پروژه‌تان بگویید…"), {
    target: { value: "سلام، برای اتوماسیون سفارش‌ها تماس گرفتم." },
  });
};

describe("ContactTerminal — draft copy is honest and recoverable", () => {
  it("copies the draft and confirms without claiming a send", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ContactTerminal />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: /کپی متن ایمیل/ }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    const draft = writeText.mock.calls[0]![0] as string;
    expect(draft).toContain("سارا");
    expect(draft).toContain("sara@example.com");
    expect(draft).toContain("اتوماسیون سفارش‌ها");
    expect(await screen.findByRole("status")).toHaveTextContent(/ارسال نشده/);
    // هیچ ادعای رمزنگاری/ارسال موفق در لاگ نیست
    expect(document.body.textContent).not.toContain("aes-256");
    expect(document.body.textContent).not.toContain("ارسال شد");
  });

  it("on clipboard failure shows a recoverable error and offers a selectable manual preview", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ContactTerminal />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: /کپی متن ایمیل/ }));

    const status = await screen.findByRole("status");
    await waitFor(() => expect(status).toHaveTextContent(/کپی خودکار انجام نشد/));
    // پیش‌نمایش قابل انتخاب برای کپی دستی — متن کامل پیش‌نویس داخلش هست
    const preview = screen.getByLabelText("پیش‌نمایش متن ایمیل") as HTMLTextAreaElement;
    expect(preview.value).toContain("سارا");
    expect(preview.value).toContain("sara@example.com");
  });

  it("carries the hardware preset (model + users) into the draft, without leaking secrets", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(
      <ContactTerminal
        preset={{ topic: "سخت‌افزار GPU", detail: "مدل: Qwen · 25 کاربر همزمان" }}
      />,
    );
    // preset lands in the message textarea immediately (user may still edit it)
    const msg = screen.getByPlaceholderText("از پروژه‌تان بگویید…") as HTMLTextAreaElement;
    expect(msg.value).toContain("مدل: Qwen · 25 کاربر همزمان");

    fireEvent.change(screen.getByPlaceholderText("نام و نام خانوادگی"), {
      target: { value: "سارا" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@company.com"), {
      target: { value: "sara@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /کپی متن ایمیل/ }));

    await waitFor(() => expect(writeText).toHaveBeenCalled());
    const draft = writeText.mock.calls[0]![0] as string;
    expect(draft).toContain("سخت‌افزار GPU");
    expect(draft).toContain("مدل: Qwen · 25 کاربر همزمان");
    expect(draft).not.toMatch(/api[_-]?key|token|password/i);
  });

  it("states honestly that nothing is sent while no recipient is configured", () => {
    render(<ContactTerminal />);
    expect(screen.getByText(/پیامی ارسال نمی‌شود/)).toBeInTheDocument();
  });
});
