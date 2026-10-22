/**
 * Stackra file contract:
 * Purpose: the tray icon's menu (desktop only): show the window, open pending changes, quit.
 *          Keep-alive and the icon are `desktop.config.ts` `tray`; this is only the item list.
 * Boundary: a `@Menu` of kind `Tray`; items reference commands by class. Role names are Electron's
 *           own values.
 * Runtime: node
 * Governing contract: ADR 0058 (Electron), ADR 0254 (opt-in tray keep-alive)
 */
import { Target } from "@stackra/contracts";
import { Menu, MenuKind, type MenuBuilder } from "@stackra/navigation";
import { I18n } from "#stackra/i18n";
import { OpenPendingChangesCommand } from "#src/commands/open-pending-changes.command";

/** Tray icon menu of the desktop target: show window, open pending changes, quit. */
@Menu({ kind: MenuKind.Tray, targets: [Target.Desktop] })
export class TrayMenu {
  /** Show first: the tray is how a user gets a hidden window back. */
  items(m: MenuBuilder) {
    return [
      m.showWindow(I18n.console.tray.show),
      m.command(OpenPendingChangesCommand),
      m.separator(),
      m.role("quit"),
    ];
  }
}
