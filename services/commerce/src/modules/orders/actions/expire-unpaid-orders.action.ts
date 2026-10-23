/**
 * Stackra file contract:
 * Purpose: `orders.order.expire_unpaid@1`: the job that expires unpaid orders past the tenant's
 *          auto-cancel window.
 * Boundary: a job is an action run from a queue; its `job` option names the queue and the cron
 *           schedule that dispatches it per tenant. The only actor is the system (the job adds
 *           `ActorKind.Job` itself), so it gets no public endpoint, and the same pipeline applies
 *           tenancy, audit and idempotency. The key's verb is not a permission verb, so the
 *           permission is named.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 16, 18 and 21), ADR 0098, ADR 0148 (queue and
 *                     scheduler)
 */
import { Action, type ActionContext } from "@stackra/actions";
import { ActorKind } from "@stackra/contracts";
import type { SettingsReader } from "@stackra/settings";
import { time } from "@stackra/support";
import { Int, Schema } from "@stackra/validation";
import { Queues } from "#stackra/queues";
import type { StockService } from "#modules/inventory/services/stock.service";
import { OrderPermissions } from "#modules/orders/access/order.permissions";
import { CancelReason } from "#modules/orders/enums/cancel-reason.enum";
import { OrdersSettings } from "#modules/orders/orders.settings";
import type { OrderService } from "#modules/orders/services/order.service";

/** How many stale orders one run handles. */
export class ExpireUnpaidOrdersInput extends Schema {
  /** Orders per run; the next tick takes the rest. */
  @Int({
    min: 1,
    max: 500,
  })
  batchSize = 100;
}

/** How many orders this run expired; zero is normal. */
export class ExpireUnpaidOrdersOutput extends Schema {
  /** Orders moved to `expired`. */
  @Int({ min: 0 })
  expired!: number;
}

/**
 * Expires every pending order older than the tenant's `autoCancelAfterMinutes`, oldest first, up
 * to the batch size. `unique` means one run per tenant at a time; a run that overlaps the cron is
 * skipped, not queued twice.
 */
export class ExpireUnpaidOrdersAction extends Action({
  key: "order.expire_unpaid",
  permission: OrderPermissions.expire,
  actors: [ActorKind.System],
  job: {
    queue: Queues.Maintenance,
    unique: true,
    timeout: "2m",
    retries: 3,
    cron: {
      schedule: "*/5 * * * *",
      perTenant: true,
      input: { batchSize: 100 },
    },
  },
}) {
  /**
   * @param settings - reads the tenant's window at run time, so a change applies on the next tick.
   */
  constructor(
    private readonly orders: OrderService,
    private readonly stock: StockService,
    private readonly settings: SettingsReader,
  ) {
    super();
  }

  /**
   * Releases each stale order's stock and expires it. The cutoff comes from `time.subMinutes`
   * (@stackra/support) over the frozen pipeline clock, never hand arithmetic.
   */
  async handle(
    input: ExpireUnpaidOrdersInput,
    ctx: ActionContext,
  ): Promise<ExpireUnpaidOrdersOutput> {
    const { autoCancelAfterMinutes } = await this.settings.for(OrdersSettings);
    const cutoff = time.subMinutes(ctx.now(), autoCancelAfterMinutes);
    const stale = await this.orders.findStale(cutoff, input.batchSize);
    for (const order of stale) {
      await this.stock.release(
        order.lines.map((line) => ({ variantId: line.variant.id, quantity: line.quantity })),
      );
      this.orders.cancel(order, CancelReason.Expired);
    }
    return ExpireUnpaidOrdersOutput.create({ expired: stale.length });
  }
}
