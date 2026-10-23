/**
 * Stackra file contract:
 * Purpose: `orders.order.cancel@1`: cancel an unpaid order and release its stock.
 * Boundary: one aggregate, so it runs inline in one transaction. The permission is derived from
 *           the key (`OrderPermissions.cancel`, L2) and OrderPolicy#cancel refines it through
 *           `ctx.authorize(order)`; the endpoint is derived (`PUT /orders/:orderId/cancel`). The
 *           payment void is a queued call to the payments service sent after commit, so a payments
 *           outage never rolls back the cancel. A Service caller must act on behalf of a customer,
 *           and every cancel is access-logged against the principal it was for.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 3, 5, 16 and 21), ADR 0098, ADR 0136, ADR 0260
 */
import { AccessLogged } from "@acme/access-log";
import { DataClassification } from "@acme/access-log/contracts";
import { Action, type ActionContext, UxAfter } from "@stackra/actions";
import { ActorKind, type PublicId, Realm, Tone } from "@stackra/contracts";
import { Schema } from "@stackra/validation";
import type { PaymentsClient } from "#stackra/clients";
import type { StockService } from "#modules/inventory/services/stock.service";
import { CancelReason } from "#modules/orders/enums/cancel-reason.enum";
import type { OrderStatus } from "#modules/orders/enums/order-status.enum";
import type { OrderService } from "#modules/orders/services/order.service";

/** The order to cancel, by public id. */
export class CancelOrderInput extends Schema {
  /** The order's public id. */
  orderId!: PublicId<"ord">;
}

/** The order after the cancel, with the state it ended in. */
export class CancelOrderOutput extends Schema {
  /** The order's public id. */
  orderId!: PublicId<"ord">;

  /** `cancelled`; the expiry job's path ends in `expired` instead. */
  status!: OrderStatus;
}

/**
 * Cancels a pending order: releases its stock, records the reason by the realm of the principal
 * the cancel is for and, if a payment was authorized, queues a void after commit. The console asks
 * for confirmation first. The notifications service reaches it as `ActorKind.Service` acting
 * `onBehalfOf` the customer whose verified address sent the cancel request.
 */
@AccessLogged({ classification: DataClassification.Pseudonymous })
export class CancelOrderAction extends Action({
  key: "order.cancel",
  actors: [ActorKind.User, ActorKind.Agent, ActorKind.Service],
  tool: true,
  ux: {
    confirm: Tone.Danger,
    after: [UxAfter.Refresh],
  },
}) {
  /**
   * @param stock - inventory's exported service; gen records the orders → inventory edge from it.
   * @param payments - the generated payments client; only its `.queue()` mode is used here.
   */
  constructor(
    private readonly orders: OrderService,
    private readonly stock: StockService,
    private readonly payments: PaymentsClient,
  ) {
    super();
  }

  /**
   * Runs inside one transaction; the void waits for `afterCommit`, so a rolled-back cancel never
   * sends it.
   * @throws Refusal `forbidden` when OrderPolicy#cancel denies the principal for this order.
   */
  async handle(input: CancelOrderInput, ctx: ActionContext): Promise<CancelOrderOutput> {
    const order = await this.orders.findOneOrFail({ id: input.orderId }, { populate: ["lines"] });
    await ctx.authorize(order);
    await this.stock.release(
      order.lines.map((line) => ({ variantId: line.variant.id, quantity: line.quantity })),
    );
    const subject = ctx.actor.onBehalfOf ?? ctx.actor;
    this.orders.cancel(
      order,
      subject.realm === Realm.Customer ? CancelReason.Customer : CancelReason.Staff,
    );
    const { paymentId } = order;
    // a queued call: at least once, deduplicated by the derived key
    if (paymentId) ctx.afterCommit(() => this.payments.payment.void.queue({ paymentId }));
    return CancelOrderOutput.create({ orderId: order.id, status: order.status });
  }
}
