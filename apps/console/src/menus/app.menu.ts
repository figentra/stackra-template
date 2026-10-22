/**
 * Stackra file contract:
 * Purpose: the application menu (desktop menu bar, PWA app menu): sections of standard roles,
 *          commands, actions and routes; labels are i18n keys translated in main with the locale
 *          the renderer reports.
 * Boundary: a builder, because menus are deep and repeated. Items reference command classes,
 *           generated action descriptors and route classes; a removed one is a type error.
 *           `targets` prunes the menu per build; an item runs through the kbd module, never a
 *           handler here. Role names are Electron's own values.
 * Runtime: isomorphic
 * Governing contract: ADR 0058 (Electron), ADR 0245
 */
import { Target } from "@stackra/contracts";
import { Menu, type MenuBuilder, type MenuContext } from "@stackra/navigation";
import { Commerce } from "#stackra/clients";
import { Flags } from "#stackra/flags";
import { I18n } from "#stackra/i18n";
import { CycleThemeCommand } from "#src/commands/cycle-theme.command";
import { OpenPaletteCommand } from "#src/commands/open-palette.command";
import { OpenPendingChangesCommand } from "#src/commands/open-pending-changes.command";
import { ToggleSidebarCommand } from "#src/commands/toggle-sidebar.command";
import { DesktopConfig } from "#src/config/desktop.config";
import { Routes } from "#stackra/routes";

/** Application menu for the desktop menu bar and PWA: standard roles, commands and actions. */
@Menu({ targets: [Target.Desktop, Target.Pwa] })
export class AppMenu {
  /**
   * macOS gets the app menu first; Windows and Linux get File. The navigation section is generated.
   */
  items(m: MenuBuilder, ctx: MenuContext) {
    return [
      m.role("appMenu"),
      m.section(I18n.console.menu.file, [
        m.action(Commerce.actions.CreateOrder, {
          shortcut: "mod+n",
          flag: Flags.orders.quick_order,
        }),
        m.route(Routes.quick_order, { shortcut: "mod+shift+o" }),
        m.separator(),
        m.role("close"),
      ]),
      m.role("editMenu"),
      m.section(I18n.console.menu.view, [
        m.command(ToggleSidebarCommand),
        m.command(CycleThemeCommand),
        m.separator(),
        m.role("togglefullscreen"),
        m.role("resetZoom"),
        m.role("zoomIn"),
        m.role("zoomOut"),
      ]),
      m.section(I18n.console.menu.go, [m.command(OpenPaletteCommand), m.navigation()]),
      m.role("windowMenu"),
      m.section(I18n.console.menu.help, [
        m.link(I18n.console.menu.docs, ctx.config(DesktopConfig).menus.docsUrl),
        m.command(OpenPendingChangesCommand),
      ]),
    ];
  }
}
