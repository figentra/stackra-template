/**
 * Stackra file contract:
 * Purpose: one fact: the Electron desktop target. Desktop mode, windows, named overlays (each with
 *          its global shortcut), menus, tray, deep links, auto-update behaviour, renderer
 *          permissions, tighten-only hardening knobs and packaging.
 * Boundary: no identity, password, certificate, feed domain or origin list: signing switches and
 *           the feed path are `runway.yaml` `release.desktop`, the feed URL is derived by gen, and
 *           `connect-src` is csp.config.ts. The hardening baseline (context isolation, sandbox,
 *           fuses, CSP from main; ADR 0251) applies regardless. `titleBarStyle`, `standardRoles`,
 *           `channels`, `allow` and the packaging targets are Electron's and electron-builder's own
 *           values, typed by their unions, not house enums.
 * Runtime: isomorphic
 * Governing contract: ADR 0249, ADR 0251, ADR 0254, ADR 0181, ADR 0281
 */
import { Config } from "@stackra/config";
import {
  DesktopMode,
  InstallMoment,
  OverlayAnchor,
  OverlayStyle,
  TrayClickAction,
  WindowKind,
} from "@stackra/platform";
import { OfflineStore } from "@stackra/storage";
import { Bool, Duration, Int, List, Map, Nested, OneOf, Str, Url } from "@stackra/validation";

