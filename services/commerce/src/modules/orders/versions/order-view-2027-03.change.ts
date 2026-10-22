/**
 * Stackra file contract:
 * Purpose: the dated change "OrderView gained a `totals` object" for callers pinned before
 *          2027-03-01, who still receive the flat `totalMinor` and `currency`.
 * Boundary: a response-only transform (ADR 0118): callers on an older date receive the older shape.
 *           One class per breaking change, keyed by the date it landed; the chain is composed by
 *           @stackra/versioning. Actions and events carry no version in their keys; `@Version(n)`
 *           on a class marks a parallel major only.
 * Runtime: node
 * Governing contract: ADR 0118 (dated versions, response transforms), R11 (12-month support), R13
 *                     (pinning), guides/programming-model.mdx#versioning
 */
import { Change, VersionChange } from "@stackra/versioning";
import { OrderView } from "#modules/orders/schemas/order-view.schema";

/**
 * Applied to every response that carries an OrderView when the caller's pinned date is before
 * `since`.
 */
@Change({
  since: "2027-03-01",
  affects: [OrderView],
  description: "OrderView.totals replaces totalMinor and currency",
})
export class OrderViewTotalsChange extends VersionChange<OrderView> {
  /** Folds `totals` back into the flat `totalMinor` and `currency` the old shape had. */
  downgrade(view: OrderView): Record<string, unknown> {
    const { totals, ...rest } = view;
    return { ...rest, totalMinor: totals.totalMinor, currency: totals.currency };
  }
}
