/**
 * Stackra file contract:
 * Purpose: proves the quick-order form names its page with an `<h1>` and labels every field, and
 *          keeps an empty order from leaving the browser.
 * Boundary: unit tier, jsdom; the page renders under the testing router with its route's submit
 *           stubbed; the commerce search is faked at the HTTP boundary.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0165 (form adapters)
 */
import { fakeClient } from "@stackra/clients/testing";
import { describe, expect, it } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/react";
import { Commerce } from "#stackra/clients";
import { QuickOrderPage } from "#src/components/pages/quick-order";

/** Guards the screen staff place orders from. */
describe(QuickOrderPage, () => {
  /** Without a variant the schema refuses in the browser, so no order request is made. */
  it("labels its fields and refuses an order without a variant", async () => {
    const commerce = fakeClient(Commerce, (fake) =>
      fake.queries.SearchVariants.returns({ items: [] }),
    );
    render(<QuickOrderPage />, { locale: "en", clients: [commerce], route: "/quick-order" });
    expect(screen.getByRole("heading", { level: 1, name: "Quick order" })).toBeTruthy();
    expect(screen.getByLabelText("Quantity")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Place order" }));
    expect(commerce.called(Commerce.actions.CreateOrder)).toHaveLength(0);
  });
});
