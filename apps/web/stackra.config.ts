/**
 * Stackra file contract:
 * Purpose: what the public site is: key, root class, the one target (`web-ssr`), the public API
 *          area, the env contract, e2e projects and seeds, health. Read by `stackra gen`, `dev`,
 *          `build`, `test` and `validate`.
 * Boundary: identity and build shape only. Where it runs (port, domains, vars, Worker knobs) is
 *           `runway.yaml`; how its packages behave is `src/config/*`. Consumed services are
 *           inferred from `#stackra/clients` imports; `ApiArea.Public` makes a reference to any
 *           other area a gen error. The build hatch is `vite.extend.ts`.
 * Runtime: node
 * Governing contract: ADR 0165 (RR7 framework mode), ADR 0176 (SSR on Workers), ADR 0082 (public
 *                     area), ADR 0145
 */
import { defineApp } from "@stackra/app";
import { ApiArea } from "@stackra/contracts";
import { Target } from "@stackra/platform";
import { WebEnv } from "./src/config/env.config";

export default defineApp({
  key: "web",
  module: "./src/web.app.ts",
  targets: [Target.WebSsr],
  area: ApiArea.Public,
  env: WebEnv,
  e2e: {
    projects: ["chromium", "mobile-safari"], // + chromium-rtl, added by gen from i18n.config.ts
    seeds: ["orders.demo", "billing.ladder", "content.marketing"],
  },
  health: { path: "/healthz" },
});
