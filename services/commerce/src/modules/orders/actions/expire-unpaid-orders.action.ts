/**
 * Stackra file contract:
 * Purpose: `orders.order.expire_unpaid`: the job that expires unpaid orders past the tenant's
 *          auto-cancel window.
 * Boundary: a job is an action delivered by the queue (@AsJob); @Cron only dispatches it, per
 *           tenant (ADR 0078 d6). `@AsJob` adds `ActorKind.Job` itself, so `actors` lists only
 *           `System` (ADR 0098); the same pipeline applies tenancy, audit and idempotency.
 * Runtime: node
 * Governing contract: ADR 0098, 0148, guides/programming-model.mdx#actions (job = adapter)
 */
import { Action, type ActionContext, AsJob } from "@stackra/actions";
import { ActorKind } from "@stackra/contracts";
import { Cron } from "@stackra/scheduler";
import type { SettingsReader } from "@stackra/settings";
import { time } from "@stackra/support";
import { Queues } from "#stackra/queues";
import type { StockService } from "#modules/inventory/services/stock.service";
import type { OrderService } from "#modules/orders/services/order.service";
import type { OrderRepository } from "#modules/orders/repositories/order.repository";
import { OrderSettings } from "#modules/orders/settings/order.setting";
import { OrderPermissions } from "#modules/orders/permissions/order.permission";
import { CancelReason } from "#modules/orders/enums/cancel-reason.enum";
import { ExpireUnpaidOrdersInput } from "#modules/orders/schemas/expire-unpaid-orders-input.schema";
import { ExpireUnpaidOrdersOutput } from "#modules/orders/schemas/expire-unpaid-orders-output.schema";

/**
 * Expires every pending order older than the tenant's `autoCancelAfterMinutes`, oldest first, up
 * to the batch size. `unique: true` means one run per tenant at a time; a run that overlaps the
 * cron is skipped, not queued twice.
 */
@Action({
  key: "order.expire_unpaid",
  input: ExpireUnpaidOrdersInput,
  output: ExpireUnpaidOrdersOutput,
  permission: OrderPermissions.expire,
  actors: [ActorKind.System],
})
@AsJob({ queue: Queues.Maintenance, unique: true, timeout: "2m", retries: 3 })
@Cron("*/5 * * * *", { perTenant: true, input: { batchSize: 100 } })
export class ExpireUnpaidOrdersAction {
  /**
   * @param settings - reads the tenant's window at run time, so a change applies on the next tick.
   */
  constructor(
    private readonly orders: OrderService,
    private readonly stale: OrderRepository,
    private readonly stock: StockService,
    private readonly settings: SettingsReader,
  ) {}

  /**
   * Releases each stale order's stock and ends it with reason `expired`. The cutoff comes from
   * `time.subMinutes` (@stackra/support) over the frozen pipeline clock, never hand arithmetic.
   */
  async handle(
    input: ExpireUnpaidOrdersInput,
    ctx: ActionContext,
  ): Promise<ExpireUnpaidOrdersOutput> {
    const { autoCancelAfterMinutes } = await this.settings.for(OrderSettings);
    const cutoff = time.subMinutes(ctx.now(), autoCancelAfterMinutes);
    const rows = await this.stale.findStale(cutoff, input.batchSize);
    for (const order of rows) {
      await this.stock.release(
        order.lines.map(({ variantId, quantity }) => ({ variantId, quantity })),
      );
      await this.orders.cancel(order, CancelReason.Expired);
    }
    return { expired: rows.length };
  }
}
