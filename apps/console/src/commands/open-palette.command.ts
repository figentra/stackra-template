/**
 * Stackra file contract:
 * Purpose: `console.palette.open`: opens the command palette. The same shortcut works in the
 *          renderer and as the macOS menu item (AppMenu references this class).
 * Boundary: options are the declaration (key, label, shortcut, group); `run` is behaviour.
 *           Navigation commands and action intents are generated from the manifests, never written
 *           here.
 * Runtime: browser
 * Governing contract: ADR 0245 (intents)
 */
import { Command, type CommandContext } from "@stackra/kbd";
import { I18n } from "#stackra/i18n";
import { CommandPaletteStore } from "#src/stores/command-palette.store";

/** Command `console.palette.open`: opens the command palette from a renderer or global shortcut. */
@Command({
  key: "palette.open",
  label: I18n.console.commands.palette,
  shortcut: "mod+k",
  group: I18n.console.commands.group_app,
})
export class OpenPaletteCommand {
  /** Opens the palette store; the shell's dialog follows it. */
  run(ctx: CommandContext) {
    ctx.store(CommandPaletteStore).open();
  }
}
