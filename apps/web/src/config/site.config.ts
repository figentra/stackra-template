/**
 * Stackra file contract:
 * Purpose: what a "site" is for this app: which hosts are previews (never indexed), an optional
 *          fixed site for a single-tenant deployment, the product whose plan ladder the pricing
 *          pages sell, and where "start trial" goes.
 * Boundary: the site's own config class (key `web.site`); values only. The resolution itself is
 *           `routes/site/site.layout.ts`, which takes this class through its constructor. Preview
 *           prefixes per environment come through runway `config.web.site`. A route may set
 *           `prerender: true` only while `fixedSiteId` is set; without it the host picks the site
 *           at request time, so nothing is rendered at build.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 19 and 20), ADR 0297 (decision 2), ADR 0175 (tenant
 *                     domains through the edge), ADR 0242 (plan ladders per product)
 */
import { Config } from "@stackra/config";
import { Str } from "@stackra/validation";

/** What a site is for the web app: previews, a fixed site, the product sold and the signup path. */
export class SiteConfig extends Config {
  /** Pins one site id (single-tenant deployment); absent means the host decides. */
  fixedSiteId?: string;

  /** Hosts starting with these are `noindex` and disallowed in robots. */
  previewHostPrefixes: string[] = ["preview.", "staging."];

  /** The product key of `billing.catalog.plan.list`. */
  product = "retail-os";

  /** Where "start trial" goes, relative to the site origin so it follows the environment. */
  @Str({ pattern: /^\// })
  signupPath = "/signup";
}
