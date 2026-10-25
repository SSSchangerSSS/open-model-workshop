import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Route as HardwareRoute } from "@/routes/hardware";

/**
 * T1 regression — the selected-model Sheet used to be `open` on EVERY
 * viewport with only a CSS `md:hidden` on its content, so on desktop the
 * Radix overlay + focus trap + scroll lock went live invisibly while the
 * details panel was nowhere to be found.
 *
 * Contract now:
 *  - compact viewport  → real bottom Sheet dialog (Escape closes it)
 *  - desktop viewport  → visible fixed details panel, NO dialog, NO body lock
 *  - live resize flips between the two without losing the selection
 */

function stubMatchMedia() {
  const state = { matches: false };
  const listeners = new Set<() => void>();
  const mqlFactory = (query: string): MediaQueryList => {
    const mql = {
      media: query,
      onchange: null,
      addEventListener: (_t: string, cb: () => void) => listeners.add(cb),
      removeEventListener: (_t: string, cb: () => void) => listeners.delete(cb),
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    };
    Object.defineProperty(mql, "matches", { get: () => state.matches });
    return mql as unknown as MediaQueryList;
  };
  const spy = vi
    .spyOn(window, "matchMedia")
    .mockImplementation(mqlFactory as unknown as typeof window.matchMedia);
  return {
    set(matches: boolean) {
      state.matches = matches;
      listeners.forEach((l) => l());
    },
    restore: () => spy.mockRestore(),
  };
}

function mountHardwarePage() {
  const queryClient = new QueryClient();
  const Page = HardwareRoute.options.component!;
  const rootRoute = createRootRoute({ component: () => <Page /> });
  const hwRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/hardware",
    component: Page,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([hwRoute]),
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: ["/hardware"] }),
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

async function pickFirstModel() {
  // any model card in the catalog list
  const card = await screen.findByRole("button", { name: /کوئن ۲٫۵ ۷ میلیاردی/ });
  fireEvent.click(card);
}

describe("hardware — model details panel per viewport (T1)", () => {
  afterEach(() => {
    document.body.style.removeProperty("pointer-events");
    vi.restoreAllMocks();
  });

  it("desktop (1366): selecting a model shows the details panel — no dialog, no body lock", async () => {
    const mm = stubMatchMedia();
    mm.set(false); // desktop
    mountHardwarePage();
    await pickFirstModel();

    // the real panel with the calculator is visible
    const panel = await screen.findByRole("complementary", { name: "جزئیات مدل انتخاب‌شده" });
    expect(panel).toBeInTheDocument();
    expect(screen.getByText(/برآورد هزینهٔ سخت‌افزار/)).toBeInTheDocument();

    // and NO Radix dialog/overlay went live
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.pointerEvents).not.toBe("none");
    mm.restore();
  });

  it("mobile (390): selecting a model opens the Sheet dialog; Escape closes it", async () => {
    const mm = stubMatchMedia();
    mm.set(true); // phone
    mountHardwarePage();
    await pickFirstModel();

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/برآورد هزینهٔ سخت‌افزار/)).toBeInTheDocument();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    mm.restore();
  });

  it("live resize 390↔1366 with a selection: sheet and panel swap, selection survives", async () => {
    const mm = stubMatchMedia();
    mm.set(true); // start phone-sized
    mountHardwarePage();
    await pickFirstModel();
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    mm.set(false); // grow to desktop — sheet must unmount, panel must appear
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(
      screen.getByRole("complementary", { name: "جزئیات مدل انتخاب‌شده" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/برآورد هزینهٔ سخت‌افزار/)).toBeInTheDocument();
    // the users control survived the swap
    expect(screen.getByLabelText("تعداد کاربران همزمان (عدد)")).toBeInTheDocument();

    mm.set(true); // back to phone — panel goes, sheet returns
    await waitFor(() =>
      expect(screen.queryByRole("complementary", { name: "جزئیات مدل انتخاب‌شده" })).toBeNull(),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    mm.restore();
  });
});
