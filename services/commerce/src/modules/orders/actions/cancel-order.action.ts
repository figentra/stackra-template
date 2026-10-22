/**
 * Stackra file contract:
 * Purpose: `orders.order.cancel`: cancel an unpaid order and release its stock.
 * Boundary: single aggregate, so inline in one transaction (ADR 0101). The payment void is a queued
 *           command to the payments service sent after commit, so a payments outage never rolls
 *           back the cancel. A `Service` caller must act on behalf of a customer; the policy then
 *           decides as that customer (the inbound-mail receiver's safeguard c), and every cancel is
 *           access-logged.
 * Runtime: node
 * Governing contract: ADR 0098, 0136, 0260 (call, command, event),
 *                     guides/programming-model.mdx#actions
 */
import { AccessLogged } from "@acme/access-log";
import { DataClassification } from "@acme/access-log/contracts";
import { Action, type ActionContext, AsEndpoint, AsTool, UxAfter } from "@stackra/actions";
import { ActorKind, HttpMethod, Realm, Tone } from "@stackra/contracts";
import { PaymentsClient } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import { StockService } from "#modules/inventory/services/stock.service";
import { OrderService } from "#modules/orders/services/order.service";
import { OrderPermissions } from "#modules/orders/permissions/order.permission";
import { CancelOrderInput } from "#modules/orders/schemas/cancel-order-input.schema";
import { CancelOrderOutput } from "#modules/orders/schemas/cancel-order-output.schema";
import { CancelReason } from "#modules/orders/enums/cancel-reason.enum";

/**
 * Cancels a pending order: releases its stock, records the reason by the realm of the principal
 * the cancel is for and, if a payment was authorized, queues a void after commit. The console asks
 * for confirmation first (`ux`). The notifications service reaches it as `ActorKind.Service` acting
 * `onBehalfOf` the customer whose verified address sent the cancel request.
 */
@Action({
  key: "order.cancel",
  input: CancelOrderInput,
  output: CancelOrderOutput,
  permission: OrderPermissions.cancel,
  actors: [ActorKind.User, ActorKind.Agent, ActorKind.Service],
  ux: {
    requiresConfirmation: { text: I18n.orders.order.cancel_confirm, color: Tone.Danger },
    success: I18n.orders.order.cancelled,
    after: [UxAfter.Refresh],
  },
})
@AsEndpoint({ method: HttpMethod.Put, path: "/orders/:orderId/cancel" })
@AsTool()
export class CancelOrderAction {
  /**
   * @param stock - inventory's exported service; gen records the orders → inventory edge from it.
   * @param payments - the generated payments client; only its `.queue()` mode is used here.
   */
  constructor(
    private readonly orders: OrderService,
    private readonly stock: StockService,
    private readonly payments: PaymentsClient,
  ) {}

  /**
   * Runs inside one transaction; the void is deferred to `afterCommit` so a rolled-back cancel
   * never sends it. The access record names the principal the cancel was for, so a cancel that
   * arrived by mail is traceable to the customer and to the service that relayed it.
   * @throws AppError `forbidden` when OrderPolicy.cancel denies the principal for this
   *   record.
   */
  @AccessLogged({
    classification: DataClassification.Pseudonymous,
    subjects: (_input: CancelOrderInput, ctx: ActionContext) => [
      (ctx.actor.onBehalfOf ?? ctx.actor).id,
    ],
  })
  async handle(input: CancelOrderInput, ctx: ActionContext): Promise<CancelOrderOutput> {
    const order = await this.orders.findOneOrFail({ id: input.orderId }, { populate: ["lines"] });
    await ctx.authorize(OrderPermissions.cancel, order); // OrderPolicy.cancel for this record
    await this.stock.release(
      order.lines.map(({ variantId, quantity }) => ({ variantId, quantity })),
    );
    const byCustomer = (ctx.actor.onBehalfOf ?? ctx.actor).realm === Realm.Customer;
    await this.orders.cancel(order, byCustomer ? CancelReason.Customer : CancelReason.Staff);
    if (order.paymentId) {
      const paymentId = order.paymentId;
      // a command: at least once, deduplicated by the derived key
      ctx.afterCommit(() => this.payments.payment.void.queue({ paymentId }));
    }
    return { orderId: order.id, status: order.status.value };
  }
}
