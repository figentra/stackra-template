/**
 * Stackra file contract:
 * Purpose: what `useBillingInterval` returns: the interval the pricing toggle shows, the way to
 *          change it on every table of the page, and the per-month display of a price.
 * Boundary: a type shared by the hook that builds it and the pricing table that renders it; prices
 *           are billing's and are divided only for display.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: a hook's result in
 *                     types/), ADR 0220 (money in minor units)
 */
import type { Money } from "@stackra/money";
import type { BillingInterval } from "#src/enums/billing-interval.enum";

/** The interval, its setter and the per-month display helper. */
export interface BillingIntervalState {
  /** The interval the toggle shows. */
  readonly interval: BillingInterval;
  /** Switches every pricing table on the page. */
  readonly setInterval: (next: BillingInterval) => void;
  /** A price of the current interval as a per-month amount. */
  readonly perMonth: (priceMinor: number, currency: string) => Money;
}
