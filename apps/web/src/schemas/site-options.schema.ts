/**
 * Stackra file contract:
 * Purpose: the shape of what a "site" is for this app, with its defaults: which hosts are previews
 *          (never indexed), an optional fixed site for a single-tenant deployment, the product
 *          whose plan ladder the pricing pages sell, where "start trial" goes and the developer
 *          docs the header links to.
 * Boundary: a shape class read by `SiteConfig`; values only. Preview prefixes per environment come
 *           through runway `config.web.site`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md), ADR 0297
 *                     (decision 2), ADR 0175, ADR 0242
 */
import type { Url } from "@stackra/contracts";
import { Schema, Str } from "@stackra/validation";

/** Previews, a fixed site, the product sold, the signup path and the docs link. */
export class SiteOptions extends Schema {
  /** Pins one site id (single-tenant deployment); absent means the host decides. */
  fixedSiteId?: string;

  /** Hosts starting with these are `noindex` and disallowed in robots. */
  previewHostPrefixes: string[] = ["preview.", "staging."];

  /** The product key of `billing.catalog.plan.list`. */
  product = "retail-os";

  /** Where "start trial" goes, relative to the site origin so it follows the environment. */
  @Str({ pattern: /^\// })
  signupPath = "/signup";

  /** The developer documentation on its own host; the header's menu opens it in a new tab. */
  @Str({ pattern: /^https:\/\// })
  docsUrl: Url = "https://docs.acme.example";
}
