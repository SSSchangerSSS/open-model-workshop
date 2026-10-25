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
 * T2 — the intro must NEVER be part of the normal page path:
 *  - Shell renders no #boot-overlay in SSR / first render
 *  - the brand intro only mounts after the explicit footer button
 *  - skipping unmounts it (no orphan animated elements)
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

describe("Shell — brand intro is opt-in only (T2)", () => {
  it("does not render the boot overlay in the initial render", async () => {
    mountShell();
    // router mounts async in tests — wait for real content first
    await screen.findByText("محتوای اصلی تست");
    // no gate, no overlay anywhere in the initial page
    expect(document.querySelector("#boot-overlay")).toBeNull();
  });

  it("mounts the intro only after the explicit play button, and skip unmounts it", async () => {
    mountShell();
    const play = await screen.findByRole("button", { name: /پخش انیمیشن ورود برند/ });
    expect(document.querySelector("#boot-overlay")).toBeNull();

    fireEvent.click(play);
    // lazy chunk + mount
    await waitFor(() => expect(document.querySelector("#boot-overlay")).not.toBeNull(), {
      timeout: 4000,
    });

    // hundreds of decorative racks exist ONLY while playing
    const rackCount = document.querySelectorAll("#boot-overlay .animate-pulse").length;
    expect(rackCount).toBeGreaterThan(500);

    fireEvent.click(screen.getByRole("button", { name: /رد کردن/ }));
    await waitFor(() => expect(document.querySelector("#boot-overlay")).toBeNull());
  });
});
