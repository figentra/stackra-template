/**
 * Stackra file contract:
 * Purpose: the two intervals a plan ladder prices, with how many months each covers.
 * Boundary: an `Enum.of` value plus the type of the same name; app-local (only the public site
 *           shows the toggle). The codes are the keys of a plan's `prices`; `months` turns a yearly
 *           price into its per-month display. Labels are the derived i18n keys
 *           `web::enums.billing_interval.<code>`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 16 and 20), ADR 0231 (snake_case codes), ADR 0242
 *                     (plan ladders)
 */
import { Enum } from "@stackra/validation";

/**
 * `month` and `year`; cases are plain codes, so they compare with `===`.
 *
 * @example
 * Enum.meta(BillingInterval, BillingInterval.Year).months; // 12
 */
export const BillingInterval = Enum.of({
  /** Billed every month. */
  Month: ["month", { months: 1 }],
  /** Billed once a year; shown per month. */
  Year: ["year", { months: 12 }],
});

/** One of the codes above. */
export type BillingInterval = Enum.Value<typeof BillingInterval>;