/** One window: size limits, the route it opens and its frame. */
class WindowConfig {
  /** Route the window opens. @defaultValue "/" */
  @Str({ pattern: /^\// }) route = "/";
  /** Initial width. @defaultValue 1280 */
  @Int({ min: 320 }) width = 1280;
  /** Initial height. @defaultValue 800 */
  @Int({ min: 240 }) height = 800;
  /** Smallest width the layout supports. @defaultValue 960 */
  @Int({ min: 320 }) minWidth = 960;
  /** Smallest height the layout supports. @defaultValue 640 */
  @Int({ min: 240 }) minHeight = 640;
  /** Whether the user may resize the window. @defaultValue true */
  @Bool() resizable = true;
  /** Remember bounds per display in the prefs store. @defaultValue true */
  @Bool() persistBounds = true;
  /** Electron `titleBarStyle`. @defaultValue "hiddenInset" */
  @OneOf(["default", "hidden", "hiddenInset", "customButtonsOnHover"]) titleBarStyle =
    "hiddenInset";
  /** Normal, modal or panel window. @defaultValue WindowKind.Normal */
  @OneOf(WindowKind) kind = WindowKind.Normal;
  /** Open at launch. @defaultValue true */
  @Bool() openOnLaunch = true;
}

/**
 * One floating overlay (ADR 0281 d4): any route rendered inside `LauncherOverlay` or
 * `PanelOverlay` from `@stackra/platform/react`; the same route also works in the main window.
 */
class OverlayConfig {
  /** Launcher bar or docked panel. @defaultValue OverlayStyle.Launcher */
  @OneOf(OverlayStyle) style = OverlayStyle.Launcher;
  /** Route the overlay renders. @defaultValue "/" */
  @Str({ pattern: /^\// }) route = "/";
  /**
   * Electron accelerator that toggles it, registered by main only; empty means none.
   * @defaultValue ""
   */
  @Str() shortcut = "";
  /** The user may rebind or turn the shortcut off in settings. @defaultValue true */
  @Bool() userConfigurable = true;
  /** Where it opens. @defaultValue OverlayAnchor.ScreenCenter */
  @OneOf(OverlayAnchor) anchor = OverlayAnchor.ScreenCenter;
  /** Float above other apps. @defaultValue true */
  @Bool() alwaysOnTop = true;
  /** Hide when it loses focus (launcher behaviour). @defaultValue true */
  @Bool() hideOnBlur = true;
  /** The user may pin it open (panel behaviour). @defaultValue false */
  @Bool() pinnable = false;
  /** The user may resize it; size and position are remembered. @defaultValue false */
  @Bool() resizable = false;
  /** Vibrancy or blur background; opaque where the OS has none. @defaultValue true */
  @Bool() vibrancy = true;
  /** Displays it may open on: the active one or any. @defaultValue "active" */
  @OneOf(["active", "any"]) displays = "active";
}

/** Shell switches of the application and context menus; the items are the `@Menu` classes. */
class MenusConfig {
  /** Show the application menu. @defaultValue true */
  @Bool() applicationMenu = true;
  /** Show the right-click menu. @defaultValue true */
  @Bool() contextMenu = true;
  /** Electron menu roles kept besides the contributed items. */
  @List(Str) standardRoles: string[] = ["undo", "redo", "cut", "copy", "paste", "selectAll"];
  /** The Help menu's documentation link. @defaultValue "https://docs.acme.dev/console" */
  @Url() docsUrl = "https://docs.acme.dev/console";
}

/** The tray icon. */
class TrayConfig {
  /** Show a tray icon. @defaultValue true */
  @Bool() enabled = true;
  /**
   * Keep the app alive in the tray after the last window closes; opt-in by the user (ADR 0254).
   * @defaultValue false
   */
  @Bool() keepAliveDefault = false;
  /** What a click on the icon does. @defaultValue TrayClickAction.ToggleMain */
  @OneOf(TrayClickAction) onClick = TrayClickAction.ToggleMain;
  /** Mirror the unread count on the icon. @defaultValue true */
  @Bool() badge = true;
}

/** Deep links into the app. */
class DeepLinksConfig {
  /**
   * Custom scheme, registered as the default handler at install.
   * @defaultValue "acme-console"
   */
  @Str({ pattern: /^[a-z][a-z0-9-]+$/ }) scheme = "acme-console";
  /** Also claim the app's https origin as universal links. @defaultValue false */
  @Bool() claimHttpsOrigin = false;
  /** Route a deep link opens; `%s` is the path after the scheme. @defaultValue "/open?url=%s" */
  @Str() route = "/open?url=%s";
}

/** Auto-update behaviour; the active channel per environment is runway's. */
class UpdatesConfig {
  /** Check for updates at all. @defaultValue true */
  @Bool() enabled = true;
  /**
   * electron-updater channels; `latest` is stable (ADR 0254 d3).
   * @defaultValue ["beta", "latest"]
   */
  @List(OneOf(["beta", "latest"])) channels = ["beta", "latest"];
  /** How often to check. @defaultValue "4h" */
  @Duration() checkEvery = "4h";
  /** When a downloaded update installs. @defaultValue InstallMoment.Quit */
  @OneOf(InstallMoment) installOn = InstallMoment.Quit;
  /** Staged rollout percentage written to the feed (ADR 0181 d3). @defaultValue 20 */
  @Int({ min: 1, max: 100 }) stagingPercentage = 20;
  /** Let the user switch to the beta channel in settings. @defaultValue true */
  @Bool() userSelectableChannel = true;
  /** Download block-map deltas instead of the whole installer. @defaultValue true */
  @Bool() differential = true;
}

/** Renderer permission requests main grants; everything else is denied by the baseline. */
class PermissionsConfig {
  /**
   * Electron permission names granted.
   * @defaultValue ["notifications", "clipboard-read", "fullscreen", "usb", "hid"]
   */
  @List(
    OneOf([
      "notifications",
      "media",
      "display-capture",
      "clipboard-read",
      "fullscreen",
      "serial",
      "usb",
      "hid",
    ]),
  )
  allow = ["notifications", "clipboard-read", "fullscreen", "usb", "hid"];
  /**
   * Origins the renderer may navigate to; everything else opens in the system browser.
   * @defaultValue ["app://"]
   */
  @List(Str) allowedNavigationOrigins: string[] = ["app://"];
}

/** Tighten-only knobs; the baseline cannot be loosened from config (ADR 0251 d3). */
class HardeningConfig {
  /** Remove devtools from production builds. @defaultValue true */
  @Bool() disableDevToolsInProduction = true;
  /** Certificate pinning of the API origin (SPKI hashes); empty means none. @defaultValue [] */
  @List(Str) pinnedSpki: string[] = [];
}

/** electron-builder packaging; runway's `release.desktop.platforms` may only narrow it. */
class PackagingConfig {
  /** Bundle identifier. @defaultValue "dev.acme.console" */
  @Str() appId = "dev.acme.console";
  /** Name in the dock and the start menu. @defaultValue "Console" */
  @Str() productName = "Console";
  /** Copyright line of the installers. @defaultValue "© Acme" */
  @Str() copyright = "© Acme";
  /** macOS targets; `zip` is required by electron-updater. @defaultValue ["dmg", "zip"] */
  @List(OneOf(["dmg", "zip", "pkg", "mas"])) mac = ["dmg", "zip"];
  /** Windows targets. @defaultValue ["nsis"] */
  @List(OneOf(["nsis", "msi", "appx", "portable"])) windows = ["nsis"];
  /** Linux targets; AppImage only on day one (ADR 0254 d2). @defaultValue ["AppImage"] */
  @List(OneOf(["AppImage", "deb", "rpm", "snap", "flatpak"])) linux = ["AppImage"];
  /** macOS architectures. @defaultValue ["universal"] */
  @List(OneOf(["x64", "arm64", "universal"])) macArch = ["universal"];
  /** Windows architectures. @defaultValue ["x64", "arm64"] */
  @List(OneOf(["x64", "arm64"])) windowsArch = ["x64", "arm64"];
  /** Linux architectures. @defaultValue ["x64"] */
  @List(OneOf(["x64", "arm64"])) linuxArch = ["x64"];
  /** NSIS: per-user install, no admin. @defaultValue false */
  @Bool() perMachine = false;
  /**
   * Extra entitlements beyond the hardened-runtime set; the POS peripherals need USB (ADR 0253).
   */
  @List(Str) macEntitlements: string[] = ["com.apple.security.device.usb"];
  /** File extensions the app opens, extension → description. @defaultValue {} */
  @Map(Str) fileAssociations: Record<string, string> = {};
}

/**
 * The Electron desktop target: mode, windows, overlays, menus, tray, deep links, auto-update and
 * permissions.
 */
@Config("console.desktop")
export class DesktopConfig {
  /** Dock app, menu-bar app or both (ADR 0281 d3). @defaultValue DesktopMode.Hybrid */
  @OneOf(DesktopMode) mode = DesktopMode.Hybrid;
  /** One window per key; `main` is required. */
  @Map(Nested(WindowConfig)) windows: Record<string, WindowConfig> = {
    main: new WindowConfig(),
  };
  /** Named overlays, each opened by its shortcut, the tray menu or an in-app button. */
  @Map(Nested(OverlayConfig)) overlays: Record<string, OverlayConfig> = {
    // Claude-style prompt bar centred on the active display; Esc or blur closes it.
    quick: Object.assign(new OverlayConfig(), {
      style: OverlayStyle.Launcher,
      route: "/quick-order",
      shortcut: "CommandOrControl+Shift+Space",
      anchor: OverlayAnchor.ScreenCenter,
    }),
    // Gemini-style card docked to the right edge. The dashboard stands in until an assistant
    // route exists.
    assistant: Object.assign(new OverlayConfig(), {
      style: OverlayStyle.Panel,
      route: "/",
      anchor: OverlayAnchor.EdgeRight,
      hideOnBlur: false,
      pinnable: true,
      resizable: true,
    }),
  };
  /** Which shell menus are shown and where Help points. */
  @Nested(MenusConfig) menus = new MenusConfig();
  /** Whether the tray icon shows and what it does. */
  @Nested(TrayConfig) tray = new TrayConfig();
  /** The custom scheme and the route a deep link opens. */
  @Nested(DeepLinksConfig) deepLinks = new DeepLinksConfig();
  /** How and when updates are checked and installed. */
  @Nested(UpdatesConfig) updates = new UpdatesConfig();
  /** What the renderer may ask main to grant. */
  @Nested(PermissionsConfig) permissions = new PermissionsConfig();
  /** Knobs that only tighten the hardening baseline. */
  @Nested(HardeningConfig) hardening = new HardeningConfig();
  /** How electron-builder packages each platform. */
  @Nested(PackagingConfig) packaging = new PackagingConfig();
  /** Launch-at-login default; the user toggles it. @defaultValue false */
  @Bool() launchAtLoginDefault = false;
  /** Minidumps through the reporter port with the DSN from env. @defaultValue true */
  @Bool() crashReporter = true;
  /** Where the offline queue lives on desktop. @defaultValue OfflineStore.NodeSqlite */
  @OneOf(OfflineStore) offlineStore = OfflineStore.NodeSqlite;
}
