/**
 * Stackra file contract:
 * Purpose: what the public site is: key, root class, its targets (`web` and `pwa`) and how routes
 *          render, the public API area, the env contract, e2e projects and seeds. Read by
 *          `stackra gen`, `dev`, `build`, `test` and `validate`.
 * Boundary: identity and build shape only. Where it runs (port, domains, vars, Worker knobs, the
 *           health check) is `runway.yaml`; how its packages behave is `src/config/*`. Consumed
 *           services are inferred from `#stackra/clients` imports; `ApiArea.Public` makes a
 *           reference to any other area a gen error. The build hatch is `vite.extend.ts`.
 * Runtime: node
 * Governing contract: ADR 0165 (RR7 framework mode), ADR 0082 (public area), ADR 0281 (targets per
 *                     app)
 */
import { defineApp } from "@stackra/app";
import { ApiArea, Target } from "@stackra/contracts";
import { RenderMode } from "@stackra/navigation";
import { WebEnv } from "./src/config/env.config";

export default defineApp({
  key: "web",
  module: "./src/web.app.ts",
  // Targets are where the app ships (ADR 0281); `Pwa` adds the manifest and the worker.
  targets: [Target.Web, Target.Pwa],
  // Rendering is how a target serves pages: server-rendered on the Worker by default; a route may
  // still choose `RenderMode.Client` (see page.route.ts).
  render: RenderMode.Server,
  area: ApiArea.Public,
  env: WebEnv,
  e2e: {
    projects: ["chromium", "mobile-safari"], // + chromium-rtl, added by gen from i18n.config.ts
    seeds: ["orders.demo", "billing.ladder", "content.marketing"],
  },
});
