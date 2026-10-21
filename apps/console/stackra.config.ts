/**
 * Stackra file contract:
 * Purpose: what the console is: key, root class, build targets, API area, the env contract, e2e
 *          projects, health. Read by `stackra gen`, `stackra dev`, `stackra build`, `stackra test`
 *          and `stackra validate` from the AST.
 * Boundary: identity and build shape only. Where it runs (ports, domains, vars, channels) is
 *           `runway.yaml`; how its packages behave is `src/config/*.config.ts`. Consumed services
 *           are inferred from `#stackra/clients` imports. Build hatches are member-root files
 *           (`vite.extend.ts`, `electron.extend.ts`); the console has none.
 * Runtime: node
 * Governing contract: ADR 0249 (one member, three targets), ADR 0261, ADR 0082 (API areas), ADR
 *                     0145 (carve-out)
 */
import { defineApp } from "@stackra/app";
import { ApiArea } from "@stackra/contracts";
import { Target } from "@stackra/platform";
import { ConsoleEnv } from "./src/config/env.config";

/**
 * `targets` picks the generated outputs (vite, sw and manifest, electron); `ApiArea.App` is the
 * tenant console's.
 */
export default defineApp({
  key: "console",
  module: "./src/console.app.ts",
  targets: [Target.Web, Target.Pwa, Target.Desktop],
  area: ApiArea.App,
  env: ConsoleEnv,
  e2e: {
    // + chromium-rtl (i18n.config rtl), pwa and desktop (targets), by gen
    projects: ["chromium", "mobile-safari"],
    seeds: ["orders.demo"],
  },
  health: { path: "/healthz" },
});
