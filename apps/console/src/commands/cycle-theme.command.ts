/**
 * Stackra file contract:
 * Purpose: `console.theme.cycle`: moves to the next colour scheme through the theming package.
 * Boundary: a `@Command` class; the order is the theming config's `schemes`, so the toggle, the
 *           shortcut and the desktop menu all cycle the same list.
 * Runtime: browser
 * Governing contract: ADR 0080 d4, ADR 0245
 */
import { Command, type CommandContext } from "@stackra/kbd";
import { I18n } from "#stackra/i18n";
import { ThemingConfig } from "#src/config/theming.config";

/** Command `console.theme.cycle`: light, dark, system, then light again. */
@Command({
  key: "theme.cycle",
  label: I18n.console.commands.theme,
  shortcut: "mod+shift+l",
  group: I18n.console.commands.group_app,
})
export class CycleThemeCommand {
  /** The scheme after the current one in the configured order. */
  run(ctx: CommandContext) {
    const schemes = ctx.config(ThemingConfig).schemes;
    const next = schemes[(schemes.indexOf(ctx.theme.scheme) + 1) % schemes.length];
    ctx.theme.setScheme(next);
  }
}
