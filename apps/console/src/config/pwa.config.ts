/**
 * Stackra file contract:
 * Purpose: one fact: the installable web app (target `pwa`). The service-worker build, manifest
 *          fields gen cannot derive, caching, offline, push, updates and the install prompt; every
 *          field reaches the generated `sw.ts`, `vite.config.ts` or the per-locale
 *          `pwa/manifest.<locale>.webmanifest`. Name, colours, icons, `lang` and `dir` come from
 *          theming and i18n; text fields are i18n keys, translated once per locale.
 * Boundary: tenant data never enters Cache Storage (`/api/*` is NetworkOnly) and the worker scope
 *           is the app origin (ADR 0255 d2): fixed rules of the generated worker, not options.
 *           `display`, `handleLinks`, `orientation`, `launchClientMode` and
 *           `serviceWorker.strategies` are tool-owned values typed by the web manifest and
 *           vite-plugin-pwa, not house enums.
 * Runtime: isomorphic
 * Governing contract: ADR 0255, ADR 0252 (mutation queue), ADR 0256 (storage)
 */
import { Config } from "@stackra/config";
import { CacheStrategy, InstallPrompt, PromptMoment, UpdateStrategy } from "@stackra/platform";
import { Bool, Duration, Int, List, Map, Nested, OneOf, Str, Url } from "@stackra/validation";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** How the worker is built; both values are vite-plugin-pwa's own. */
class ServiceWorkerConfig {
  /**
   * `injectManifest` compiles the generated `sw.ts`; `generateSW` would ignore it.
   * @defaultValue "injectManifest"
   */
  @OneOf(["injectManifest", "generateSW"]) strategies = "injectManifest";
  /** The worker source under `.stackra/`. @defaultValue "sw.ts" */
  @Str() filename = "sw.ts";
}

/** One manifest shortcut: a route, its names and its description; the 96px icon is derived. */
class Shortcut {
  /** The route the shortcut opens. */
  route = Routes.quick_order;
  /** Its label, translated per locale. */
  nameKey = I18n.console.shortcuts.quick_order;
  /** Its short label where space is tight, translated per locale. */
  shortNameKey = I18n.console.shortcuts.quick_order_short;
  /** What it does, for assistive tech and app launchers, translated per locale. */
  descriptionKey = I18n.console.shortcuts.quick_order_description;
}

