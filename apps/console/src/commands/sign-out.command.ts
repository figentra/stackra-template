/**
 * Stackra file contract:
 * Purpose: `console.session.logout`: signs out through the BFF; the offline queue is locked, not
 *          dropped.
 * Boundary: a full navigation to the BFF's logout, which clears the HttpOnly cookie and redirects
 *           to ZITADEL's end session; the console never clears a token itself.
 * Runtime: browser
 * Governing contract: ADR 0241, ADR 0206 d8
 */
import { Command, type CommandContext } from "@stackra/kbd";
import { I18n } from "#stackra/i18n";

/** Command `console.session.logout`: signs out through the BFF and locks the offline queue. */
@Command({
  key: "session.logout",
  label: I18n.console.commands.logout,
  group: I18n.console.commands.group_account,
})
export class SignOutCommand {
  /** Leaves the app for the BFF's logout URL. */
  run(ctx: CommandContext) {
    ctx.navigate(ctx.identity.logoutUrl(), { external: true });
  }
}
