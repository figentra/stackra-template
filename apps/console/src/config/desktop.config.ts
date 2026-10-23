/**
 * Stackra file contract:
 * Purpose: the console's override of @stackra/platform's desktop configuration, read by the
 *          Electron main process while the app runs: desktop mode, windows, named overlays (each
 *          with its global shortcut), the shell's menu switches and roles, tray, deep links,
 *          auto-update behaviour, the devices the console uses with the reason for each, renderer
 *          permissions and the tighten-only hardening knobs.
 * Boundary: an override keeps the base's name and imports the base as `BaseDesktopConfig`; it sets
 *           `override` field defaults only and inherits the base's key (`platform.desktop`); a
 *           nested object is replaced whole, so each one spreads the base first and restates its
 *           type. A second override of the same base fails gen. `devices` is the one source of the
 *           macOS entitlements and usage strings: gen derives `entitlements.mac.plist` and
 *           electron-builder's `mac.extendInfo` from it, with each reason taken from
 *           `devices::<device>.reason` in every locale. Packaging (bundle id, installers) is read
 *           by electron-builder only, so it is stackra.config.ts `electron`. No identity, password,
 *           certificate, feed domain or origin list: signing switches and the feed path are
 *           `runway.yaml` `release.desktop`, the feed URL is derived by gen, and `connect-src` is
 *           csp.config.ts. The hardening baseline (context isolation, sandbox, fuses, CSP from
 *           main; ADR 0251) applies regardless. `titleBarStyle`, `standardRoles`, `allow` and
 *           `devices` in `permissions` are Electron's own values.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14 and 19; as amended by programming model v3.1,
 *                     AGENTS.md: the Base alias), ADR 0295 (decision 4), ADR 0249, ADR 0251, ADR
 *                     0253, ADR 0254, ADR 0181, ADR 0281
 */
import { Duration } from "@stackra/contracts";
import {
  DesktopConfig as BaseDesktopConfig,
  DesktopMode,
  InstallMoment,
  OverlayAnchor,
  OverlayStyle,
  TrayClickAction,
  WindowKind,
} from "@stackra/platform";
import { OfflineStore } from "@stackra/storage";
import { I18n } from "#stackra/i18n";

/**
 * The Electron desktop target: mode, windows, overlays, menus, tray, deep links, auto-update and
 * permissions.
 */
export class DesktopConfig extends BaseDesktopConfig {
  /** Dock app, menu-bar app or both (ADR 0281 d3). */
  override mode: DesktopMode = DesktopMode.Hybrid;

  /** One window per key; `main` is required and opens at launch. */
  override windows: BaseDesktopConfig["windows"] = {
    main: {
      route: "/",
      width: 1280,
      height: 800,
      minWidth: 960,
      minHeight: 640,
      resizable: true,
      persistBounds: true,
      titleBarStyle: "hiddenInset",
      kind: WindowKind.Normal,
      openOnLaunch: true,
    },
  };

  /**
   * Named overlays (ADR 0281 d4), each opened by its shortcut, the tray menu or an in-app button:
   * `quick` is a launcher bar centred on the active display that takes a quick order; Esc or blur
   * closes it, and the same route works in the main window.
   */
  override overlays: BaseDesktopConfig["overlays"] = {
    quick: {
      style: OverlayStyle.Launcher,
      route: "/quick-order",
      shortcut: "CommandOrControl+Shift+Space",
      userConfigurable: true,
      anchor: OverlayAnchor.ScreenCenter,
      alwaysOnTop: true,
      hideOnBlur: true,
      pinnable: false,
      resizable: false,
      vibrancy: true,
      displays: "active",
    },
  };

  /**
   * The shell's menus: the menu classes give the items; the Electron roles are placed by the shell
   * in their platform's usual menus (the macOS app menu, File, Edit, View, Window, the tray's Quit
   * and the context menu's edit entries), and the context menu adds spelling suggestions and the
   * items the element under the pointer contributed.
   */
  override menus: BaseDesktopConfig["menus"] = {
    ...this.menus,
    applicationMenu: true,
    contextMenu: true,
    standardRoles: [
      "appMenu",
      "close",
      "editMenu",
      "undo",
      "redo",
      "cut",
      "copy",
      "paste",
      "selectAll",
      "togglefullscreen",
      "resetZoom",
      "zoomIn",
      "zoomOut",
      "windowMenu",
      "quit",
    ],
    docsUrl: "https://docs.acme.example/console",
  };

