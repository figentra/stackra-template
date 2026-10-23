/**
 * Stackra file contract:
 * Purpose: proves the dashboard keeps a screen reader's `<h1>`, shows the loading state while
 *          today's KPIs are on their way, and the error state with a retry when they fail.
 * Boundary: unit tier, jsdom; the commerce client is faked at the HTTP boundary.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0164
 */
import { fakeClient } from "@stackra/clients/testing";
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { OrderKpisQuery } from "#stackra/clients/commerce";
import { Dashboard } from "#src/routes/dashboard/dashboard";

/** An actor who may read orders. */
const SESSION = { permissions: ["orders.order.read"] };

/** Guards the console's home screen. */
describe(Dashboard, () => {
  /** A failed KPI query is the error state with a retry, never an empty KPI row. */
  it("shows the error state with a retry when today's KPIs fail", async () => {
    const commerce = fakeClient((fake) => fake.on(OrderKpisQuery).throws(new Error("network")));
    render(<Dashboard />, { locale: "en", clients: [commerce], session: SESSION });
    expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeTruthy();
    expect(await screen.findByRole("button", { name: "Try again" })).toBeTruthy();
  });

  /** Until the answer arrives, the region says it is busy instead of showing zeros. */
  it("shows the loading state while the KPIs load", () => {
    const commerce = fakeClient((fake) => fake.on(OrderKpisQuery).pending());
    render(<Dashboard />, { locale: "en", clients: [commerce], session: SESSION });
    expect(screen.getByRole("status", { name: "Loading today's numbers" })).toBeTruthy();
  });
});
