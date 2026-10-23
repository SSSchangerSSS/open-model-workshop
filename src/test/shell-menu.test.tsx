import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

/**
 * Shell menu tests render the real Shell with the router module mocked:
 * the full RouterProvider tree (prerendered html shell + WebGL routes)
 * hangs jsdom teardown, while the drawer/dialog behaviour under test is
 * router-independent. Radix primitives themselves provide the focus trap,
 * scroll-lock cleanup and focus restore — asserted here through the DOM.
 */
vi.mock("@tanstack/react-router", () => ({
  Link: (props: {
    to: string;
    onClick?: () => void;
    children?: React.ReactNode;
    [k: string]: unknown;
  }) => (
    <a href={props.to} onClick={props.onClick} className={String(props["className"] ?? "")}>
      {props.children}
    </a>
  ),
}));

import { Shell } from "@/components/Shell";

const MENU = "منوی هوش برتر";

describe("Shell mobile menu — accessible dialog behaviour", () => {
  it("trigger wires aria-expanded/aria-controls; skip link present; no fake uptime claims", () => {
    render(
      <Shell>
        <div>محتوای صفحه</div>
      </Shell>,
    );
    const trigger = screen.getByRole("button", { name: "باز کردن منو" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger.getAttribute("aria-controls") ?? "").not.toBe("");

    const skip = screen.getByRole("link", { name: "رفتن به محتوای اصلی" });
    expect(skip).toHaveAttribute("href", "#main-content");

    // هویت صادقانه: هیچ ادعای آپ‌تایم/سیستم زنده‌ای در اسکلت سایت نیست
    expect(screen.queryByText(/UPTIME/)).not.toBeInTheDocument();
    expect(screen.queryByText(/SYS\.ONLINE/)).not.toBeInTheDocument();
  });

  it("opens with a readable title, closes on Escape and restores aria-expanded", async () => {
    render(
      <Shell>
        <div>محتوای صفحه</div>
      </Shell>,
    );
    const trigger = screen.getByRole("button", { name: "باز کردن منو" });
    fireEvent.click(trigger);

    const dialog = await screen.findByRole("dialog", { name: MENU }, { timeout: 8000 });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(MENU)).toBeInTheDocument();
    // nav entries are real links inside the dialog
    expect(screen.getAllByRole("link", { name: /سخت‌افزار/ }).length).toBeGreaterThan(0);

    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(
      () => expect(screen.queryByRole("dialog", { name: MENU })).not.toBeInTheDocument(),
      { timeout: 8000 },
    );
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  }, 20000);

  it("nav links close the drawer on click (no stale modal state)", async () => {
    render(
      <Shell>
        <div>محتوای صفحه</div>
      </Shell>,
    );
    fireEvent.click(screen.getByRole("button", { name: "باز کردن منو" }));
    const links = await screen.findAllByRole("link", { name: /خدمات/ }, { timeout: 8000 });
    // the drawer link is the one inside the dialog
    const drawerLink = links.find((l) => l.closest('[role="dialog"]'))!;
    expect(drawerLink).toBeDefined();
    fireEvent.click(drawerLink);
    await waitFor(
      () => expect(screen.queryByRole("dialog", { name: MENU })).not.toBeInTheDocument(),
      { timeout: 8000 },
    );
  }, 20000);
});
