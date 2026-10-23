/**
 * Stackra file contract:
 * Purpose: `console.sign_out`: signs out through the BFF; the offline queue is locked, not dropped.
 * Boundary: a palette entry with no key binding; the key and the label
 *           (`console::shortcuts.sign_out.label`) are derived. A full navigation to the BFF's
 *           logout, which clears the HttpOnly cookie and redirects to ZITADEL's end session; the
 *           console never clears a token itself.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14, 16 and 23), ADR 0241, ADR 0206 d8
 */
import { Shortcut, type ShortcutContext } from "@stackra/shortcuts";
import { I18n } from "#stackra/i18n";

/** Signs out through the BFF and locks the offline queue. */
export class SignOutShortcut extends Shortcut({
  group: I18n.console.palette.group_account,
}) {
  /** Leaves the app for the BFF's logout URL. */
  run(ctx: ShortcutContext): void {
    ctx.navigate(ctx.identity.logoutUrl(), { external: true });
  }
}
