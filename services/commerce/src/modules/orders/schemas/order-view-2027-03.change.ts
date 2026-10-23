/**
 * Stackra file contract:
 * Purpose: the dated change "OrderView gained a `totals` object" for callers pinned before
 *          2027-03-01, who still receive the flat `totalMinor` and `currency`.
 * Boundary: a response change beside its subject: the fields are the old shape, `down` turns the
 *           current view into it. Responses only travel down, so there is no `up`. Supported for
 *           twelve months after the next date (ADR 0118), so the sunset is 2028-03-01; the date
 *           must be listed in src/config/versioning.config.ts.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 1, 13 and 16), ADR 0118 (dated versions, response
 *                     transforms, 12-month support)
 */
import type { PublicId } from "@stackra/contracts";
import type { CurrencyCode } from "@stackra/money";
import { Int } from "@stackra/validation";
import { Change } from "@stackra/versioning";
import type { OrderStatus } from "#modules/orders/enums/order-status.enum";
import { OrderView } from "#modules/orders/schemas/order-view.schema";
import type { PricedLine } from "#modules/orders/schemas/priced-line.schema";

/** Applied to every response that carries an OrderView when the caller's pin is before the date. */
export class OrderView202703Change extends Change(OrderView, {
  date: "2027-03-01",
  sunset: "2028-03-01",
}) {
  /** The order's public id. */
  id!: PublicId<"ord">;

  /** Where the order is in its lifecycle. */
  status!: OrderStatus;

  /** Amount charged, in minor units; the old shape had no subtotal or adjustments. */
  @Int({ min: 0 })
  totalMinor!: number;

  /** ISO 4217 code of `totalMinor`. */
  currency!: CurrencyCode;

  /** The lines with their unit prices. */
  lines!: PricedLine[];

  /** When the order was placed. */
  createdAt!: Date;

  /** Folds `totals` back into the flat `totalMinor` and `currency` the old shape had. */
  down(view: OrderView): OrderView202703Change {
    const { totals, ...rest } = view;
    return OrderView202703Change.create({
      ...rest,
      totalMinor: totals.totalMinor,
      currency: totals.currency,
    });
  }
}
