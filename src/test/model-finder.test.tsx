import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { ModelFinder } from "@/routes/hardware";
import { CATEGORIES, MODELS, type ModelCategory } from "@/lib/sizing";

/** Stateful harness so filter callbacks behave like the real page.
 *  `recordOnly` skips opening the sheet (no router context in isolation). */
function FinderHarness({
  onOpen,
  recordOnly = false,
}: {
  onOpen?: (id: string) => void;
  recordOnly?: boolean;
}) {
  const [catFilter, setCatFilter] = useState<ModelCategory | null>(null);
  const [selId, setSelId] = useState<string | null>(null);
  return (
    <ModelFinder
      selId={selId}
      users={10}
      setUsers={() => {}}
      catFilter={catFilter}
      toggleCat={(c) =>
        setCatFilter((cur) => {
          const next = cur === c ? null : c;
          if (next) setSelId(null);
          return next;
        })
      }
      onOpen={(id) => {
        onOpen?.(id);
        if (!recordOnly) setSelId((cur) => (cur === id ? null : id));
      }}
      onClose={() => setSelId(null)}
    />
  );
}

describe("ModelFinder — the lite (no-WebGL) hardware view", () => {
  it("lists all models with a result count by default", () => {
    render(<FinderHarness />);
    expect(screen.getByText(/مدل از ۶۱/).textContent).toContain("۶۱ مدل از ۶۱");
    expect(screen.getAllByRole("article").length).toBe(MODELS.length);
  });

  it("search narrows results and the count follows", () => {
    render(<FinderHarness />);
    fireEvent.change(screen.getByLabelText("جست‌وجوی مدل"), { target: { value: "Qwen" } });
    const articles = screen.getAllByRole("article");
    expect(articles.length).toBeGreaterThan(0);
    expect(articles.length).toBeLessThan(MODELS.length);
  });

  it("category filter narrows to that category's models", () => {
    render(<FinderHarness />);
    const cat = CATEGORIES[0]!;
    fireEvent.click(screen.getByRole("button", { name: new RegExp(cat.fa) }));
    const expected = MODELS.filter((m) => m.cat === cat.key).length;
    expect(screen.getAllByRole("article").length).toBe(expected);
    // «همهٔ دسته‌ها» restores the full list
    fireEvent.click(screen.getByRole("button", { name: /همهٔ دسته‌ها/ }));
    expect(screen.getAllByRole("article").length).toBe(MODELS.length);
  });

  it("impossible query shows the empty state (never zero-rendered as data)", () => {
    render(<FinderHarness />);
    fireEvent.change(screen.getByLabelText("جست‌وجوی مدل"), {
      target: { value: "موجود-نیست-xyz" },
    });
    expect(screen.getByText(/مدلی با این نام یا دسته پیدا نشد/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /پاک‌کردن جست‌وجو/ }));
    expect(screen.getAllByRole("article").length).toBe(MODELS.length);
  });

  it("opening a model selects it by its stable id (not a fragile index)", () => {
    let opened: string | null = null;
    // record the id without opening the sheet — the sheet itself is covered
    // by the Radix dialog tests; here we verify the ID-based contract
    render(<FinderHarness recordOnly onOpen={(id) => (opened = id)} />);
    fireEvent.click(screen.getAllByRole("button", { name: /محاسبهٔ دقیق/ })[0]!);
    expect(typeof opened).toBe("string");
    expect(MODELS.some((m) => m.id === opened)).toBe(true);
  });
});
