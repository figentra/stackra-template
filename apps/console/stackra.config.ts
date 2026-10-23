/**
 * Stackra file contract:
 * Purpose: what the console is: its name, build targets, API area, the env contract, and the
 *          facts only build tools read: the web manifest's presentation keys (`pwa`), the desktop
 *          installers (`electron`) and the e2e projects. Read by `stackra gen`, `stackra dev`,
 *          `stackra build`, `stackra test` and `stackra validate` from the syntax tree.
 * Boundary: static data only: enum values, literals and tokens, never a function or an environment
 *           read. The member key (`console`) comes from the package name and the root module is
 *           src/console.module.ts, so neither is written. Each section has its tool's own shape
 *           minus the keys Stackra owns (setting one is a type error): gen owns the service
 *           worker's build, the manifest's names, icons, `lang`, `dir` and protocol handlers, and
 *           electron-builder's product name, icons, files, protocols, entitlements and feed. What
 *           code reads while it runs is `src/config/*.config.ts`; where it runs (ports, domains,
 *           vars, channels, the health check) is `runway.yaml`. Consumed services are inferred
 *           from `#stackra/clients` imports. No code hatch: the console has no `*.extend.ts`.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 12), ADR 0295 (decisions 1 to 6), ADR 0249 (one member,
 *                     three targets), ADR 0255 (PWA), ADR 0254 (desktop release), ADR 0082 (API
 *                     areas)
 */
import { defineApp } from "@stackra/app";
import { ApiArea, Target } from "@stackra/contracts";
import { ConsoleEnv } from "./src/config/env.config";

/** `targets` picks the generated outputs: Vite, the service worker, the manifests and Electron. */
export default defineApp({
  targets: [Target.Web, Target.Pwa, Target.Desktop],
  area: ApiArea.App,
  env: ConsoleEnv,
  /** The product name: the PWA's install name fallback, the dock and the installers. */
  name: "Acme Console",
  /**
   * The web manifest's presentation keys. Each shortcut's names come from
   * `console::manifest.shortcuts.<route>.*` for the route at its `url`; its icon is derived.
   */
  pwa: {
    manifest: {
      display: "standalone",
      orientation: "any",
      start_url: "/",
      id: "/",
      categories: ["business", "productivity"],
      handle_links: "preferred",
      launch_handler: { client_mode: "navigate-existing" },
      shortcuts: [{ url: "/quick-order" }],
    },
  },
  /**
   * electron-builder: the bundle identifier (the reverse of the product domain, stable across
   * releases), the copyright line and the installers per platform; runway's
   * `release.desktop.platforms` may only narrow them. `zip` feeds electron-updater; Linux ships
   * AppImage only on day one (ADR 0254 d2); NSIS installs per user, with no administrator. The USB
   * entitlement is derived from the peripherals drivers in use.
   */
  electron: {
    appId: "example.acme.console",
    copyright: "Copyright © 2026 Acme",
    mac: {
      target: [
        { target: "dmg", arch: ["universal"] },
        { target: "zip", arch: ["universal"] },
      ],
    },
    win: { target: [{ target: "nsis", arch: ["x64", "arm64"] }] },
    nsis: { perMachine: false },
    linux: { target: [{ target: "AppImage", arch: ["x64"] }] },
  },
  e2e: {
    // + chromium-rtl (i18n.config.ts rtl), pwa and desktop (targets), by gen
    projects: ["chromium", "mobile-safari"],
    seeds: ["orders.demo"],
  },
});
