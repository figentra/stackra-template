/**
 * Stackra file contract:
 * Purpose: the write side of the order aggregate and its named reads: create pending, attach a
 *          payment, mark paid, cancel or expire, the expiry read, and the one mapping from row to
 *          OrderView.
 * Boundary: exported to sibling modules; runs inside the caller's transaction. `CrudService<Order>`
 *           (the model is the type argument) supplies the inherited reads and writes (`find`,
 *           `findOneOrFail`, `count`, `create`), the table read the list query applies (`table`:
 *           sort, filters and keyset cursor from a closed TableInput) and the aggregates the KPI
 *           query computes (`metrics`). State moves only through OrderStateMachine; events are
 *           recorded on the aggregate and reach the outbox when the unit of work flushes, so a
 *           rolled-back change emits nothing. Access to an order is logged against its customer
 *           (`@AccessLogged`).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 6, 13, 16 and 27, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0105 (as amended), ADR 0136, ADR 0141, ADR 0212,
 *                     ADR 0220 (money)
 */
import { AccessLogged } from "@acme/access-log";
import { DataClassification } from "@acme/access-log/contracts";
import { SortDirection } from "@stackra/contracts";
import { CrudService } from "@stackra/database";
import { Money } from "@stackra/money";
import { CancelReason } from "#modules/orders/enums/cancel-reason.enum";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";
import { OrderNotPayableError } from "#modules/orders/errors/order-not-payable.error";
import { OrderPlaced } from "#modules/orders/events/order-placed.event";
import type { Order } from "#modules/orders/models/order.model";
import type { OrderStateMachine } from "#modules/orders/models/order.state-machine";
import type { OrderDraft } from "#modules/orders/schemas/order-draft.schema";
import type { OrderTotals } from "#modules/orders/schemas/order-totals.schema";
import { OrderView } from "#modules/orders/schemas/order-view.schema";

/**
 * No resource operation is set to `true` for orders, so gen writes no standard action from this
 * service: `order.list` and `order.get` are hand-written queries over `table` and `findOneOrFail`.
 */
@AccessLogged({
  classification: DataClassification.Pseudonymous,
  subjects: "customerId",
})
export class OrderService extends CrudService<Order> {
  /**
   * @param lifecycle - the only writer of `Order.status`.
   */
  constructor(private readonly lifecycle: OrderStateMachine) {
    super();
  }

  /**
   * Persists a pending order with its lines and records `order.placed`. Pricing happened in
   * OrderPricingService; the line rows are created with the order.
   */
  createPending(draft: OrderDraft, totals: OrderTotals): Order {
    const money = (minor: number): Money => Money.ofMinor(minor, totals.currency);
    const order = this.create({
      customerId: draft.customerId,
      subtotal: money(totals.subtotalMinor),
      adjustments: totals.adjustments,
      total: money(totals.totalMinor),
      lines: draft.lines.map((line) => ({
        variant: line.variantId,
        quantity: line.quantity,
        unitPrice: money(line.unitPriceMinor),
      })),
    });
    order.record(
      OrderPlaced.create({
        orderId: order.id,
        customerId: draft.customerId,
        totalMinor: totals.totalMinor,
        currency: totals.currency,
        lines: draft.lines.map(({ variantId, quantity }) => ({ variantId, quantity })),
      }),
    );
    return order;
  }

  /** Records the payments service's id on a pending order, so a later capture can be matched. */
  async attachPayment(orderId: Order["id"], paymentId: string): Promise<void> {
    const order = await this.findOneOrFail({ id: orderId });
    order.paymentId = paymentId;
  }

  /**
   * Idempotent on the payment id: a redelivered capture returns without changing or recording
   * anything.
   * @param capturedAt - the capture time from the event, not the processing time.
   * @throws OrderNotPayableError when the order is terminal or paid by a different payment.
   */
  async markPaid(orderId: Order["id"], paymentId: string, capturedAt: Date): Promise<void> {
    const order = await this.findOneOrFail({ id: orderId });
    if (this.lifecycle.can(order, "markPaid")) {
      this.lifecycle.markPaid(order, paymentId, capturedAt);
      return;
    }
    if (order.paymentId === paymentId) return; // the same capture, delivered again
    throw OrderNotPayableError.create({ orderId, status: order.status });
  }

  /**
   * Ends an unpaid order by reason (`Expired` expires it, every other reason cancels it); returns
   * silently when the order is already final, so compensations may repeat.
   */
  cancel(order: Order, reason: CancelReason): void {
    if (reason === CancelReason.Expired) {
      if (this.lifecycle.can(order, "expire")) this.lifecycle.expire(order);
      return;
    }
    if (this.lifecycle.can(order, "cancel")) this.lifecycle.cancel(order, reason);
  }

  /** Pending orders created before `cutoff`, oldest first, with lines; the expiry job's page. */
  findStale(cutoff: Date, limit: number): Promise<Order[]> {
    return this.find(
      { status: OrderStatus.PendingPayment, createdAt: { $lt: cutoff } },
      { limit, orderBy: { createdAt: SortDirection.Asc }, populate: ["lines"] },
    );
  }

  /** The one mapping from row to OrderView; the lines must be populated. */
  toView(order: Order): OrderView {
    return OrderView.create({
      id: order.id,
      status: order.status,
      customerId: order.customerId,
      totals: {
        currency: order.total.currency,
        subtotalMinor: order.subtotal.minor,
        adjustments: order.adjustments,
        totalMinor: order.total.minor,
      },
      lines: order.lines.map((line) => ({
        variantId: line.variant.id,
        quantity: line.quantity,
        unitPriceMinor: line.unitPrice.minor,
      })),
      createdAt: order.createdAt,
      paidAt: order.paidAt,
    });
  }
}
