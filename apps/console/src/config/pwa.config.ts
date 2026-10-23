/**
 * Stackra file contract:
 * Purpose: the console's override of @stackra/platform's PWA configuration: what the installed web
 *          app (target `pwa`) and its service worker do while they run: the manifest entries that
 *          code reads (the protocol handler the `/open` route accepts, the share target the worker
 *          intercepts, the file handler the `/open-file` page consumes), the worker's caching
 *          preset with per-route overrides, offline behaviour, Web Push, how a new worker reaches
 *          open tabs, the install prompt and periodic sync.
 * Boundary: an override keeps the base's name and imports the base as `BasePwaConfig`; it sets
 *           `override` field defaults only and inherits the base's key (`platform.pwa`); each
 *           nested object spreads the base first and restates its type. A second override of the
 *           same base fails gen. Gen copies these values into the generated `sw.ts` and every
 *           `manifest.<locale>.webmanifest`, prefixing each route with the locale's lowercase
 *           prefix. The manifest's presentation keys (names, display, colours, icons, screenshots,
 *           shortcuts, link handling) are read only by the browser from the built manifest, so they
 *           are stackra.config.ts `pwa`. Tenant data never enters Cache Storage (`/api/*` is
 *           NetworkOnly whatever the preset) and the worker scope is the app origin (ADR 0255 d2):
 *           fixed rules of the generated worker, not options.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19; as amended by programming model v3.1, AGENTS.md: the
 *                     Base alias), ADR 0295 (decision 4), ADR 0255, ADR 0252 (mutation queue), ADR
 *                     0256 (storage)
 */
import { Duration } from "@stackra/contracts";
import {
  CachePreset,
  CacheStrategy,
  FileLaunchType,
  InstallPrompt,
  PromptMoment,
  PwaConfig as BasePwaConfig,
  UpdateStrategy,
} from "@stackra/platform";

/** The installed web app at run time: handlers, caching, offline, push, updates and install. */
export class PwaConfig extends BasePwaConfig {
  /**
   * The manifest entries code reads. `web+acme://…` opens `/open` (`OpenRoute`), which resolves it
   * to an in-app path. A share from another app posts to `/share`: the worker stores the files and
   * text on the device and redirects to the page, which offers to attach the images to a product.
   * Opening a PNG, JPEG or WebP with the installed console lands on `/open-file` in the window
   * already open.
   */
  override manifest: BasePwaConfig["manifest"] = {
    ...this.manifest,
    protocolHandlers: { "web+acme": "/open?url=%s" },
    shareTarget: {
      action: "/share",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        title: "title",
        text: "text",
        url: "url",
        files: [{ name: "images", accept: ["image/png", "image/jpeg", "image/webp"] }],
      },
    },
    fileHandlers: [
      {
        action: "/open-file",
        accept: {
          "image/png": [".png"],
          "image/jpeg": [".jpg", ".jpeg"],
          "image/webp": [".webp"],
        },
        launchType: FileLaunchType.SingleClient,
      },
    ],
  };

  /**
   * What the worker caches. The preset sets every route's strategy at once: `OnlineFirst` (network
   * first, the cache only when the network fails or times out), `OfflineFirst` (cache first,
   * refreshed in the background) or `Balanced` (the shell and hashed assets cache first,
   * navigations network first with a timeout). The console is a till that must open without a
   * connection, so it takes `Balanced`, and `routes` overrides single paths: hashed assets and
   * icons stay cache first, the screenshots go stale-while-revalidate, and the health check is
   * never cached. At most 200 entries of up to 30 days per runtime cache, no cross-origin cache. A
   * navigation nothing answers renders in the cached shell with the offline banner; the
   * prerendered `/offline` page of the request's locale is served only when even the shell is
   * missing.
   */
  override caching: BasePwaConfig["caching"] = {
    ...this.caching,
    preset: CachePreset.Balanced,
    routes: {
      "/assets/": CacheStrategy.CacheFirst,
      "/icons/": CacheStrategy.CacheFirst,
      "/screenshots/": CacheStrategy.StaleWhileRevalidate,
      "/healthz": CacheStrategy.NetworkOnly,
    },
    precacheShell: true,
    runtimeCacheOrigins: [],
    maxEntries: 200,
    maxAge: Duration.days(30),
    navigationPreload: true,
    networkTimeout: Duration.seconds(3),
    offlineFallback: "/offline",
  };

  /**
   * Offline: `navigator.storage.persist()` so Safari does not evict the outbox, Background Sync
   * wakes the outbox drain where the browser has it, and the banner shows after three seconds
   * without connectivity.
   */
  override offline: BasePwaConfig["offline"] = {
    ...this.offline,
    persistStorage: true,
    backgroundSync: true,
    bannerAfter: Duration.seconds(3),
  };

  /**
   * Web Push: the permission prompt only from settings, the unread count on the app icon; where it
   * is unavailable (iOS not installed) notifications stay in-app (ADR 0255 d3).
   */
  override push: BasePwaConfig["push"] = {
    ...this.push,
    enabled: true,
    askOn: PromptMoment.Settings,
    badging: true,
  };

  /**
   * A new worker version: prompt and wait, check every hour, activate the waiting worker as soon as
   * the user accepts, then reload once it takes control.
   */
  override updates: BasePwaConfig["updates"] = {
    ...this.updates,
    strategy: UpdateStrategy.Prompt,
    checkEvery: Duration.hours(1),
    skipWaitingOnAccept: true,
    reloadOnControllerChange: true,
  };

  /** The house install prompt after two sessions, with the Add to Home Screen steps on iOS. */
  override install: BasePwaConfig["install"] = {
    ...this.install,
    prompt: InstallPrompt.House,
    afterSessions: 2,
    iosInstructions: true,
  };

  /** Periodic Background Sync; off, so the worker registers no periodic listener. */
  override periodicSync = false;
}
