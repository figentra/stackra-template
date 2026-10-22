/**
 * Stackra file contract:
 * Purpose: the two intervals a plan ladder prices, with the label of each toggle and how many
 *          months it covers.
 * Boundary: an app-local class enum (only the public site shows the toggle); `months` is what turns
 *           a yearly price into its per-month display.
 * Runtime: isomorphic
 * Governing contract: ADR 0231 (snake_case codes), ADR 0242 (plan ladders)
 */
import { Enum } from "@stackra/schema";
import { I18n } from "#stackra/i18n";

/** `month` and `year`, the keys of a plan's `prices`. */
export class BillingInterval extends Enum<BillingInterval> {
  /** Billed every month. */
  static readonly Month = BillingInterval.case("month", {
    label: I18n.web.pricing.month,
    months: 1,
  });
  /** Billed once a year; shown per month. */
  static readonly Year = BillingInterval.case("year", { label: I18n.web.pricing.year, months: 12 });
}
