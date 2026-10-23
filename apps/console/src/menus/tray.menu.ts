/**
 * Stackra file contract:
 * Purpose: the tray icon's menu (desktop only): open pending changes. Keep-alive, the icon, the
 *          "Show console" item and the Quit role are desktop.config.ts `tray` and
 *          `menus.standardRoles`, placed by the shell around these items.
 * Boundary: a menu of kind `Tray`, using only the closed item verbs; items name Shortcut classes.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0295 (decision 12), ADR 0058 (Electron),
 *                     ADR 0254 (opt-in tray keep-alive)
 */
import { Menu, MenuKind, type MenuBuilder } from "@stackra/navigation";
import { OpenPendingChangesShortcut } from "#src/shortcuts/open-pending-changes.shortcut";

/** Tray icon menu of the desktop target: the console's one tray entry. */
export class TrayMenu extends Menu({ kind: MenuKind.Tray }) {
  /** The queue is what a user with a hidden window most needs to reach. */
  items(m: MenuBuilder) {
    return [m.shortcut(OpenPendingChangesShortcut)];
  }
}
