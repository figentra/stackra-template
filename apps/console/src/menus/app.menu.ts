/**
 * Stackra file contract:
 * Purpose: the desktop menu bar: groups of shortcuts, actions, routes and links; labels are i18n
 *          keys (`menus::app.*`) translated in main with the locale the renderer reports.
 * Boundary: a builder, because menus are deep and repeated, using only the closed item verbs
 *           (route, link, action, shortcut, group, separator, navigation) with no CSS. Items name
 *           Shortcut classes, generated client classes and route keys, so a removed one is a type
 *           error. Electron's own role items (the macOS app menu, Close, Edit, the zoom and
 *           full-screen items, Window) are not item verbs: the shell places them from
 *           desktop.config.ts `menus.standardRoles`. Desktop only by its kind: a PWA has no OS menu
 *           bar (ADR 0281 d2), and the web and PWA reach the same items through the palette. No
 *           accelerator is one a browser reserves (`mod+n`, `mod+t`, `mod+w`), because the palette
 *           shows the same keys in a tab. An item runs through the shortcuts module, never a
 *           handler here.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 14, 16 and 17), ADR 0295 (decision 12), ADR 0058
 *                     (Electron), ADR 0245, ADR 0281 d2
 */
import { Menu, MenuKind, type MenuBuilder } from "@stackra/navigation";
import type { DesktopConfig } from "@stackra/platform";
import { CreateOrderAction } from "#stackra/clients/commerce";
import { Flags } from "#stackra/flags";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";
import { CycleThemeShortcut } from "#src/shortcuts/cycle-theme.shortcut";
import { OpenPaletteShortcut } from "#src/shortcuts/open-palette.shortcut";
import { OpenPendingChangesShortcut } from "#src/shortcuts/open-pending-changes.shortcut";
import { ToggleSidebarShortcut } from "#src/shortcuts/toggle-sidebar.shortcut";

/** The desktop menu bar: File, View, Go and Help; the Go navigation is generated. */
export class AppMenu extends Menu({ kind: MenuKind.App }) {
  /**
   * @param desktop - the console's desktop config; its `menus.docsUrl` is the Help link.
   */
  constructor(private readonly desktop: DesktopConfig) {
    super();
  }

  /** File places an order; View, Go and Help hold the console's shortcuts. */
  items(m: MenuBuilder) {
    return [
      m.group(I18n.menus.app.file, [
        m.action(CreateOrderAction, { flag: Flags.orders.quick_order }),
        m.route(Routes.quick_order, { shortcut: "mod+shift+o" }),
      ]),
      m.group(I18n.menus.app.view, [
        m.shortcut(ToggleSidebarShortcut),
        m.shortcut(CycleThemeShortcut),
      ]),
      m.group(I18n.menus.app.go, [m.shortcut(OpenPaletteShortcut), m.navigation()]),
      m.group(I18n.menus.app.help, [
        m.link(I18n.menus.app.docs, this.desktop.menus.docsUrl),
        m.separator(),
        m.shortcut(OpenPendingChangesShortcut),
      ]),
    ];
  }
}
