/**
 * Stackra file contract:
 * Purpose: proves the offline page says the connection state as it changes, counts the changes
 *          waiting on the device with Arabic plurals, lists what still works offline in the
 *          regional overlay's words, and reloads the requested page on retry.
 * Boundary: unit tier, jsdom; the platform's network probe, the queue and `location` are the
 *           testing fakes; nothing reaches a service.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0255 (offline page), ADR 0252
 */
import { describe, expect, it, vi } from "@stackra/testing";
import { act, render, screen, userEvent } from "@stackra/testing/react";
import { Offline } from "#src/routes/offline/offline";

/** Guards the page a user sees when even the cached shell is missing. */
describe(Offline, () => {
  /** Offline it says so and offers the retry; the probe coming back changes the status. */
  it("follows the connection state and reloads on retry", async () => {
    const reload = vi.fn();
    const { platform } = render(<Offline />, {
      locale: "en",
      platform: { online: false },
      location: { reload },
    });
    expect(screen.getByRole("heading", { level: 1, name: "You are offline" })).toBeTruthy();
    expect(screen.getByRole("status")).toHaveTextContent("No connection");
    await act(() => platform.setOnline(true));
    expect(screen.getByRole("status")).toHaveTextContent("Connection restored");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reload).toHaveBeenCalledOnce();
  });

  /** Arabic lays the page out right to left and counts the queue with the dual form. */
  it("renders right to left with the queued count in Arabic", () => {
    render(<Offline />, {
      locale: "ar",
      platform: { online: false },
      queue: [{ key: "orders.order.create" }, { key: "orders.order.create" }],
    });
    expect(screen.getByRole("heading", { level: 1 }).closest("[dir]")?.getAttribute("dir")).toBe(
      "rtl",
    );
    expect(screen.getByText("تغييران بانتظار المزامنة.")).toBeTruthy();
  });

  /** en-US takes only its overlay's spelling; every other line falls back to `en`. */
  it("lists what works offline with the en-US overlay", () => {
    render(<Offline />, { locale: "en-US", platform: { online: false } });
    const list = screen.getByRole("list");
    expect(list).toHaveTextContent("the product catalog you already loaded");
    expect(list).toHaveTextContent("Reviewing and resolving your pending changes.");
  });
});
