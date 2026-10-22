/**
 * Stackra file contract:
 * Purpose: one fact: what a "site" is for this app. Which hosts are previews (never indexed), an
 *          optional fixed site for a single-tenant deployment, the product whose plan ladder the
 *          pricing pages sell, and where "start trial" goes.
 * Boundary: values only. The resolution itself is `providers/site/resolve-site.ts`, which reads
 *           this through the route context. Preview prefixes per environment come through runway
 *           `config.web.site`.
 * Runtime: isomorphic
 * Governing contract: ADR 0175 (tenant domains through the edge), ADR 0242 (plan ladders per
 *                     product)
 */
import { Config } from "@stackra/config";
import { List, Str } from "@stackra/validation";

/** What a site is for the web app: previews, a fixed site, the product sold and the signup path. */
@Config("web.site")
export class SiteConfig {
  /** Pins one site id (single-tenant deployment); absent means the host decides. */
  @Str() fixedSiteId?: string;
  /**
   * Hosts starting with these are `noindex` and disallowed in robots.
   * @defaultValue ["preview.", "staging."]
   */
  @List(Str) previewHostPrefixes: string[] = ["preview.", "staging."];
  /** The product key of `billing.catalog.plan.list`. @defaultValue "retail-os" */
  @Str() product = "retail-os";
  /**
   * Where "start trial" goes, relative to the site origin so it follows the environment.
   * @defaultValue "/signup"
   */
  @Str({ pattern: /^\// }) signupPath = "/signup";
}
