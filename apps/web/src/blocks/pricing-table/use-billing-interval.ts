/**
 * Stackra file contract:
 * Purpose: the monthly/yearly choice of the pricing table and the display of a yearly price per
 *          month.
 * Boundary: local UI state in @stackra/state (one signal, so a second table on the page shares the
 *           choice); prices come from billing and are divided only for display, through
 *           `@stackra/money`, rounded down so a rounded-up price is never advertised. The pricing
 *           experiment flag decides where the toggle opens.
 * Runtime: browser
 * Governing contract: ADR 0079 (client state is @stackra/state), ADR 0220 (money in minor units),
 *                     ADR 0213 d3
 */
import { useFlag } from "@stackra/feature-flags/react";
import { Money, Rounding } from "@stackra/money";
import { signal, useSignal } from "@stackra/state/react";
import { Flags } from "#stackra/flags";
import { BillingInterval } from "#src/enums/billing-interval.enum";
import type { BillingIntervalState } from "#src/types/billing-interval-state.type";

/** One shared choice; `null` until the visitor picks, so the experiment decides the first view. */
const chosen = signal<BillingInterval | null>(null);

/** The choice, its setter, and the per-month display helper. */
export function useBillingInterval(): BillingIntervalState {
  const yearlyFirst = useFlag(Flags.web.pricing_yearly_first);
  const interval =
    useSignal(chosen) ?? (yearlyFirst ? BillingInterval.Year : BillingInterval.Month);
  return {
    interval,
    setInterval: (next) => chosen.set(next),
    perMonth: (priceMinor, currency) =>
      Money.ofMinor(priceMinor, currency).divide(interval.meta.months, Rounding.Down),
  };
}
