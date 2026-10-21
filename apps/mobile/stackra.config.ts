/**
 * Stackra file contract:
 * Purpose: what the mobile app IS: its key, its `@App` root, its build targets, the API area, the
 *          env contract and the e2e tier. `stackra gen`, `stackra dev`, `stackra build` and
 *          `stackra test` read it to emit the runtime (Expo config, EAS profiles, Metro and Babel,
 *          the entry, the navigation tree, linking, Maestro) into `.stackra/`.
 * Boundary: identity and build shape only; `defineApp` is the build-config carve-out beside ADR
 *           0145. HOW the packages behave is `src/config/<fact>.config.ts`; HOW and WHERE the app
 *           runs per environment (Metro port, public var values, EAS profiles and channels) is
 *           `runway.yaml`; the OTA rollout is root `targets.eas`. `consumes` is gone: gen infers
 *           the consumed services from `#stackra/clients` imports. The compile-time module list is
 *           `modules` below: gen orders it topologically from the consumed manifests and writes
 *           `#stackra/modules`; `priority` only breaks ties between independent roots. EAS never
 *           reads it: the generated `.stackra/app.config.ts` carries what the build needs.
 * Runtime: node
 * Governing contract: ADR 0061, ADR 0145, ADR 0180, ADR 0231
 */
import { defineApp } from "@stackra/app";
import { ApiArea } from "@stackra/contracts";
import { Target } from "@stackra/platform";
import { MobileEnv } from "./src/config/env.config";

/**
 * The mobile app. `env` is the config class whose `@Env` fields are the only values inlined into
 * the bundle: gen refuses any name without the `EXPO_PUBLIC_` prefix, so a secret can never reach
 * the binary. `e2e.flows` names the Maestro flows gen collects into `.stackra/maestro/config.yaml`,
 * run once per platform and once per locale of `i18n.config.ts`, against the `e2e` EAS profile of
 * `runway.yaml`. The Expo escape hatch is not a key here: it is the function file `expo.extend.ts`
 * at the member root, merged last over the generated Expo config, and it exists only when an ADR
 * names the exception.
 */
export default defineApp({
  key: "mobile",
  module: "./src/mobile.app.ts", // the @App root; the counterpart of a service's root @Module
  targets: [Target.Ios, Target.Android],
  area: ApiArea.App,
  /**
   * The modules compiled into the binary. Gen writes `#stackra/modules`; a route naming
   * another module is a type error.
   */
  modules: ["orders", "catalogue", "identity", "devices", "messages", "experience"],
  priority: { identity: 0 }, // identity boots first; everything else follows the dependency graph
  env: MobileEnv,
  e2e: {
    flows: "src/routes/__tests__/*.flow.yaml",
    seeds: ["orders.demo"], // seeder keys `<module>.<name>`; the flows seed nothing else
    profile: "e2e",
  },
});
