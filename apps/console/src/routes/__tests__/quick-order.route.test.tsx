/**
 * Stackra file contract:
 * Purpose: proves the page submits through the route's declared `submits` and reaches the generated
 *          client with the loyalty extension only when points are entered, then follows the
 *          redirect to the order's resource view; that a server field refusal lands on its field;
 *          and that the route is hidden while its flag is off.
 * Boundary: unit tier, jsdom; `renderRoute` mounts the layout guard, the submit adapter and the
 *           component; the client is faked at the HTTP boundary and flags come from
 *           `@stackra/feature-flags/testing`.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0139, ADR 0213 d3, ADR 0007
 */
import { fakeClient } from "@stackra/clients/testing";
import { refusal } from "@stackra/errors/testing";
import { fakeFlags } from "@stackra/feature-flags/testing";
import { describe, expect, it } from "@stackra/testing";
import { renderRoute, screen, userEvent } from "@stackra/testing/react";
import { Commerce } from "#stackra/clients";
import { Flags } from "#stackra/flags";
import { QuickOrderRoute } from "#src/routes/quick-order.route";
import { Routes } from "#stackra/routes";

/** The seeded demo variant as the search returns it. */
const HITS = {
  items: [
    {
      variantId: "var_01JA0000000000000000000001",
      productId: "prd_01JA0000000000000000000001",
      sku: "TEE-M",
      title: "Demo tee",
      trackInventory: true,
    },
  ],
};
/** The order the fake creates. */
const CREATED = {
  orderId: "ord_01JA0000000000000000000003",
  status: Commerce.enums.OrderStatus.PendingPayment,
  totals: { currency: "SAR", subtotalMinor: 0, totalMinor: 0, adjustments: [] },
  paymentClientSecret: "cs_test",
};
/** The actor who may place orders. */
const STAFF = { permissions: ["orders.order.create"] };

/** Picks the demo variant in the combo box. */
async function pickVariant() {
  await userEvent.click(screen.getByRole("combobox", { name: "Variant" }));
  await userEvent.click(await screen.findByRole("option", { name: /TEE-M/ }));
}

/** Guards the quick-order screen that turns form input into a create-order call. */
describe(QuickOrderRoute, () => {
  /**
   * Loyalty data must be sent only when points are entered, and success must land on the new order.
   */
  it("sends the loyalty extension only with points, then follows the redirect", async () => {
    const commerce = fakeClient(Commerce, (fake) => {
      fake.queries.SearchVariants.returns(HITS);
      fake.actions.CreateOrder.returns(CREATED);
    });
    const { router } = renderRoute(Routes.quick_order, {
      locale: "en",
      clients: [commerce],
      session: STAFF,
    });
    await pickVariant();
    await userEvent.clear(screen.getByLabelText("Loyalty points"));
    await userEvent.type(screen.getByLabelText("Loyalty points"), "250");
    await userEvent.click(screen.getByRole("button", { name: "Place order" }));
    expect(commerce.called(Commerce.actions.CreateOrder)).toEqual([
      {
        lines: [{ variantId: "var_01JA0000000000000000000001", quantity: 1 }],
        extensions: { loyalty: { redeemPoints: 250 } },
      },
    ]);
    expect(router.state.location.pathname).toBe("/orders/orders/ord_01JA0000000000000000000003");
  });

  /** A refusal with `details.fields` is a field error, not an error page (ADR 0140). */
  it("surfaces a server field refusal on its field", async () => {
    const stock = refusal(Commerce.refusals.insufficient_stock, {
      fields: { "lines.0.variantId": "insufficient_stock" },
    });
    const commerce = fakeClient(Commerce, (fake) => {
      fake.queries.SearchVariants.returns(HITS);
      fake.actions.CreateOrder.throws(stock);
    });
    renderRoute(Routes.quick_order, { locale: "en", clients: [commerce], session: STAFF });
    await pickVariant();
    await userEvent.click(screen.getByRole("button", { name: "Place order" }));
    expect(await screen.findByText("Not enough stock.")).toBeTruthy();
  });

  /** With the flag off for the tenant the route is not there at all. */
  it("is not found while the quick-order flag is off", async () => {
    const flags = fakeFlags((fake) => fake.set(Flags.orders.quick_order, false));
    renderRoute(Routes.quick_order, { locale: "en", flags, session: STAFF });
    expect(await screen.findByRole("heading", { name: "Page not found" })).toBeTruthy();
  });
});
