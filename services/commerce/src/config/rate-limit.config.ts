/**
 * Stackra file contract:
 * Purpose: this service's host layer over the rate-limit defaults.
 * Boundary: only what differs from the package. A per-action `rateLimit` (as on `order.create`)
 *           still wins for that action; this is the per-area ceiling behind it.
 * Runtime: node
 * Governing contract: ADR 0146, ADR 0217 (rate limits); ADR 0127
 */
import { override } from "@stackra/config";
import { RateLimitConfig } from "@stackra/actions";

/** The public storefront bursts on a product drop, so its area gets twice the default. */
export default override(RateLimitConfig, {
  areas: { public: { requests: 120, per: "1m", burst: 40 } },
});
