/**
 * Stackra file contract:
 * Purpose: proves `order.create` places a pending order for the acting customer and returns it
 *          through `order.get`, replays the stored result for a repeated Idempotency-Key, refuses
 *          an unavailable variant before any side effect, and refuses every order while the tenant
 *          has paused ordering.
 * Boundary: unit tier through the real pipeline (`run`) with memory drivers (the memory workflow
 *           engine runs the steps in process); the pricing and payments clients are faked by
 *           class, the orders settings by `fakeSettings`. Every id comes from a factory. The
 *           compensations are covered by the workflow's integration test.
 * Runtime: node
 * Governing contract: ADR 0098 (one pipeline), ADR 0137 (refusal codes), ADR 0022,
 *                     guides/programming-model.mdx#tests
 */
import { describe, expect, it } from "@stackra/testing";
import { refusal } from "@stackra/errors/testing";
import { actors } from "@stackra/iam/testing";
import { createTestingModule } from "@stackra/container/testing";
import { run } from "@stackra/actions/testing";
import { fakeClient } from "@stackra/clients/testing";
import { SettingsReader } from "@stackra/settings";
import { fakeSettings } from "@stackra/settings/testing";
import { PaymentsClient, PricingClient } from "#stackra/clients";
import { Refusals } from "#stackra/manifest";
import { CommerceModule } from "#src/commerce.module";
import { CreateOrderAction } from "#modules/orders/actions/create-order.action";
import { GetOrderQuery } from "#modules/orders/queries/get-order.query";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";
import { Order } from "#modules/orders/models/order.model";
import { OrderSettings } from "#modules/orders/settings/order.setting";
import { ProductFactory } from "#modules/catalogue/factories/product.factory";
import { VariantFactory } from "#modules/catalogue/factories/variant.factory";
import { StockLevelFactory } from "#modules/inventory/factories/stock-level.factory";

/**
 * Builds the module with pricing and payments fakes that succeed, plus one in-stock variant. With
 * `paused`, the orders settings say the tenant has switched `acceptingOrders` off.
 */
async function setup({ paused = false } = {}) {
  const pricing = fakeClient(PricingClient, (fake) =>
    fake.price.quote.returns(({ lines }) => ({
      currency: "SAR",
      lines: lines.map((l) => ({ ...l, unitPriceMinor: 1_000 })),
    })),
  );
  const module = createTestingModule(CommerceModule)
    .useDrivers("memory")
    .override(PricingClient, pricing)
    .override(PaymentsClient, fakeClient(PaymentsClient));
  const pausedSettings = fakeSettings([[OrderSettings, { acceptingOrders: false }]]);
  const app = await (paused ? module.override(SettingsReader, pausedSettings) : module).compile();
  const product = await new ProductFactory(app.em).has(VariantFactory, 1).createOne();
  const variantId = product.variants[0]!.id;
  await new StockLevelFactory(app.em).createOne({ variantId, onHand: 10 });
  return { app, input: { lines: [{ variantId, quantity: 1 }], extensions: {} } };
}

/** Guards the one entry point every client uses to place an order. */
describe(CreateOrderAction, () => {
  /**
   * The happy path the add-a-field guide extends: the order exists and reads back for its owner.
   */
  it("places a pending order that reads back through order.get", async () => {
    const { input } = await setup();
    const as = actors.customer();

    const placed = await run(CreateOrderAction, input, { as, idempotencyKey: "k1" });

    const view = await run(GetOrderQuery, { orderId: placed.output.orderId }, { as });
    expect(view.output.status).toBe(OrderStatus.PendingPayment.value);
    expect(view.output.lines).toHaveLength(1);
  });

  /** A retried request with the same key must not place a second order. */
  it("replays the stored result for a repeated Idempotency-Key", async () => {
    const { app, input } = await setup();
    const as = actors.customer();

    const first = await run(CreateOrderAction, input, { as, idempotencyKey: "k1" });
    const second = await run(CreateOrderAction, input, { as, idempotencyKey: "k1" });

    expect(second.output.orderId).toBe(first.output.orderId);
    expect(await app.repository(Order).count()).toBe(1);
  });

  /** A draft product's variant is not sellable: refused by code, and nothing is stored. */
  it("refuses an unavailable variant before any side effect", async () => {
    const { app } = await setup();
    const draft = await new ProductFactory(app.em)
      .state("draft")
      .has(VariantFactory, 1)
      .createOne();
    const input = { lines: [{ variantId: draft.variants[0]!.id, quantity: 1 }], extensions: {} };

    const result = await run(CreateOrderAction, input, {
      as: actors.customer(),
      idempotencyKey: "k2",
    });

    expect(result).toRefuseWith(refusal(Refusals.catalogue.variant_unavailable));
    expect(await app.repository(Order).count()).toBe(0);
  });

  /**
   * A paused tenant takes no orders: the guard refuses before the workflow runs, storing nothing.
   */
  it("refuses every order while the tenant has paused ordering", async () => {
    const { app, input } = await setup({ paused: true });

    const result = await run(CreateOrderAction, input, {
      as: actors.customer(),
      idempotencyKey: "k3",
    });

    expect(result).toRefuseWith(refusal(Refusals.orders.orders_paused));
    expect(await app.repository(Order).count()).toBe(0);
  });
});
