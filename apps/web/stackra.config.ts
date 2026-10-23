/**
 * Stackra file contract:
 * Purpose: what the public site is: its build targets, how its pages render (on a Cloudflare
 *          Worker, React Router 7 framework mode), the public API area, the env contract, and the
 *          e2e projects and seeds. Read by `stackra gen`, `stackra dev`, `stackra build`,
 *          `stackra test` and `stackra validate` from the syntax tree.
 * Boundary: static data only: enum values, literals and tokens, never a function or an environment
 *           read. The member key (`web`) comes from the package name and the root module is
 *           src/web.module.ts, so neither is written. What code reads while it runs is
 *           `src/config/*.config.ts`; where it runs (port, domains, vars, Worker knobs, the health
 *           check) is `runway.yaml`. Consumed services are inferred from `#stackra/clients`
 *           imports; `ApiArea.Public` makes a reference to any other area a gen error. The one code
 *           hatch is `vite.extend.ts`.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 12), ADR 0295 (decisions 1 to 6), ADR 0297 (decisions 1
 *                     and 2), ADR 0165 (React Router 7 framework mode), ADR 0082 (public area)
 */
import { defineApp } from "@stackra/app";
import { ApiArea, Target } from "@stackra/contracts";
import { RenderMode } from "@stackra/navigation";
import { WebEnvConfig } from "./src/config/env.config";

/** `targets` and `render` pick the generated outputs: the Worker and browser entries, Wrangler. */
export default defineApp({
  targets: [Target.Web, Target.Pwa],
  /**
   * Pages render on the Worker per request; a route may still choose `RenderMode.Client`
   * (page.route.ts). Nothing is prerendered while `SiteConfig.fixedSiteId` is unset.
   */
  render: RenderMode.Server,
  area: ApiArea.Public,
  env: WebEnvConfig,
  e2e: {
    // + chromium-rtl (i18n.config.ts rtl), by gen
    projects: ["chromium", "mobile-safari"],
    // seeder keys `<module>.<profile>`: the demo orders, the plan ladder and the marketing entries
    seeds: ["orders.demo", "billing.demo", "content.demo"],
  },
});