/** Manifest fields gen cannot derive from theming and i18n. */
class ManifestConfig {
  /**
   * Short name on the home screen, translated per locale (gen refuses one longer than 12
   * characters); the long name is `console::shell.brand`.
   */
  shortNameKey = I18n.console.shell.short_name;
  /** Web manifest `description`, translated per locale. */
  descriptionKey = I18n.console.manifest.description;
  /** Web manifest `display`. @defaultValue "standalone" */
  @OneOf(["standalone", "minimal-ui", "fullscreen", "browser"]) display = "standalone";
  /** Web manifest `orientation`. @defaultValue "any" */
  @OneOf(["any", "portrait", "landscape"]) orientation = "any";
  /** Path the installed app opens on. @defaultValue "/" */
  @Str({ pattern: /^\// }) startUrl = "/";
  /** Manifest `id`; stable across releases so an install survives a rename. @defaultValue "/" */
  @Str() id = "/";
  /** Store categories. @defaultValue ["business", "productivity"] */
  @List(Str) categories: string[] = ["business", "productivity"];
  /** Manifest `shortcuts`; icons are derived. */
  @List(Nested(Shortcut)) shortcuts: Shortcut[] = [new Shortcut()];
  /** `web+acme://…` opens the `/open` route (`OpenRoute`), which resolves it to an in-app path. */
  @Map(Str) protocolHandlers: Record<string, string> = { "web+acme": "/open?url=%s" };
  /**
   * Web manifest `handle_links`: a link into the console's scope opens the installed app.
   * @defaultValue "preferred"
   */
  @OneOf(["auto", "preferred", "not-preferred"]) handleLinks = "preferred";
  /** Web manifest `launch_handler.client_mode`. @defaultValue "navigate-existing" */
  @OneOf(["auto", "navigate-existing", "navigate-new", "focus-existing"])
  launchClientMode = "navigate-existing";
}

/** What the worker caches and how; `/api/*` is never cached. */
class CachingConfig {
  /** Precache the built shell on install. @defaultValue true */
  @Bool() precacheShell = true;
  /** Strategy per same-origin path prefix; `/` is the navigation strategy. */
  @Map(OneOf(CacheStrategy)) routes: Record<string, CacheStrategy> = {
    "/assets/": CacheStrategy.CacheFirst,
    "/icons/": CacheStrategy.CacheFirst,
    "/": CacheStrategy.NetworkFirst,
  };
  /** Cross-origin assets runtime-cached by allow-list only. @defaultValue [] */
  @List(Url) runtimeCacheOrigins: string[] = [];
  /** Entries kept per runtime cache. @defaultValue 200 */
  @Int({ min: 1 }) maxEntries = 200;
  /** Age after which a runtime entry is dropped. @defaultValue "30d" */
  @Duration() maxAge = "30d";
  /** Start the navigation request while the worker boots. @defaultValue true */
  @Bool() navigationPreload = true;
  /**
   * How long a network-first navigation waits before the cached copy answers. @defaultValue "3s"
   */
  @Duration() networkTimeout = "3s";
  /**
   * The page served for a navigation only when even the app shell is missing; with the shell
   * cached, a never-visited route renders in the shell with the offline banner.
   * @defaultValue "/offline"
   */
  @Str({ pattern: /^\// }) offlineFallback = "/offline";
}

/** Offline behaviour of the installed app. */
class OfflineConfig {
  /** `navigator.storage.persist()` so Safari does not evict the outbox. @defaultValue true */
  @Bool() persistStorage = true;
  /** Wake the outbox drain through Background Sync where the browser has it. @defaultValue true */
  @Bool() backgroundSync = true;
  /** Show the offline banner after this long without connectivity. @defaultValue "3s" */
  @Duration() bannerAfter = "3s";
}

/**
 * Web Push; where it is unavailable (iOS not installed) notifications stay in-app (ADR 0255 d3).
 */
class PushConfig {
  /** Register for Web Push at all. @defaultValue true */
  @Bool() enabled = true;
  /** When the permission prompt may appear. @defaultValue PromptMoment.Settings */
  @OneOf(PromptMoment) askOn = PromptMoment.Settings;
  /** Mirror the unread count on the app icon. @defaultValue true */
  @Bool() badging = true;
}

/** How a new worker version reaches open tabs. */
class UpdatesConfig {
  /**
   * Prompt and wait, reload idle tabs at once, or apply on the next navigation.
   * @defaultValue UpdateStrategy.Prompt
   */
  @OneOf(UpdateStrategy) strategy = UpdateStrategy.Prompt;
  /** How often the registration checks for a new worker. @defaultValue "1h" */
  @Duration() checkEvery = "1h";
  /** Activate the waiting worker as soon as the user accepts. @defaultValue true */
  @Bool() skipWaitingOnAccept = true;
  /** Reload the page once the new worker takes control. @defaultValue true */
  @Bool() reloadOnControllerChange = true;
}

/** The install prompt. */
class InstallConfig {
  /** The house prompt, the browser's own, or none. @defaultValue InstallPrompt.House */
  @OneOf(InstallPrompt) prompt = InstallPrompt.House;
  /** Sessions before the house prompt may show. @defaultValue 2 */
  @Int({ min: 0 }) afterSessions = 2;
  /** Show the Add to Home Screen steps on iOS Safari. @defaultValue true */
  @Bool() iosInstructions = true;
}

/**
 * The installable web app: worker build, manifest fields, caching, offline, push, updates and
 * install.
 */
@Config("console.pwa")
export class PwaConfig {
  /** How vite-plugin-pwa builds the worker. */
  @Nested(ServiceWorkerConfig) serviceWorker = new ServiceWorkerConfig();
  /** The manifest fields gen cannot derive. */
  @Nested(ManifestConfig) manifest = new ManifestConfig();
  /** What the worker caches and how. */
  @Nested(CachingConfig) caching = new CachingConfig();
  /** What the installed app does without a network. */
  @Nested(OfflineConfig) offline = new OfflineConfig();
  /** Whether and when the app asks for Web Push. */
  @Nested(PushConfig) push = new PushConfig();
  /** How a new worker reaches open tabs. */
  @Nested(UpdatesConfig) updates = new UpdatesConfig();
  /** When and how installing is offered. */
  @Nested(InstallConfig) install = new InstallConfig();
  /**
   * Periodic Background Sync; off, so the worker registers no periodic listener.
   * @defaultValue false
   */
  @Bool() periodicSync = false;
}
