/**
 * Stackra file contract:
 * Purpose: what the console is: its name, build targets, API area, the env contract, and the facts
 *          only build tools read: the web manifest's presentation keys (`pwa`), the mobile app's
 *          universal-link association (`appLinks`), the desktop installers (`electron`) and the e2e
 *          projects. Read by `stackra gen`, `stackra dev`,
 *          `stackra build`, `stackra test` and `stackra validate` from the syntax tree.
 * Boundary: static data only: enum values, literals and tokens, never a function or an environment
 *           read. The member key (`console`) comes from the package name; the console writes no
 *           root module (gen derives one from the folder), so neither is written here. Each section
 *           has its tool's own shape minus the keys Stackra owns (setting one is a type error): gen
 *           owns the service worker's build, the manifest's names and descriptions (from
 *           `manifest::` per locale), icons, colours (from the theme), `lang`, `dir`, the locale
 *           prefixes and the handlers code reads (pwa.config.ts), and electron-builder's product
 *           name, icons, files, protocols, entitlements, usage strings and feed. What code reads
 *           while it runs is `src/config/*.config.ts`; where it runs (ports, domains, vars,
 *           channels, the health check) is `runway.yaml`. Consumed services are inferred from
 *           `#stackra/clients/<service>` imports. No code hatch: the console has no `*.extend.ts`.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 12), ADR 0295 (decisions 1 to 6), ADR 0249 (one member,
 *                     three targets), ADR 0255 (PWA), ADR 0254 (desktop release), ADR 0082 (API
 *                     areas)
 */
import { defineApp } from "@stackra/app";
import { ApiArea, Target } from "@stackra/contracts";
import { EnvConfig } from "./src/config/env.config";

/** `targets` picks the generated outputs: Vite, the service worker, the manifests and Electron. */
export default defineApp({
  targets: [Target.Web, Target.Pwa, Target.Desktop],
  area: ApiArea.App,
  env: EnvConfig,
  /** The product name: the PWA's install name fallback, the dock and the installers. */
  name: "Acme Console",
  /**
   * The web manifest's presentation keys, one manifest per locale. Each shortcut's names come from
   * `manifest::shortcuts.<route>.*` for the route at its `url`, its icon is derived; each
   * screenshot is captured by the e2e tier from its route in every locale at the given size and
   * labelled from `manifest::screenshots.<route>`. `display_override` falls back in order:
   * desktop window controls in the title bar, then a tabbed window, then standalone.
   */
  pwa: {
    manifest: {
      id: "/",
      start_url: "/",
      scope: "/",
      display: "standalone",
      display_override: ["window-controls-overlay", "tabbed", "standalone", "minimal-ui"],
      orientation: "any",
      categories: ["business", "productivity", "shopping"],
      shortcuts: [
        { url: "/" },
        { url: "/orders/orders" },
        { url: "/quick-order" },
        { url: "/settings" },
      ],
      screenshots: [
        { route: "/", size: "1280x800", form_factor: "wide" },
        { route: "/quick-order", size: "390x844", form_factor: "narrow" },
      ],
      launch_handler: { client_mode: ["navigate-existing", "auto"] },
      handle_links: "preferred",
      edge_side_panel: { preferred_width: 400 },
      // The mobile app's Play listing, derived from its bundle id. The App Store entry needs the
      // numeric id Apple assigns at the first listing, so it joins then (platform `itunes`).
      related_applications: [
        {
          platform: "play",
          url: "https://play.google.com/store/apps/details?id=example.acme.mobile",
          id: "example.acme.mobile",
        },
      ],
      prefer_related_applications: false,
    },
  },
  /**
   * The apps whose universal links this origin vouches for (mobile's `EnvConfig.appOrigin` is the
   * console's domain). Gen writes `/.well-known/apple-app-site-association` (`<teamId>.<bundleId>`)
   * and `/.well-known/assetlinks.json` (the Android package and the Play app-signing SHA-256) from
   * each app's own stackra.config.ts and the root runway (`providers.apple.teamId`,
   * `providers.google.appSigningSha256`, resolved at deploy, never written here), served as
   * `application/json` with no redirect. `MobileLinkRoute` answers the same paths in a browser.
   */
  appLinks: [{ app: "@acme/mobile", paths: ["/m", "/m/*"] }],
  /**
   * electron-builder: the bundle identifier (the reverse of the product domain, stable across
   * releases), the copyright line and the installers per platform; runway's
   * `release.desktop.platforms` may only narrow them. `zip` feeds electron-updater; Linux ships
   * AppImage only on day one (ADR 0254 d2); NSIS installs per user, with no administrator. The
   * entitlements and the macOS usage strings are derived from desktop.config.ts `devices`.
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
    // + one RTL project per RTL locale (i18n.config.ts rtl: ar, ar-SA), pwa and desktop (targets),
    // by gen
    projects: ["chromium", "mobile-safari"],
    seeds: ["orders.demo"],
  },
});
