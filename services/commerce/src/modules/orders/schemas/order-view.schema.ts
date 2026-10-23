/**
 * Stackra file contract:
 * Purpose: `OrderView`: an order as the API, the console, notifications and other services see it.
 * Boundary: a shape class (an output view, so `<X>View`); never the model. It is the row of
 *           OrderResource's table and the detail of its View page (`Resource<Order, OrderView>`),
 *           so every column, filter and entry key is a path of this class. `createdAt` and `paidAt`
 *           are `Date` in code and ISO 8601 with an offset on the wire (the Date codec). Callers
 *           pinned before 2027-03-01 receive the older shape through order-view-2027-03.change.ts;
 *           `customerId` and `paidAt` were added without a date because an added field breaks no
 *           caller.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 23 and 26), ADR 0118 (dated response changes),
 *                     ADR 0164 (as amended for v3.1)
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

  /** The customer principal who placed it. */
  customerId!: PublicId<"usr">;

  /** The money summary, frozen at placement. */
  totals!: OrderTotals;

  /** The lines with the unit prices captured at placement. */
  lines!: PricedLine[];

  /** When the order was placed. */
  createdAt!: Date;

  /** When its payment was captured; null while unpaid. */
  paidAt!: Date | null;
}
