/**
 * Stackra file contract:
 * Purpose: the market a resolved site sells in: the key the services price by and the currency of
 *          its prices.
 * Boundary: a type shared by the resolved site and its readers; the market comes with the site from
 *           the host, never from the visitor's location.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 8), ADR 0175 (sites by host), ADR 0297 (decision 4)
 */

/** The market whose price list and currency the store shows. */
export interface SiteMarket {
  /** The market key the services price by (`Stackra-Market`). */
  readonly key: string;
  /** ISO 4217 code of the market's prices. */
  readonly currency: string;
}
