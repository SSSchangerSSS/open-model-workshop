import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Shell } from "@/components/Shell";

/**
 * The mobile menu is a real Radix Sheet dialog. Mounted here inside a MINIMAL
 * router (one page, no scenes) so jsdom never touches WebGL — the wiring
 * under test is the Shell's own: trigger aria wiring, focus moves into the
 * dialog, Escape closes it, and a nav link closes it too.
 */
function mountShell() {
  const queryClient = new QueryClient();
  const rootRoute = createRootRoute({
    component: () => (
      <Shell>
        <div>محتوای اصلی تست</div>
      </Shell>
    ),
  });
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: Outlet });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("Shell — accessible mobile menu (Radix Sheet)", () => {
  it("skip link is present before any nav content", async () => {
    mountShell();
    const skip = await screen.findByRole("link", { name: "پرش به محتوای اصلی" });
    expect(skip).toHaveAttribute("href", "#main-content");
  });

  it("opens as an accessible dialog with aria wiring and focus inside", async () => {
    mountShell();
    const trigger = await screen.findByRole("button", { name: /باز کردن منو/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", "mobile-menu");

    fireEvent.click(trigger);

    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      // focus is moved INTO the dialog (trap + initial focus)
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    // readable title + labelled nav + the six destinations
    expect(screen.getByText(/menu_/)).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "ناوبری موبایل" })).toBeInTheDocument();
    for (const label of ["خانه", "خدمات", "سخت‌افزار", "مقایسه", "نمونه‌کارها", "تماس"]) {
      expect(screen.getAllByRole("link", { name: new RegExp(label) }).length).toBeGreaterThan(0);
    }
  });

  it("closes on Escape and restores aria-expanded=false", async () => {
    mountShell();
    const trigger = await screen.findByRole("button", { name: /باز کردن منو/ });
    fireEvent.click(trigger);
    await screen.findByRole("dialog");
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("clicking a menu link closes the menu (no stranded overlay)", async () => {
    mountShell();
    fireEvent.click(await screen.findByRole("button", { name: /باز کردن منو/ }));
    const dialog = await screen.findByRole("dialog");
    const contactLink = screen.getAllByRole("link", { name: /تماس/ }).at(-1)!;
    fireEvent.click(contactLink);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(dialog).not.toBeInTheDocument();
  });
});
