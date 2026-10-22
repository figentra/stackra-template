/**
 * Stackra file contract:
 * Purpose: proves totals are subtotal plus every adjustTotals adjustment, clamped at zero, in
 *          implementer order.
 * Boundary: unit tier; the pricing client and catalogue are faked by class, hook implementers are
 *           registered inline. The variant id comes from a factory, never a literal.
 * Runtime: node
 * Governing contract: ADR 0265 (hooks), ADR 0263 (override by class), 0022,
 *                     guides/programming-model.mdx#hooks, ADR 0269
 */
import { describe, expect, it } from "@stackra/testing";
import { actors } from "@stackra/iam/testing";
import { createTestingModule } from "@stackra/container/testing";
import { fakeActionContext, hookImplementation } from "@stackra/actions/testing";
import { fakeClient } from "@stackra/clients/testing";
import { PricingClient } from "#stackra/clients";
import { OrdersModule } from "#modules/orders/orders.module";
import { OrderPricingService } from "#modules/orders/services/order-pricing.service";
import { OrderHooks } from "#modules/orders/hooks/order.hook-point";
import { ProductService } from "#modules/catalogue/services/product.service";
import { VariantFactory } from "#modules/catalogue/factories/variant.factory";
import type { OrderTotals } from "#modules/orders/schemas/order-totals.schema";

/** An implementer that appends one adjustment of `amountMinor` under `code`. */
const adjust = (code: string, amountMinor: number) => (t: OrderTotals) => ({
  ...t,
  adjustments: [...t.adjustments, { code, label: code, amountMinor }],
});

/** Guards order totals, which must be correct whatever extensions adjust them. */
describe(OrderPricingService, () => {
  /**
   * Two inline implementers at orders 10 and 20; the second alone would take the total negative.
   */
  it("applies adjustments in order and never goes below zero", async () => {
    const pricing = fakeClient(PricingClient, (fake) =>
      fake.price.quote.returns(({ lines }) => ({
        currency: "USD",
        lines: lines.map((l) => ({ ...l, unitPriceMinor: 1_000 })),
      })),
    );
    const mod = await createTestingModule(OrdersModule)
      .override(ProductService, { assertSellable: async () => undefined })
      .override(PricingClient, pricing)
      .withHooks([
        hookImplementation(OrderHooks, "adjustTotals", { order: 10 }, adjust("promo", -500)),
        hookImplementation(OrderHooks, "adjustTotals", { order: 20 }, adjust("gift", -5_000)),
      ])
      .compile();
    const variant = new VariantFactory(mod.em).makeOne();
    const service = mod.get(OrderPricingService);
    const ctx = fakeActionContext({ actor: actors.customer() });

    const draft = await service.draft(
      { lines: [{ variantId: variant.id, quantity: 2 }], extensions: {} },
      ctx,
    );
    const totals = await service.price(draft, ctx);

    expect(totals.subtotalMinor).toBe(2_000);
    expect(totals.adjustments.map((a) => a.code)).toEqual(["promo", "gift"]);
    expect(totals.totalMinor).toBe(0);
  });
});
