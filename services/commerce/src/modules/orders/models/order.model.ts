/**
 * Stackra file contract:
 * Purpose: the Order aggregate root: who ordered, the totals snapshot, the lifecycle state and the
 *          lines.
 * Boundary: data, relations and indexes. Key `orders.order`, table `orders.orders` (the module's
 *           Postgres schema), public ids `ord_…`. `status` moves only through OrderStateMachine;
 *           sibling modules reach orders through OrderService (exported) or a relation. The
 *           customer is a principal public id from the actor, never a row here. Every index is an
 *           `@Index` here, so `stackra db diff` never proposes dropping one; the last two back the
 *           sortable `createdAt` and `totals.totalMinor` columns of OrderResource's table, which
 *           gen refuses without an index (`sort_not_indexed`). No constructor-made state: the ORM
 *           loads rows without running the constructor, and rows are built by `em.create`,
 *           factories or CrudService, never with `new`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 11, 20 and 27), ADR 0133 (traits), ADR 0239
 *                     (BelongsToTenant), ADR 0141 (recorded events reach the outbox at flush),
 *                     ADR 0159, ADR 0220 (money)
 */
import type { PublicId } from "@stackra/contracts";
import {
  BelongsToTenant,
  Collection,
  HasPublicId,
  Index,
  Model,
  OneToMany,
  Timestamps,
  UserStamps,
  Versioned,
} from "@stackra/model";
import type { Money } from "@stackra/money";
import { Str } from "@stackra/validation";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";
import { OrderLine } from "#modules/orders/models/order-line.model";
import type { OrderAdjustment } from "#modules/orders/schemas/order-adjustment.schema";

/**
 * An order as persisted. Totals are a snapshot taken at placement, so a later price change never
 * alters an existing order. Traits add `id`, the tenant, timestamps, user stamps and the optimistic
 * version.
 */
@Index(["customerId"])
@Index(["tenantId", "status", "createdAt"])
@Index(["tenantId", "status", "paidAt"])
@Index(["tenantId", "createdAt"])
@Index(["tenantId", "total.minor"])
export class Order extends Model.with(
  HasPublicId("ord"),
  BelongsToTenant,
  Timestamps,
  UserStamps,
  Versioned,
) {
  /** The customer principal who placed it; set from the actor, never from input. */
  customerId!: PublicId<"usr">;

  /** Lifecycle; written only by OrderStateMachine. The initializer is the initial state. */
  status: OrderStatus = OrderStatus.PendingPayment;

  /** Sum of line prices before adjustments; columns `subtotal_minor` and `subtotal_currency`. */
  subtotal!: Money;

  /** What the `adjustTotals` extensions applied at placement, in the order they ran; jsonb. */
  adjustments: OrderAdjustment[] = [];

  /** Amount charged, never below zero; columns `total_minor` and `total_currency`. */
  total!: Money;

  /** The payments service's id once a payment is authorized. */
  @Str({ max: 64 })
  paymentId: string | null = null;

  /** When the payment was captured. */
  paidAt: Date | null = null;

  /** The product lines; owned by the order and deleted with it. */
  @OneToMany(() => OrderLine, (line) => line.order, { orphanRemoval: true })
  lines = new Collection<OrderLine>(this);
}
