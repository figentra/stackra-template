/**
 * Stackra file contract:
 * Purpose: proves totals are subtotal plus every `adjustTotals` adjustment, in implementer order,
 *          clamped at zero.
 * Boundary: unit tier; the pricing client is the one fake shape and the catalogue is
 *           overridden by class; the two extensions of the `adjustTotals` slot are registered
 *           inline. The variant id comes from a factory, never a literal.
 * Runtime: node
 * Governing contract: ADR 0265 (extension points: after and before slots), ADR 0263 (override by
 *                     class), ADR 0022, ADR 0269
 */
import { extension, fakeActionContext } from "@stackra/actions/testing";
import { fakeClient } from "@stackra/clients/testing";
import { createTestingModule } from "@stackra/container/testing";
import { actors } from "@stackra/iam/testing";
import { describe, expect, it } from "@stackra/testing";
import { PricingClient, QuotePriceQuery } from "#stackra/clients/pricing";
import { VariantFactory } from "#modules/catalogue/database/factories/variant.factory";
import { ProductService } from "#modules/catalogue/services/product.service";
import { OrderExtensionPoint } from "#modules/orders/extensions/order.extension-point";
import { OrdersModule } from "#modules/orders/orders.module";
import { CreateOrderInput } from "#modules/orders/schemas/create-order-input.schema";
import { OrderTotals } from "#modules/orders/schemas/order-totals.schema";
import { OrderPricingService } from "#modules/orders/services/order-pricing.service";

/** An implementer that appends one adjustment of `amountMinor` under `code`. */
const adjust = (code: string, amountMinor: number) => (totals: OrderTotals) =>
  OrderTotals.create({
    ...totals,
    adjustments: [...totals.adjustments, { code, label: code, amountMinor }],
  });

/** Guards order totals, which must be correct whatever extensions adjust them. */
describe(OrderPricingService, () => {
  /** Two inline extensions at orders 10 and 20; the second alone would take the total negative. */
  it("applies adjustments in order and never goes below zero", async () => {
    const pricing = fakeClient((fake) =>
      fake.on(QuotePriceQuery).returns(({ lines }) => ({
        currency: "USD",
        lines: lines.map((line) => ({ ...line, unitPriceMinor: 1_000 })),
      })),
    );
    const mod = await createTestingModule(OrdersModule)
      .override(ProductService, { assertSellable: async () => undefined })
      .override(PricingClient, pricing)
      .withExtensions([
        extension(OrderExtensionPoint, "adjustTotals", { order: 10 }, adjust("promo", -500)),
        extension(OrderExtensionPoint, "adjustTotals", { order: 20 }, adjust("gift", -5_000)),
      ])
      .compile();
    const variant = VariantFactory.new().make();
    const service = mod.get(OrderPricingService);
    const ctx = fakeActionContext({ actor: actors.customer() });

    const input = CreateOrderInput.create({ lines: [{ variantId: variant.id, quantity: 2 }] });
    const totals = await service.price(await service.draft(input, ctx), ctx);

    expect(totals.subtotalMinor).toBe(2_000);
    expect(totals.adjustments.map((adjustment) => adjustment.code)).toEqual(["promo", "gift"]);
    expect(totals.totalMinor).toBe(0);
  });
});
