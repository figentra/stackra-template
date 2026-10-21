/**
 * Stackra file contract:
 * Purpose: renders formatted revenue from the query output, in English and in Arabic (RTL).
 * Boundary: unit tier, @stackra/testing/native providers; no container, no network.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0080
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/native";
import { RevenueSparkline } from "#src/components/ui/revenue-sparkline";

const data = { count: 3, revenueMinor: 12_345, currency: "USD", hourly: Array(24).fill(0) };

/** The widget tile. */
describe("RevenueSparkline", () => {
  /** Money in the order currency. */
  it("shows revenue in the order currency", () => {
    render(<RevenueSparkline data={data} />, { locale: "en" });
    expect(screen.getByText("$123.45")).toBeTruthy();
  });

  /** Same amount, right-to-left layout, Arabic label from the orders namespace. */
  it("renders right-to-left in Arabic with the same amount", () => {
    const { direction } = render(<RevenueSparkline data={data} />, { locale: "ar" });
    expect(direction).toBe("rtl");
    expect(screen.getByLabelText("إيرادات اليوم")).toBeTruthy();
  });
});
