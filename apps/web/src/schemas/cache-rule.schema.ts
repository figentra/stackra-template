/**
 * Stackra file contract:
 * Purpose: the shape of one data cache profile inside edge.config.ts `cache`: how long a query's
 *          answer is served without asking, and how long a stale answer may still be served while
 *          it refreshes.
 * Boundary: a shape class typing one nested config object; the values are the config's. It governs
 *           query data in the Workers cache, never HTML, which is always `private, no-cache`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 19), ADR 0297 (decision 3)
 */
import type { Duration } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** Fresh and stale windows of one cache profile. */
export class CacheRule extends Schema {
  /** How long an entry is served without asking the origin. */
  freshFor!: Duration;

  /** How long an expired entry may still be served while one request refreshes it. */
  staleFor!: Duration;
}
