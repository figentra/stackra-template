/**
 * Stackra file contract:
 * Purpose: one fact of a web-ssr app: what the Worker does around the router. The numbers behind
 *          each cache profile a route names, whether redirects are looked up, whether HTML 404s are
 *          logged, and the streaming timeout.
 * Boundary: values only; `workers/app.ts`, `entry.server.tsx` and the route headers are generated
 *           from it. TLS, WAF and rate limits are the root runway's `edge` (ADR 0237 layer 1),
 *           never here.
 * Runtime: isomorphic
 * Governing contract: ADR 0237
 */
import { Config } from "@stackra/config";
import { Bool, Int, Map, Nested } from "@stackra/validation";
import { CacheProfile } from "#src/enums/cache-profile.enum";

/** How long a profile's pages may be served from the edge. */
class CacheRule {
  /** Seconds the edge serves the page without asking. @defaultValue 0 */
  @Int({ min: 0 }) sMaxAge = 0;
  /** Seconds a stale page may still be served while it refreshes. @defaultValue 0 */
  @Int({ min: 0 }) staleWhileRevalidate = 0;
}

/**
 * Edge facts of the web app: the cache rules routes name and what the Worker does around the
 * router.
 */
@Config("web.edge")
export class EdgeConfig {
  /** One rule per `CacheProfile` case; a route's `cache:` names the case. */
  @Map(Nested(CacheRule)) cache: Record<string, CacheRule> = {
    [CacheProfile.Marketing.value]: { sMaxAge: 86_400, staleWhileRevalidate: 604_800 },
    [CacheProfile.Catalogue.value]: { sMaxAge: 60, staleWhileRevalidate: 300 },
    [CacheProfile.Page.value]: { sMaxAge: 300, staleWhileRevalidate: 3_600 },
    [CacheProfile.None.value]: { sMaxAge: 0, staleWhileRevalidate: 0 },
  };
  /**
   * Ask the experience `seo` module for a redirect when the router answers an HTML 404; a failed
   * lookup keeps the 404, and a target on another site is refused.
   * @defaultValue true
   */
  @Bool() lookupRedirects = true;
  /** Seconds a redirect answer is cached at the edge. @defaultValue 300 */
  @Int({ min: 0 }) redirectCacheSeconds = 300;
  /** Record HTML 404s for the experience `seo` module after responding. @defaultValue true */
  @Bool() notFoundLog = true;
  /**
   * React Router's `streamTimeout`: pending loader data is rejected after this, and the stream is
   * cut a second later. @defaultValue 5000
   */
  @Int({ min: 500 }) streamTimeoutMs = 5_000;
  /** Bots get fully rendered HTML: the stream waits for every loader. @defaultValue true */
  @Bool() botsWaitForAll = true;
}
