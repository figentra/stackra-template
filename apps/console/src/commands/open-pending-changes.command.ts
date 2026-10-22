/**
 * Stackra file contract:
 * Purpose: `console.queue.open`: jumps to the pending-changes section of the settings page; the
 *          tray menu uses it too.
 * Boundary: a `@Command` class navigating by route key (`Routes.settings`), so a removed route is a
 *           type error.
 * Runtime: browser
 * Governing contract: ADR 0245, ADR 0252
 */
import { Command, type CommandContext } from "@stackra/kbd";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** Command `console.queue.open`: jumps to the pending-changes section of settings. */
@Command({
  key: "queue.open",
  label: I18n.console.commands.pending_changes,
  group: I18n.console.commands.group_app,
})
export class OpenPendingChangesCommand {
  /** Navigates to the settings route with the section's anchor. */
  run(ctx: CommandContext) {
    ctx.navigate(Routes.settings, { hash: "pending-changes" });
  }
}
