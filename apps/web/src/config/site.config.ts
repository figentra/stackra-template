/**
 * Stackra file contract:
 * Purpose: what a "site" is for this app (the shape is `SiteOptions`): preview hosts, an optional
 *          fixed site, the product sold, the signup path and the developer docs link.
 * Boundary: the site's own config class (key `web.site`); nothing is read from the environment, so
 *           it maps no env. The resolution itself is `routes/site/site.layout.ts`, which takes this
 *           class through its constructor. A route may set `prerender: true` only while
 *           `fixedSiteId` is set; without it the host picks the site at request time, so nothing is
 *           rendered at build.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md), ADR 0297
 *                     (decision 2), ADR 0175 (tenant domains through the edge), ADR 0242
 */
import { Config } from "@stackra/config";
import { SiteOptions } from "#src/schemas/site-options.schema";

/** What a site is for the web app: previews, a fixed site, the product sold and the signup path. */
export class SiteConfig extends Config({ schema: SiteOptions }) {}
