/**
 * Stackra file contract:
 * Purpose: `console.cycle_theme`: moves to the next colour scheme through the theming package.
 * Boundary: a Shortcut class; the key and the label (`console::shortcuts.cycle_theme.label`) are
 *           derived. The order is the theming config's `schemes`, injected by type, so the toggle,
 *           the key and the desktop menu all cycle the same list.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14, 16, 17 and 23), ADR 0080 d4, ADR 0245
 */
import { Shortcut, type ShortcutContext } from "@stackra/shortcuts";
import type { ThemingConfig } from "@stackra/theming";
import { I18n } from "#stackra/i18n";

/** Light, dark, system, then light again; bound to `mod+shift+l`. */
export class CycleThemeShortcut extends Shortcut({
  keys: "mod+shift+l",
  group: I18n.console.palette.group_app,
}) {
  /** @param theming - the console's theming config; its `schemes` is the cycle order. */
  constructor(private readonly theming: ThemingConfig) {
    super();
  }

  /** The scheme after the current one in the configured order. */
  run(ctx: ShortcutContext): void {
    const { schemes } = this.theming;
    const next = schemes[(schemes.indexOf(ctx.theme.scheme) + 1) % schemes.length];
    if (next) ctx.theme.setScheme(next);
  }
}
