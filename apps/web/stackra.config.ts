/**
 * Stackra file contract:
 * Purpose: what the public site is: key, root class, its targets (`web-ssr` and `pwa`), the public
 *          API area, the env contract, e2e projects and seeds, health. Read by `stackra gen`, `dev`,
 *          `build`, `test` and `validate`.
 * Boundary: identity and build shape only. Where it runs (port, domains, vars, Worker knobs) is
 *           `runway.yaml`; how its packages behave is `src/config/*`. Consumed services are
 *           inferred from `#stackra/clients` imports; `ApiArea.Public` makes a reference to any
 *           other area a gen error. The build hatch is `vite.extend.ts`.
 * Runtime: node
 * Governing contract: ADR 0165 (RR7 framework mode), ADR 0176 (SSR on Workers), ADR 0082 (public
 *                     area), ADR 0145, ADR 0281 (targets per app)
 */
import { defineApp } from "@stackra/app";
import { ApiArea, Target } from "@stackra/contracts";
import { WebEnv } from "./src/config/env.config";

export default defineApp({
  key: "web",
  module: "./src/web.app.ts",
  // The web target here is server-rendered; `Pwa` adds the manifest and worker (ADR 0281 d7).
  targets: [Target.WebSsr, Target.Pwa],
  area: ApiArea.Public,
  env: WebEnv,
  e2e: {
    projects: ["chromium", "mobile-safari"], // + chromium-rtl, added by gen from i18n.config.ts
    seeds: ["orders.demo", "billing.ladder", "content.marketing"],
  },
  health: { path: "/healthz" },
});
