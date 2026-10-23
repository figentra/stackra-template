/**
 * Stackra file contract:
 * Purpose: the dated change "OrderView gained a `totals` object" for callers pinned before
 *          2027-03-01, who still receive the flat `totalMinor` and `currency`.
 * Boundary: a response change beside its subject, bound to it by the type argument
 *           (`Change<OrderView>`): the fields are the old shape, `down` turns the current view into
 *           it. Responses only travel down, so there is no `up`. Supported for twelve months after
 *           the next date (ADR 0118), so the sunset is 2028-03-01; the date must be listed in
 *           src/schemas/versioning-options.schema.ts. Fields added later without a date
 *           (`customerId`, `paidAt`) are not part of the old shape, so `down` names every field it
 *           keeps.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 1, 13 and 16, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0118 (dated versions, response transforms, 12-month
 *                     support)
 */
import type { PublicId } from "@stackra/contracts";
import type { CurrencyCode } from "@stackra/money";
import { Int } from "@stackra/validation";
import { Change } from "@stackra/versioning";
import type { OrderStatus } from "#modules/orders/enums/order-status.enum";
import type { OrderView } from "#modules/orders/schemas/order-view.schema";
import type { PricedLine } from "#modules/orders/schemas/priced-line.schema";

/** Applied to every response that carries an OrderView when the caller's pin is before the date. */
export class OrderView202703Change extends Change<OrderView>({
  from: "2027-03-01",
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
    return OrderView202703Change.create({
      id: view.id,
      status: view.status,
      totalMinor: view.totals.totalMinor,
      currency: view.totals.currency,
      lines: view.lines,
      createdAt: view.createdAt,
    });
  }
}
