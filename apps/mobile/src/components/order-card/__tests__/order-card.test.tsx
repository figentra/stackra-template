/**
 * Stackra file contract:
 * Purpose: the card formats money in the order currency, translates the status through the
 *          producer's enum, reports the id on press, and opens `OrderCardMenu` on a long press.
 * Boundary: unit tier; a hand-built view, no client.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0080, ADR 0192
 */
import { describe, expect, it, vi } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/native";
import { OrderCard } from "#src/components/order-card";
import { OrderStatus, type OrderView } from "#stackra/clients/commerce";

const order: OrderView = {
  id: "ord_01H2J3K4L5M6N7P8Q9R0ABCDEF",
  status: OrderStatus.Paid,
  customerId: "usr_01H2J3K4L5M6N7P8Q9R0ABCDEF",
  totals: { currency: "SAR", subtotalMinor: 5000, totalMinor: 4500, adjustments: [] },
  lines: [],
  createdAt: new Date("2026-10-21T09:30:00Z"),
  paidAt: new Date("2026-10-21T09:32:00Z"),
};

/** One list row. */
describe("OrderCard", () => {
  /** Money by the i18n hook; the status label by its key `orders::enums.order_status.paid`. */
  it("formats the total in the order currency and translates the status", () => {
    render(<OrderCard order={order} onPress={vi.fn()} />, { locale: "en" });
    expect(screen.getByText("SAR 45.00")).toBeTruthy();
    expect(screen.getByText("Paid")).toBeTruthy();
  });

  /** ADR 0192: Latin digits unless the user opts in; the press hands over the public id. */
  it("keeps Latin digits in Arabic by default and reports the id on press", async () => {
    const onPress = vi.fn();
    render(<OrderCard order={order} onPress={onPress} />, { locale: "ar" });
    expect(screen.getByText(/45\.00/)).toBeTruthy();
    await userEvent.press(screen.getByRole("button", { name: /ord_01H2J3K4L5M6N7P8Q9R0ABCDEF/ }));
    expect(onPress).toHaveBeenCalledWith(order.id);
  });

  /**
   * The long-press menu offers the declared items; cancel is hidden when the actor may not cancel.
   */
  it("opens the context menu on a long press", async () => {
    render(<OrderCard order={order} onPress={vi.fn()} />, { locale: "en", permissions: [] });
    await userEvent.longPress(screen.getByTestId(`order-${order.id}`));
    expect(screen.getByRole("menuitem", { name: "Open order" })).toBeTruthy();
    expect(screen.queryByRole("menuitem", { name: "Cancel order" })).toBeNull();
  });
});
