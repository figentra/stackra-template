/**
 * Stackra file contract:
 * Purpose: proves the create-order undo chain against a real database: a refused payment releases
 *          stock, cancels the pending order, and the outbox delivers `order.cancelled` with reason
 *          `payment_failed`.
 * Boundary: integration tier (.int): Testcontainers Postgres for this file, the postgres outbox
 *           driver, the native workflow engine, the payments client faked to refuse. Clock and ids
 *           frozen so the run is reproducible; records come from factories.
 * Runtime: node
 * Governing contract: ADR 0151 (conformance), ADR 0152, ADR 0182 (integration tier), ADR 0269
 */
import assert from "node:assert/strict";
import { run } from "@stackra/actions/testing";
import { fakeClient } from "@stackra/clients/testing";
import { createTestingModule } from "@stackra/container/testing";
import { usePostgres } from "@stackra/database/testing";
import { refusal } from "@stackra/errors/testing";
import { drainOutbox } from "@stackra/events/testing";
import { actors } from "@stackra/iam/testing";
import { beforeAll, describe, expect, freezeClock, freezeIds, it } from "@stackra/testing";
import { StepStatus, WorkflowRunStatus } from "@stackra/workflow";
import { PaymentsClient } from "#stackra/clients";
import { Refusals } from "#stackra/manifest";
import { CommerceModule } from "#src/commerce.module";
import { ProductFactory } from "#modules/catalogue/database/factories/product.factory";
import { VariantFactory } from "#modules/catalogue/database/factories/variant.factory";
import { StockLevelFactory } from "#modules/inventory/database/factories/stock-level.factory";
import { StockLevel } from "#modules/inventory/models/stock-level.model";
import { CreateOrderAction } from "#modules/orders/actions/create-order.action";
import { CancelReason } from "#modules/orders/enums/cancel-reason.enum";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";
import { OrderCancelled } from "#modules/orders/events/order-cancelled.event";
import { Order } from "#modules/orders/models/order.model";
import { CreateOrderWorkflow } from "#modules/orders/workflows/create-order.workflow";

usePostgres(); // one container for this file; the compiled migrations run once

/** Guards the order saga, which spans stock, payment and persistence. */
describe(CreateOrderWorkflow, () => {
  beforeAll(() => {
    freezeClock("2026-10-21T09:00:00Z");
    freezeIds();
  });

  /** Steps complete up to the payment, which is refused; the engine undoes two steps in reverse. */
  it("undoes the earlier steps in reverse when payment authorization fails", async () => {
    const payments = fakeClient(PaymentsClient, (fake) =>
      fake.payment.authorize.throws(refusal(Refusals.payments.card_declined)),
    );
    const app = await createTestingModule(CommerceModule)
      .useDrivers({
        database: "postgres",
        events: "postgres-outbox",
        queue: "memory",
        workflow: "native",
        notifications: "memory",
      })
      .override(PaymentsClient, payments)
      .compile();
    const product = await ProductFactory.new().has(VariantFactory.new()).create();
    const [variant] = product.variants;
    assert(variant, "the factory made one variant");
    const variantId = variant.id;
    const level = await StockLevelFactory.new().create({ variantId, onHand: 50 });
    const input = { lines: [{ variantId, quantity: 2 }], extensions: {} };

    const result = await run(CreateOrderAction, input, { as: actors.customer() });

    expect(result).toRefuseWith(refusal(Refusals.payments.card_declined));
    const runRecord = await app.workflows.last(CreateOrderWorkflow);
    expect(runRecord.status).toBe(WorkflowRunStatus.Compensated);
    expect(runRecord.steps.map((step) => [step.name, step.status])).toEqual([
      ["price", StepStatus.Done],
      ["reserveStock", StepStatus.Compensated],
      ["createOrder", StepStatus.Compensated],
      ["authorizePayment", StepStatus.Failed],
    ]);
    expect((await app.repository(StockLevel).findOneOrFail({ id: level.id })).reserved).toBe(0);
    const [order] = await app.repository(Order).findAll();
    expect(order?.status).toBe(OrderStatus.Cancelled);

    await drainOutbox(); // publishes what the undo step recorded and runs the listeners
    expect(app.events.published()).toRecord(OrderCancelled, { reason: CancelReason.PaymentFailed });
  });
});
