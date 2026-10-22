/**
 * Stackra file contract:
 * Purpose: proves the create-order compensations against a real database: a refused payment
 *          releases stock, cancels the pending order, and the outbox delivers `order.cancelled`
 *          with reason `payment_failed`.
 * Boundary: integration tier (.int): Testcontainers Postgres for this file, the postgres outbox
 *           driver, native workflow engine, payments client faked to refuse. Clock and ids frozen
 *           so the run is reproducible; records come from factories.
 * Runtime: node
 * Governing contract: ADR 0151 (conformance), 0094, 0182 (integration tier),
 *                     guides/programming-model.mdx#workflows, ADR 0269
 */
import { beforeAll, describe, expect, freezeClock, freezeIds, it } from "@stackra/testing";
import { refusal } from "@stackra/errors/testing";
import { actors } from "@stackra/iam/testing";
import { createTestingModule } from "@stackra/container/testing";
import { drainOutbox } from "@stackra/events/testing";
import { run } from "@stackra/actions/testing";
import { usePostgres } from "@stackra/database/testing";
import { fakeClient } from "@stackra/clients/testing";
import { StepStatus, WorkflowRunStatus } from "@stackra/workflow";
import { PaymentsClient } from "#stackra/clients";
import { Refusals } from "#stackra/manifest";
import { CommerceModule } from "#src/commerce.module";
import { CreateOrderAction } from "#modules/orders/actions/create-order.action";
import { CreateOrderWorkflow } from "#modules/orders/workflows/create-order.workflow";
import { OrderCancelled } from "#modules/orders/events/order-cancelled.event";
import { CancelReason } from "#modules/orders/enums/cancel-reason.enum";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";
import { Order } from "#modules/orders/models/order.model";
import { ProductFactory } from "#modules/catalogue/factories/product.factory";
import { VariantFactory } from "#modules/catalogue/factories/variant.factory";
import { StockLevel } from "#modules/inventory/models/stock-level.model";
import { StockLevelFactory } from "#modules/inventory/factories/stock-level.factory";

usePostgres(); // one container for this file; the compiled blueprints run once

/** Guards the order saga, which spans stock, payment and persistence. */
describe(CreateOrderWorkflow, () => {
  beforeAll(() => {
    freezeClock("2026-10-21T09:00:00Z");
    freezeIds();
  });

  /**
   * Steps complete up to the payment, which is refused; the engine unwinds two steps in reverse.
   */
  it("compensates in reverse order when payment authorization fails", async () => {
    const payments = fakeClient(PaymentsClient, (fake) =>
      fake.payment.authorize.throws(refusal(Refusals.payments.card_declined)),
    );
    const app = await createTestingModule(CommerceModule)
      .useDrivers({
        database: "postgres",
        events: "postgres-outbox",
        queue: "memory",
        workflow: "native",
        mail: "memory",
      })
      .override(PaymentsClient, payments)
      .compile();
    const product = await new ProductFactory(app.em).has(VariantFactory, 1).createOne();
    const variantId = product.variants[0]!.id;
    const level = await new StockLevelFactory(app.em).createOne({ variantId, onHand: 50 });
    const input = { lines: [{ variantId, quantity: 2 }], extensions: {} };

    const result = await run(CreateOrderAction, input, { as: actors.customer() });

    expect(result).toRefuseWith(refusal(Refusals.payments.card_declined));
    const runRecord = await app.workflows.last(CreateOrderWorkflow);
    expect(runRecord.status).toBe(WorkflowRunStatus.Compensated);
    expect(runRecord.steps.map((s) => [s.name, s.status])).toEqual([
      ["price", StepStatus.Done],
      ["reserveStock", StepStatus.Compensated],
      ["createOrder", StepStatus.Compensated],
      ["authorizePayment", StepStatus.Failed],
    ]);
    expect((await app.repository(StockLevel).findOneOrFail({ id: level.id })).reserved).toBe(0);
    const [order] = await app.repository(Order).findAll();
    expect(order?.status.value).toBe(OrderStatus.Cancelled);

    await drainOutbox(); // publishes what the compensation recorded and runs the listeners
    expect(app.events.published()).toRecord(OrderCancelled, { reason: CancelReason.PaymentFailed });
  });
});
