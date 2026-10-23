/**
 * Stackra file contract:
 * Purpose: what the mobile app is: its targets, API area and env contract, its identity in the
 *          stores, and the Expo, EAS, Maestro and e2e sections the build tools read. `stackra gen`
 *          writes every tool file from it into `.stackra/` (the Expo configuration, `eas.json`,
 *          Metro, Maestro, Vitest, the entry) and the repository-root `.easignore`.
 * Boundary: static data that gen reads from the syntax tree without running it: enum values,
 *           literals and the env class, never a function or an environment read. The member key
 *           (`mobile`) comes from the package name and the root module is src/mobile.module.ts, so
 *           neither is written here. A fact read while the app runs is a config class in
 *           `src/config/` (chrome, theming, i18n, …); a fact that differs per environment (Metro
 *           port, public values, EAS profiles and channels, Sentry project) is runway.yaml; an
 *           account or vendor id (EAS project, Apple team, store ids) and the release policy are
 *           the root runway; icons, splash, locales, permission strings, plugins, deep-link domains
 *           and versions are derived. Each tool section is the tool's own shape minus the keys
 *           Stackra owns, so setting an owned key is a type error; a code hatch would be
 *           `expo.extend.ts` or `metro.extend.ts` at the member root, and none is needed.
 * Runtime: node
 * Governing contract: ADR 0295 (decisions 1 to 6), ADR 0294 (decisions 12 and 20), ADR 0180,
 *                     ADR 0182
 */
import { defineApp } from "@stackra/app";
import { ApiArea, Target } from "@stackra/contracts";
import { MobileEnv } from "./src/config/env.config";

/** Read by `stackra gen`, `stackra dev`, `stackra build` and `stackra test`. */
export default defineApp({
  targets: [Target.Ios, Target.Android],
  area: ApiArea.App,
  /** Its `@Env` fields, and those of the config overrides, are the only values in the bundle. */
  env: MobileEnv,
  name: "Acme",
  /** Deep links (`acme://`) and the PKCE redirect (`acme://auth/callback`). */
  scheme: "acme",
  /** Frozen after the first store upload: gen refuses a change unless an ADR records it. */
  ios: {
    bundleId: "example.acme.mobile",
    supportsTablet: true,
  },
  /** Frozen after the first store upload, like the bundle id. */
  android: { package: "example.acme.mobile" },
  expo: {
    slug: "acme-mobile",
    orientation: "portrait",
    /** A native build is reused while its fingerprint is unchanged; one policy, never mixed. */
    runtimeVersion: { policy: "fingerprint" },
    /** Export compliance: the app uses only exempt encryption. */
    ios: { config: { usesNonExemptEncryption: false } },
    android: { predictiveBackGestureEnabled: false },
  },
  /** EAS owns the build number. */
  eas: { cli: { appVersionSource: "remote" } },
  /** The flows sit beside the routes they drive; run per platform and per locale of i18n. */
  maestro: { flows: "src/routes/**/__tests__/*.flow.yaml" },
  /** Seeder keys `<module>.<profile>`, run before the flows, on the runway `e2e` EAS profile. */
  e2e: {
    seeds: ["orders.demo"],
    profile: "e2e",
  },
});
