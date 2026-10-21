/**
 * Stackra file contract:
 * Purpose: the Order aggregate root: who ordered, the totals snapshot and the lifecycle state.
 * Boundary: data, invariants and recorded events. Status moves only through OrderState transitions;
 *           other modules reach this table only through OrderService (exported) or a link. The
 *           customer is a principal public id from the actor, never a row here. Every index is an
 *           `@Index` here, so `stackra db diff` never proposes dropping one (ADR 0159).
 * Runtime: node
 * Governing contract: ADR 0095, 0133 (traits), 0239 (BelongsToTenant), 0141 (recorded events reach
 *                     the outbox at flush), ADR 0220 (money), guides/programming-model.mdx#models
 */
import {
  DateTime,
  HasMany,
  HasState,
  Index,
  Json,
  Model,
  MoneyColumn,
  Nullable,
  Str,
} from "@stackra/model";
import {
  BelongsToTenant,
  HasPublicId,
  Timestamps,
  UserStamps,
  Versioned,
} from "@stackra/model/traits";
import { OrderLine } from "#modules/orders/models/order-line.model";
import { OrderAdjustment } from "#modules/orders/schemas/order-adjustment.schema";
import { OrderState } from "#modules/orders/states/order.state";

/**
 * An order as persisted. Totals are a snapshot taken at placement: a later price change never
 * alters an existing order. Key `orders.order`, table `orders` (derived). Traits add `id`
 * (`Order.idPrefix` is `ord`), tenant, timestamps, user stamps and the optimistic version.
 */
@Model()
@Index(["customerId"]) // → idx_orders_customer_id
@Index(["tenantId", "status", "createdAt"]) // → idx_orders_tenant_id_status_created_at
@Index(["tenantId", "status", "paidAt"]) // → idx_orders_tenant_id_status_paid_at
export class Order extends Model.with(
  HasPublicId("ord"),
  BelongsToTenant,
  Timestamps,
  UserStamps,
  Versioned,
) {
  /** Public id of the customer principal who placed the order; set from the actor, never input. */
  @Str({ max: 64 }) customerId!: string;
  /**
   * Where the order is in its lifecycle; moves only through a transition (states/order.state.ts).
   */
  @HasState(OrderState) status!: OrderState;
  /** ISO 4217 code every money column on this row is denominated in. */
  @Str({ length: 3 }) currency!: string;
  /** Sum of line prices before adjustments, in minor units (a `Money` with `currency`). */
  @MoneyColumn({ currencyField: "currency" }) subtotalMinor!: number;
  /** Adjustments the adjustTotals hook chain applied at placement, in the order they ran. */
  @Json(OrderAdjustment.schema.array()) adjustments!: OrderAdjustment[];
  /** Amount charged, in minor units; never below zero. */
  @MoneyColumn({ currencyField: "currency" }) totalMinor!: number;
  /** The payments service's id once a payment is authorized; null until then. */
  @Nullable() @Str({ max: 64 }) paymentId!: string | null;
  /** When the payment was captured; null until the order is paid. */
  @Nullable() @DateTime() paidAt!: Date | null;
  /** The product lines; owned by this aggregate (cascade delete), loaded with `populate`. */
  @HasMany(() => OrderLine, (line) => line.order) lines!: OrderLine[];
}