  /**
   * The tray icon: shown, a click toggles the main window, the unread count is mirrored, and its
   * menu opens with a "Show console" item (`menus::tray.show`); keeping the app alive after the
   * last window closes is the user's opt-in (ADR 0254).
   */
  override tray: BaseDesktopConfig["tray"] = {
    ...this.tray,
    enabled: true,
    keepAliveDefault: false,
    onClick: TrayClickAction.ToggleMain,
    badge: true,
    showItem: true,
  };

  /**
   * Deep links: the custom scheme is registered as the default handler at install; a link opens the
   * `/open` route (`OpenRoute`), which resolves it to an in-app path or refuses it.
   */
  override deepLinks: BaseDesktopConfig["deepLinks"] = {
    ...this.deepLinks,
    scheme: "acme-console",
    claimHttpsOrigin: false,
    route: "/open?url=%s",
  };

  /**
   * Auto-update: electron-updater channels (`latest` is stable, ADR 0254 d3), checked every four
   * hours, installed on quit, with a 20 % staged rollout written to the feed (ADR 0181 d3); the
   * active channel per environment is runway's.
   */
  override updates: BaseDesktopConfig["updates"] = {
    ...this.updates,
    enabled: true,
    channels: ["beta", "latest"],
    checkEvery: Duration.hours(4),
    installOn: InstallMoment.Quit,
    stagingPercentage: 20,
    userSelectableChannel: true,
    differential: true,
  };

  /**
   * The point-of-sale devices the console uses, each with the reason the operating system shows
   * when it asks the user. Gen writes the matching hardened-runtime entitlements (camera
   * `device.camera`, microphone `device.audio-input`, USB `device.usb`, Bluetooth
   * `device.bluetooth`; serial needs none outside the App Sandbox) and the macOS usage strings
   * (`NSCameraUsageDescription`, `NSMicrophoneUsageDescription`,
   * `NSBluetoothAlwaysUsageDescription`) from this list.
   */
  override devices: BaseDesktopConfig["devices"] = {
    camera: { reason: I18n.devices.camera.reason },
    microphone: { reason: I18n.devices.microphone.reason },
    usb: { reason: I18n.devices.usb.reason },
    bluetooth: { reason: I18n.devices.bluetooth.reason },
    serial: { reason: I18n.devices.serial.reason },
  };

  /**
   * What main grants the renderer: `allow` answers Electron's permission requests (`media` is the
   * camera and microphone above), `devices` answers its device chooser and device permission
   * handlers for the USB, HID, serial and Bluetooth peripherals; anything else is refused. The
   * renderer may navigate only within the packaged bundle (`app://bundle`); everything else opens
   * in the system browser.
   */
  override permissions: BaseDesktopConfig["permissions"] = {
    ...this.permissions,
    allow: ["notifications", "clipboard-read", "fullscreen", "media"],
    mediaTypes: ["video", "audio"],
    devices: ["usb", "hid", "serial", "bluetooth"],
    allowedNavigationOrigins: ["app://bundle"],
  };

  /** Tighten-only knobs (ADR 0251 d3): no devtools in production builds, no certificate pins. */
  override hardening: BaseDesktopConfig["hardening"] = {
    ...this.hardening,
    disableDevToolsInProduction: true,
    pinnedSpki: [],
  };

  /** Launch-at-login default; the user toggles it. */
  override launchAtLoginDefault = false;

  /** Minidumps through the reporter port with the DSN from env. */
  override crashReporter = true;

  /**
   * Where the persisted query cache and the offline queue live on desktop: the same encrypted
   * IndexedDB persister as web and PWA, with its key held by Electron `safeStorage`.
   */
  override offlineStore: OfflineStore = OfflineStore.EncryptedIndexedDb;
}
