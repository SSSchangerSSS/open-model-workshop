import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

/**
 * Unknown paths land on the Persian 404 with actionable next steps.
 * (On GitHub Pages the workflow copies index.html to 404.html, so deep
 * unknown URLs boot the SPA and hit this component.)
 */
describe("not-found — Persian 404 with actions", () => {
  it("renders the Persian 404 with a home link for unknown paths", async () => {
    const queryClient = new QueryClient();
    const history = createMemoryHistory({ initialEntries: ["/no-such-page"] });
    const router = createRouter({
      routeTree,
      context: { queryClient },
      history,
    });
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );
    await waitFor(
      () => {
        expect(container.textContent).toContain("صفحه پیدا نشد");
        expect(container.textContent).toContain("۴۰۴");
      },
      { timeout: 5000 },
    );
    const home = container.querySelector('a[href="/"], a[href$="/"]'); // home action present
    expect(home).not.toBeNull();
    expect(container.textContent).toContain("بازگشت به خانه");
  });
});
