/**
 * Stackra file contract:
 * Purpose: `console.open_pending_changes`: jumps to the pending-changes section of the settings
 *          page; the tray menu uses it too.
 * Boundary: a palette entry with no key binding, so `keys` is not written; the key and the label
 *           (`console::shortcuts.open_pending_changes.label`) are derived. It navigates by route
 *           key (`Routes.settings`), so a removed route is a type error.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14, 16 and 23), ADR 0245, ADR 0252
 */
import { Shortcut, type ShortcutContext } from "@stackra/shortcuts";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** Jumps to the pending-changes section of settings. */
export class OpenPendingChangesShortcut extends Shortcut({
  group: I18n.console.palette.group_app,
}) {
  /** Navigates to the settings route with the section's anchor. */
  run(ctx: ShortcutContext): void {
    ctx.navigate(Routes.settings, { hash: "pending-changes" });
  }
}
