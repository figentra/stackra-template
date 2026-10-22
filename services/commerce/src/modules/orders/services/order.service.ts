/**
 * Stackra file contract:
 * Purpose: order state changes: create pending, attach payment, mark paid, cancel. The only code
 *          that moves an order's state, and the one mapping from row to OrderView.
 * Boundary: exported to sibling modules; runs inside the caller's transaction. Events are recorded
 *           on the aggregate and reach the outbox when the unit of work flushes, so a rolled-back
 *           change emits nothing. Nothing is injected to emit.
 * Runtime: node
 * Governing contract: ADR 0105 (@Crud), 0136, 0141 (the aggregate records, the unit of work ships),
 *                     guides/programming-model.mdx#services, ADR 0212
 */
import type { Repository } from "@stackra/database";
import { Crud, CrudService } from "@stackra/database";
import { AccessLogged } from "@acme/access-log";
import { DataClassification } from "@acme/access-log/contracts";
import { Order } from "#modules/orders/models/order.model";
import type { OrderLine } from "#modules/orders/models/order-line.model";
import type { OrderRepository } from "#modules/orders/repositories/order.repository";
import { OrderPlaced } from "#modules/orders/events/order-placed.event";
import { End, MarkPaid, PendingPayment } from "#modules/orders/states/order.state";
import type { OrderView } from "#modules/orders/schemas/order-view.schema";
import type { OrderDraft } from "#modules/orders/schemas/order-draft.schema";
import type { OrderTotals } from "#modules/orders/schemas/order-totals.schema";
import type { CancelReason } from "#modules/orders/enums/cancel-reason.enum";
import { OrderNotPayableError } from "#modules/orders/errors/order-not-payable.error";

/**
 * The write side of the aggregate. `@Crud(Order)` adds the inherited reads (`find`,
 * `findOneOrFail`, `count`); with no
 * `actions` option it generates no endpoint, because `order.list` is hand-written
 * (queries/list-orders.query.ts).
 */
@Crud(Order)
export class OrderService extends CrudService<Order> {
  /**
   * @param orders - the custom repository (repositories/order.repository.ts); also the CrudService
   *   base.
   * @param lines - lines are written only here.
   */
  constructor(
    protected readonly orders: OrderRepository,
    private readonly lines: Repository<OrderLine>,
  ) {
    super(orders);
  }

  /**
   * Persists a pending order with its lines and records `order.placed`. Pricing happened in
   * OrderPricingService.
   */
  async createPending(draft: OrderDraft, totals: OrderTotals): Promise<Order> {
    const order = this.orders.create({
      customerId: draft.customerId,
      status: new PendingPayment(),
      currency: totals.currency,
      subtotalMinor: totals.subtotalMinor,
      adjustments: totals.adjustments,
      totalMinor: totals.totalMinor,
      paymentId: null,
      paidAt: null,
    });
    for (const line of draft.lines) this.lines.create({ order, ...line });
    order.record(
      new OrderPlaced({
        orderId: order.id,
        customerId: draft.customerId,
        totalMinor: order.totalMinor,
        currency: order.currency,
        lines: draft.lines.map(({ variantId, quantity }) => ({ variantId, quantity })),
      }),
    );
    return order;
  }

  /**
   * Records the payments service's id on a pending order so a later capture event can be matched to
   * it.
   */
  async attachPayment(orderId: string, paymentId: string): Promise<void> {
    const order = await this.orders.findOneOrFail({ id: orderId });
    order.paymentId = paymentId;
  }

  /**
   * Idempotent on the payment id: a redelivered capture returns without changing or recording
   * anything.
   * @param at - the capture time from the event, not the processing time, so retries keep the same
   *   `paidAt`.
   * @throws OrderNotPayableError when the order is terminal or paid by a different payment.
   */
  async markPaid(orderId: string, paymentId: string, at: Date): Promise<void> {
    const order = await this.orders.findOneOrFail({ id: orderId });
    if (order.status.canTransitionTo(MarkPaid)) {
      await order.status.transition(new MarkPaid(paymentId, at));
      return;
    }
    if (order.paymentId === paymentId) return; // the same capture, delivered again
    throw new OrderNotPayableError(orderId, order.status.value);
  }

  /**
   * Ends an order by reason; silently returns when it is already terminal, so compensations may
   * repeat.
   */
  async cancel(order: Order, reason: CancelReason): Promise<void> {
    if (!order.status.canTransitionTo(End)) return;
    await order.status.transition(new End(reason));
  }

  /**
   * The one mapping from row to OrderView (lines must be populated); access-logged because the view
   * names the customer.
   */
  @AccessLogged({
    classification: DataClassification.Pseudonymous,
    subjects: (o: Order) => [o.customerId],
  })
  toView(o: Order): OrderView {
    return {
      id: o.id,
      status: o.status.value,
      totals: {
        currency: o.currency,
        subtotalMinor: o.subtotalMinor,
        adjustments: o.adjustments,
        totalMinor: o.totalMinor,
      },
      lines: o.lines.map(({ variantId, quantity, unitPriceMinor }) => ({
        variantId,
        quantity,
        unitPriceMinor,
      })),
      createdAt: o.createdAt.toISOString(),
    };
  }
}
