/**
 * Stackra file contract:
 * Purpose: the data cache profiles a query names in `ctx.query(Query, input, { cache })`; their
 *          windows are edge.config.ts's.
 * Boundary: an `Enum.of` value plus the type of the same name; app-local (only the Worker-rendered
 *           site has a data cache). A profile caches query answers, never HTML; a query never names
 *           a profile by string.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 16), ADR 0297 (decision 3), ADR 0231 (snake_case
 *                     codes)
 */
import { Enum } from "@stackra/validation";

/**
 * How long a query's answer may be served from the Workers cache.
 *
 * @example
 * await ctx.query(Billing.queries.ListPlans, input, { cache: CacheProfile.Marketing });
 */
export const CacheProfile = Enum.of({
  /** Marketing content and plan ladders; they change on deploy or publish. */
  Marketing: "marketing",
  /** Storefront listings and products; prices and stock move. */
  Catalogue: "catalogue",
  /** Site records and tenant builder pages; they change on publish. */
  Page: "page",
  /** Never served from the cache. */
  None: "none",
});

/** One of the codes above. */
export type CacheProfile = Enum.Value<typeof CacheProfile>;
