/**
 * Stackra file contract:
 * Purpose: the console's override of @stackra/platform's PWA configuration: what the installed web
 *          app (target `pwa`) and its service worker do while they run: the protocol handler the
 *          `/open` route accepts, the worker's caching, offline behaviour, Web Push, how a new
 *          worker reaches open tabs, the install prompt and periodic sync.
 * Boundary: an override declares `override` members only and inherits the base's key
 *           (`platform.pwa`); each nested object spreads the base first and restates its type. Gen
 *           copies the start values into the generated `sw.ts` and the per-locale manifests. The
 *           web manifest's presentation keys (display, orientation, start URL, id, categories, link
 *           handling, shortcuts) are read only by the browser from the built manifest, so they are
 *           stackra.config.ts `pwa`; names, icons, `lang` and `dir` are derived. Tenant data never
 *           enters Cache Storage (`/api/*` is NetworkOnly) and the worker scope is the app origin
 *           (ADR 0255 d2): fixed rules of the generated worker, not options.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19), ADR 0295 (decision 4), ADR 0255, ADR 0252 (mutation
 *                     queue), ADR 0256 (storage)
 */
import { Duration } from "@stackra/contracts";
import {
  CacheStrategy,
  InstallPrompt,
  PromptMoment,
  PwaConfig,
  UpdateStrategy,
} from "@stackra/platform";

/** The installed web app at run time: handler, caching, offline, push, updates and install. */
export class ConsolePwaConfig extends PwaConfig {
  /** `web+acme://…` opens the `/open` route (`OpenRoute`), which resolves it to an in-app path. */
  override manifest: PwaConfig["manifest"] = {
    ...this.manifest,
    protocolHandlers: { "web+acme": "/open?url=%s" },
  };

  /**
   * What the worker caches: the built shell on install, hashed assets and icons cache first,
   * navigations network first with a three-second timeout and navigation preload, at most 200
   * entries of up to 30 days per runtime cache, no cross-origin cache. A navigation nothing
   * answers renders in the cached shell with the offline banner; `/offline` is served only when
   * even the shell is missing.
   */
  override caching: PwaConfig["caching"] = {
    ...this.caching,
    precacheShell: true,
    routes: {
      "/assets/": CacheStrategy.CacheFirst,
      "/icons/": CacheStrategy.CacheFirst,
      "/": CacheStrategy.NetworkFirst,
    },
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
  override offline: PwaConfig["offline"] = {
    ...this.offline,
    persistStorage: true,
    backgroundSync: true,
    bannerAfter: Duration.seconds(3),
  };

  /**
   * Web Push: the permission prompt only from settings, the unread count on the app icon; where it
   * is unavailable (iOS not installed) notifications stay in-app (ADR 0255 d3).
   */
  override push: PwaConfig["push"] = {
    ...this.push,
    enabled: true,
    askOn: PromptMoment.Settings,
    badging: true,
  };

  /**
   * A new worker version: prompt and wait, check every hour, activate the waiting worker as soon as
   * the user accepts, then reload once it takes control.
   */
  override updates: PwaConfig["updates"] = {
    ...this.updates,
    strategy: UpdateStrategy.Prompt,
    checkEvery: Duration.hours(1),
    skipWaitingOnAccept: true,
    reloadOnControllerChange: true,
  };

  /** The house install prompt after two sessions, with the Add to Home Screen steps on iOS. */
  override install: PwaConfig["install"] = {
    ...this.install,
    prompt: InstallPrompt.House,
    afterSessions: 2,
    iosInstructions: true,
  };

  /** Periodic Background Sync; off, so the worker registers no periodic listener. */
  override periodicSync = false;
}
