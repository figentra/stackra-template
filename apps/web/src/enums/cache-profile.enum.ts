/**
 * Stackra file contract:
 * Purpose: the edge cache profiles a route names in `cache:`; their numbers are edge.config.ts's.
 * Boundary: an app-local class enum (only the Worker-rendered site has edge profiles); a route
 *           never names a profile by string.
 * Runtime: isomorphic
 * Governing contract: ADR 0128 (enums are classes), ADR 0176 (SSR on Workers), ADR 0237 (edge)
 */
import { Enum } from "@stackra/schema";

/** How long a rendered page may be served from the edge. */
export class CacheProfile extends Enum<CacheProfile> {
  /** Prerendered marketing pages; they change on deploy. */
  static readonly Marketing = CacheProfile.case("marketing");
  /** Storefront pages; prices and stock move. */
  static readonly Catalogue = CacheProfile.case("catalogue");
  /** Tenant builder pages; they change on publish. */
  static readonly Page = CacheProfile.case("page");
  /** Never served from the edge cache. */
  static readonly None = CacheProfile.case("none");
}
