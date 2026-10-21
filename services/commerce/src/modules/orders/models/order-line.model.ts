/**
 * Stackra file contract:
 * Purpose: one product line of an order, with the unit price captured when the order was placed.
 * Boundary: references a catalogue variant by public id only; the cross-module relation is the
 *           @Link in links/. Immutable after placement: a changed quantity is a new order.
 * Runtime: node
 * Governing contract: ADR 0097, 0104, guides/programming-model.mdx#models
 */
import { BelongsTo, Int, Model, MoneyColumn, Str } from "@stackra/model";
import { BelongsToTenant, HasPublicId } from "@stackra/model/traits";
import { Order } from "#modules/orders/models/order.model";

/** Key `orders.order_line`, table `order_lines` (derived); public ids are `oln_…`. */
@Model()
export class OrderLine extends Model.with(HasPublicId("oln"), BelongsToTenant) {
  /** The owning order; the line is deleted with it. */
  @BelongsTo(() => Order) order!: Order;
  /**
   * Public id (`var_…`) of the catalogue variant sold; not a foreign key, catalogue owns that
   * table.
   */
  @Str({ max: 64 }) variantId!: string;
  /** Units ordered; at least one. */
  @Int({ min: 1 }) quantity!: number;
  /** Price of one unit at placement, in minor units of the order's currency. */
  @MoneyColumn({ currencyField: "order.currency" }) unitPriceMinor!: number;
}
