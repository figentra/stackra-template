/**
 * Stackra file contract:
 * Purpose: proves the status badge shows the translated status in both sizes, never the raw code,
 *          in English and Arabic.
 * Boundary: unit tier, jsdom; `renderOverride` mounts the class's component with props typed from
 *           the point.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0080
 */
import { describe, expect, it } from "@stackra/testing";
import { renderOverride, screen } from "@stackra/testing/react";
import { Commerce } from "#stackra/clients";
import {
  OrderStatusBadgeOverride,
} from "#src/overrides/orders/components/order-status-badge.override";

/** Guards the badge the order table and the order page share. */
describe(OrderStatusBadgeOverride, () => {
  /** A table cell is no place for `pending_payment`: the compact chip is translated too. */
  it("shows the translated status in the compact table chip", () => {
    const status = Commerce.enums.OrderStatus.PendingPayment;
    renderOverride(OrderStatusBadgeOverride, { status, compact: true }, { locale: "en" });
    expect(screen.getByText("Pending payment")).toBeTruthy();
    expect(screen.queryByText("pending_payment")).toBeNull();
  });

  /** Arabic readers get the Arabic label in the full-size chip. */
  it("shows the Arabic label in the infolist chip", () => {
    const status = Commerce.enums.OrderStatus.Paid;
    renderOverride(OrderStatusBadgeOverride, { status, compact: false }, { locale: "ar" });
    expect(screen.getByText("مدفوع")).toBeTruthy();
    expect(screen.queryByText("paid")).toBeNull();
  });
});
