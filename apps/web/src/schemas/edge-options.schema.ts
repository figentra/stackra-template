/**
 * Stackra file contract:
 * Purpose: the shape of what the Worker does around the router, with its defaults: the windows
 *          behind each data cache profile a query names, whether redirects are looked up, whether
 *          HTML 404s are logged, and the streaming timeout.
 * Boundary: a shape class read by `EdgeConfig`; values only. Each profile's rule governs query data
 *           in the Workers cache, never HTML, which is always `private, no-cache`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md), ADR 0297
 *                     (decision 3), ADR 0237
 */
import { Duration } from "@stackra/contracts";
import { Int, Schema } from "@stackra/validation";
import { CacheProfile } from "#src/enums/cache-profile.enum";
import type { CacheRule } from "#src/schemas/cache-rule.schema";

/** The data cache profiles and what the Worker does around the router. */
export class EdgeOptions extends Schema {
  /** One rule per `CacheProfile` code; a query's `{ cache }` option names the profile. */
  cache: Record<CacheProfile, CacheRule> = {
    [CacheProfile.Marketing]: {
      freshFor: Duration.days(1),
      staleFor: Duration.days(7),
    },
    [CacheProfile.Catalogue]: {
      freshFor: Duration.seconds(60),
      staleFor: Duration.minutes(5),
    },
    [CacheProfile.Page]: {
      freshFor: Duration.minutes(5),
      staleFor: Duration.hours(1),
    },
    [CacheProfile.None]: {
      freshFor: Duration.seconds(0),
      staleFor: Duration.seconds(0),
    },
  };

  /**
   * Ask the experience `seo` module for a redirect when the router answers an HTML 404; a failed
   * lookup keeps the 404, and a target on another site is refused.
   */
  lookupRedirects = true;

  /** Seconds a redirect answer is cached at the edge; a redirect is data, not a page. */
  @Int({ min: 0 })
  redirectCacheSeconds = 300;

  /** Record HTML 404s for the experience `seo` module after responding. */
  notFoundLog = true;

  /**
   * React Router's `streamTimeout`, in milliseconds: pending loader data is rejected after this,
   * and the stream is cut a second later.
   */
  @Int({ min: 500 })
  streamTimeoutMs = 5_000;

  /** Bots get fully rendered HTML: the stream waits for every loader. */
  botsWaitForAll = true;
}
