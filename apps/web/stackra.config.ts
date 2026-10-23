/**
 * Stackra file contract:
 * Purpose: what the public site is: its build targets, how its pages render (on a Cloudflare
 *          Worker, React Router 7 framework mode), the public API area, the env contract, and the
 *          e2e projects and seeds. Read by `stackra gen`, `stackra dev`, `stackra build`, `stackra
 *          test` and `stackra validate` from the syntax tree.
 * Boundary: static data only: enum values, literals and tokens, never a function or an environment
 *           read. The member key (`web`) comes from the package name, and the member writes no root
 *           module: it would say nothing gen does not derive (no exports, client imports or wrap),
 *           so gen builds the one module `web` from the group folders. What code reads while it
 *           runs is `src/config/*.config.ts`; where it runs (port, domains, vars, Worker knobs, the
 *           health check) is `runway.yaml`. Consumed services are inferred from the
 *           `#stackra/clients/<service>` imports; `ApiArea.Public` makes a reference to any other
 *           area a gen error. The one code hatch is `vite.extend.ts`.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 12, as amended by programming model v3.1, AGENTS.md), ADR
 *                     0295 (decisions 1 to 6), ADR 0297 (decisions 1 and 2), ADR 0165 (React Router
 *                     7 framework mode), ADR 0082 (public area)
 */
import { defineApp } from "@stackra/app";
import { ApiArea, Target } from "@stackra/contracts";
import { RenderMode } from "@stackra/navigation";
import { EnvConfig } from "./src/config/env.config";

/**
 * `targets` and `render` pick the generated outputs: the Worker and browser entries, Wrangler. The
 * public site is `Target.Web` only: it is a marketing site and a storefront read per request, so
 * there is nothing to install and no offline journey (a cart and checkout do not work offline).
 */
export default defineApp({
  targets: [Target.Web],
  /**
   * Pages render on the Worker per request; a route may still choose `RenderMode.Client`
   * (page.route.ts). Nothing is prerendered while `SiteConfig.fixedSiteId` is unset.
   */
  render: RenderMode.Server,
  area: ApiArea.Public,
  env: EnvConfig,
  e2e: {
    // + chromium-rtl and chromium-rtl-ar-sa (one per i18n.config.ts rtl locale), by gen
    projects: ["chromium", "mobile-safari"],
    // seeder keys `<module>.<profile>`: the demo orders, the plan ladder and the marketing entries
    seeds: ["orders.demo", "billing.demo", "content.demo"],
  },
});
