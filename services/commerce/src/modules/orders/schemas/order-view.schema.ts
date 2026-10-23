/**
 * Stackra file contract:
 * Purpose: `OrderView`: an order as the API, the console, notifications and other services see
 *          it.
 * Boundary: a shape class (an output view, so `<X>View`); never the model. `createdAt` is a `Date`
 *           in code and ISO 8601 with an offset on the wire (the Date codec). Callers pinned before
 *           2027-03-01 receive the older shape through order-view-2027-03.change.ts.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 23 and 26), ADR 0118 (dated response changes)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";
import type { OrderStatus } from "#modules/orders/enums/order-status.enum";
import type { OrderTotals } from "#modules/orders/schemas/order-totals.schema";
import type { PricedLine } from "#modules/orders/schemas/priced-line.schema";

/** Built only by OrderService#toView. */
export class OrderView extends Schema {
  /** The order's public id (`ord_…`). */
  id!: PublicId<"ord">;

  /** Where the order is in its lifecycle. */
  status!: OrderStatus;

  /** The money summary, frozen at placement. */
  totals!: OrderTotals;

  /** The lines with the unit prices captured at placement. */
  lines!: PricedLine[];

  /** When the order was placed. */
  createdAt!: Date;
}
