/**
 * Stackra file contract:
 * Purpose: this service's override of the action rate-limit defaults: a higher ceiling for the
 *          public area.
 * Boundary: an override keeps its base's name and imports the base as `BaseRateLimitConfig`; it
 *           declares `override` members only (no `schema` or `env` of its own); a nested object is
 *           replaced whole, so the base areas are merged explicitly. A per-action `rateLimit` (as
 *           on `order.create`) still wins for that action; this is the per-area ceiling behind it.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 19, as amended by programming model v3.1, AGENTS.md),
 *                     ADR 0146, ADR 0217 (rate limits)
 */
import { RateLimitConfig as BaseRateLimitConfig } from "@stackra/actions";
import { Duration } from "@stackra/contracts";

/** The public storefront bursts on a product drop, so its area gets twice the default. */
export class RateLimitConfig extends BaseRateLimitConfig {
  /** The package's areas, with the public area raised. */
  override areas = {
    ...this.areas,
    public: { requests: 120, per: Duration.minutes(1), burst: 40 },
  };
}
