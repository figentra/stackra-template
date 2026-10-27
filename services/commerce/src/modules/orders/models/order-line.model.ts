/**
 * Stackra file contract:
 * Purpose: one product line of an order, with the unit price captured when the order was placed.
 * Boundary: key `orders.order_line`, table `orders.order_lines`, public ids `oln_…`. The order is a
 *           same-module relation (`Ref<Order>`, foreign key, cascade). The variant belongs to
 *           catalogue, so it is a link (`Link<Variant>`): an indexed `variant_id` column holding
 *           the `var_…` id, no foreign key and no join. Immutable after placement: a changed
 *           quantity is a new order.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 11, 20, 27 and 28), ADR 0104 (as amended), ADR 0220
 */
import { HasPublicId, type Link, ManyToOne, Model, OnDelete, type Ref } from "@stackra/model";
import type { Money } from "@stackra/money";
import { BelongsToTenant } from "@stackra/tenancy/node";
import { Int } from "@stackra/validation";
import { Variant } from "#modules/catalogue/models/variant.model";
import { Order } from "#modules/orders/models/order.model";

/** `line.variant.id` needs no load; `line.variant.load()` runs catalogue's generated read. */
export class OrderLine extends Model.with(HasPublicId("oln"), BelongsToTenant) {
  /** The owning order; foreign key `fk_order_lines_order_id`, deleted with the order. */
  @ManyToOne(() => Order, { onDelete: OnDelete.Cascade })
  order!: Ref<Order>;

  /** The catalogue variant sold. */
  @ManyToOne(() => Variant)
  variant!: Link<Variant>;

  /** Units ordered; at least one. */
  @Int({ min: 1 })
  quantity!: number;

  /** Price of one unit at placement; columns `unit_price_minor` and `unit_price_currency`. */
  unitPrice!: Money;
}
