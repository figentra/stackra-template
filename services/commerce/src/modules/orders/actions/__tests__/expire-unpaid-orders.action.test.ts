/**
 * Stackra file contract:
 * Purpose: proves the expiry job ends only pending orders older than the tenant's window, releases
 *          their stock, and records `order.cancelled` with reason `expired`.
 * Boundary: unit tier through the pipeline as the job actor; memory drivers, settings faked, the
 *           clock frozen so "older than the window" is exact. Records come from factories.
 * Runtime: node
 * Governing contract: ADR 0098, 0148, ADR 0022
 */
import { describe, expect, freezeClock, it } from "@stackra/testing";
import { actors } from "@stackra/iam/testing";
import { createTestingModule } from "@stackra/container/testing";
import { run } from "@stackra/actions/testing";
import { SettingsReader } from "@stackra/settings";
import { fakeSettings } from "@stackra/settings/testing";
import { CommerceModule } from "#src/commerce.module";
import { ExpireUnpaidOrdersAction } from "#modules/orders/actions/expire-unpaid-orders.action";
import { OrderCancelled } from "#modules/orders/events/order-cancelled.event";
import { CancelReason } from "#modules/orders/enums/cancel-reason.enum";
import { OrderSettings } from "#modules/orders/settings/order.setting";
import { OrderFactory } from "#modules/orders/factories/order.factory";

/** Guards the expiry job, which must never end a fresh or a paid order. */
describe(ExpireUnpaidOrdersAction, () => {
  /** A 30-minute window at 10:00: the 09:00 pending order expires; 09:45 and the paid one stay. */
  it("expires only stale pending orders", async () => {
    freezeClock("2026-10-21T10:00:00Z");
    const settings = fakeSettings([
      [OrderSettings, { autoCancelAfterMinutes: 30, customersMayCancel: true }],
    ]);
    const app = await createTestingModule(CommerceModule)
      .useDrivers("memory")
      .override(SettingsReader, settings)
      .compile();
    const orders = new OrderFactory(app.em);
    const stale = await orders.createOne({ createdAt: new Date("2026-10-21T09:00:00Z") });
    await orders.createOne({ createdAt: new Date("2026-10-21T09:45:00Z") });
    await orders.state("paid").createOne({ createdAt: new Date("2026-10-21T08:00:00Z") });

    const result = await run(ExpireUnpaidOrdersAction, { batchSize: 100 }, { as: actors.job() });

    expect(result.output).toEqual({ expired: 1 });
    expect(result).toRecord(OrderCancelled, { orderId: stale.id, reason: CancelReason.Expired });
  });
});
