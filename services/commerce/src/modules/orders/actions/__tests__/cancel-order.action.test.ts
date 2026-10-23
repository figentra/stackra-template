/**
 * Stackra file contract:
 * Purpose: proves `order.cancel` refuses a stranger, releases stock and records the event for the
 *          owner, queues a payment void after commit only, and lets a service cancel only on behalf
 *          of the owning customer, with an access record naming that customer.
 * Boundary: unit tier through the real pipeline (`run`), memory drivers, the payments client in
 *           the one fake shape, asserted by the action class. Every id comes from a factory, never
 *           a literal.
 * Runtime: node
 * Governing contract: ADR 0098 (one pipeline), ADR 0132 (policy), ADR 0022, ADR 0007 (test
 *                     docblocks)
 */
import { AccessLogSink } from "@acme/access-log/contracts";
import "@acme/access-log/testing"; // registers toHaveLoggedAccess
import { run } from "@stackra/actions/testing";
import { fakeClient } from "@stackra/clients/testing";
import { createTestingModule } from "@stackra/container/testing";
import { ForbiddenError } from "@stackra/errors";
import { refusal } from "@stackra/errors/testing";
import { actors } from "@stackra/iam/testing";
import { describe, expect, it } from "@stackra/testing";
import { PaymentsClient, VoidPaymentAction } from "#stackra/clients/payments";
import { CommerceModule } from "#stackra/module";
import { StockLevelFactory } from "#modules/inventory/database/factories/stock-level.factory";
import { StockLevel } from "#modules/inventory/models/stock-level.model";
import { CancelOrderAction } from "#modules/orders/actions/cancel-order.action";
import { OrderLineFactory } from "#modules/orders/database/factories/order-line.factory";
import { OrderFactory } from "#modules/orders/database/factories/order.factory";
import { CancelReason } from "#modules/orders/enums/cancel-reason.enum";
import { OrderCancelled } from "#modules/orders/events/order-cancelled.event";

/** The notifications service as the actor, optionally for a customer (the inbound-mail relay). */
function relay(onBehalfOf?: string) {
  return actors.service(
    "notifications",
    onBehalfOf ? { onBehalfOf: actors.customer(onBehalfOf) } : {},
  );
}

/**
 * The policy and the side effects of a cancel; the workflow path is covered in workflows/__tests__.
 */
describe(CancelOrderAction, () => {
  /** Another customer's id; the policy must answer deny before any side effect. */
  it("denies a customer who does not own the order", async () => {
    await createTestingModule(CommerceModule).useDrivers("memory").compile();
    const [order, stranger] = await OrderFactory.new().count(2).create();

    const result = await run(
      CancelOrderAction,
      { orderId: order.id },
      { as: actors.customer(stranger.customerId) },
    );

    expect(result).toRefuseWith(refusal(ForbiddenError));
  });

  /** The happy path: the reserved unit comes back, one `order.cancelled` with reason `customer`. */
  it("releases stock and records order.cancelled for the owner", async () => {
    const app = await createTestingModule(CommerceModule).useDrivers("memory").compile();
    const level = await StockLevelFactory.new().create({ reserved: 1 });
    const line = OrderLineFactory.new().state({ variant: level.variantId, quantity: 1 });
    const order = await OrderFactory.new().has(line).create();

    const result = await run(
      CancelOrderAction,
      { orderId: order.id },
      { as: actors.customer(order.customerId) },
    );

    expect(result).toRecord(OrderCancelled, { orderId: order.id, reason: CancelReason.Customer });
    expect((await app.repository(StockLevel).findOneOrFail({ id: level.id })).reserved).toBe(0);
  });

  /**
   * The void must never be sent for a rolled-back cancel, so it is asserted as queued after commit.
   */
  it("queues a void for an order with an authorized payment, after commit only", async () => {
    const payments = fakeClient();
    await createTestingModule(CommerceModule)
      .useDrivers("memory")
      .override(PaymentsClient, payments)
      .compile();
    const order = await OrderFactory.new().authorized().create();

    await run(CancelOrderAction, { orderId: order.id }, { as: actors.staff() });

    expect(payments.queued(VoidPaymentAction)).toEqual([{ paymentId: order.paymentId }]);
  });

  /**
   * The inbound-mail path: a service may cancel only as the customer it acts for. Without
   * `onBehalfOf`, or on behalf of someone else, the policy denies; on behalf of the owner it
   * succeeds and the access record names the owner, so the relay is auditable.
   */
  it("lets a service cancel only for the owning customer, and logs the access", async () => {
    const app = await createTestingModule(CommerceModule).useDrivers("memory").compile();
    const [order, other] = await OrderFactory.new().count(2).create();

    const bare = await run(CancelOrderAction, { orderId: order.id }, { as: relay() });
    const wrong = await run(
      CancelOrderAction,
      { orderId: order.id },
      { as: relay(other.customerId) },
    );
    const owner = await run(
      CancelOrderAction,
      { orderId: order.id },
      { as: relay(order.customerId) },
    );

    expect(bare).toRefuseWith(refusal(ForbiddenError));
    expect(wrong).toRefuseWith(refusal(ForbiddenError));
    expect(owner).toRecord(OrderCancelled, { orderId: order.id, reason: CancelReason.Customer });
    await expect(app.get(AccessLogSink)).toHaveLoggedAccess({
      target: `${CancelOrderAction.name}.handle`,
      subjects: [order.customerId],
    });
  });
});
