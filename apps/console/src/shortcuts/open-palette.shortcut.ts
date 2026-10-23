/**
 * Stackra file contract:
 * Purpose: `console.open_palette`: opens the palette. The same key works in the renderer and as
 *          the macOS menu item (AppMenu references this class).
 * Boundary: the options are the declaration (keys, group); the key and the label
 *           (`console::shortcuts.open_palette.label`) are derived; `run` is behaviour. Navigation
 *           entries and action intents are generated from the manifests, never written here.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14, 16, 17 and 23), ADR 0245 (intents)
 */
import { Shortcut } from "@stackra/shortcuts";
import { I18n } from "#stackra/i18n";
import type { PaletteStore } from "#src/stores/palette.store";

/** Opens the palette from the renderer or the desktop menu; bound to `mod+k`. */
export class OpenPaletteShortcut extends Shortcut({
  keys: "mod+k",
  group: I18n.console.palette.group_app,
}) {
  /** @param palette - the palette's store; the shell's dialog follows it. */
  constructor(private readonly palette: PaletteStore) {
    super();
  }

  /** Opens the palette store. */
  run(): void {
    this.palette.open();
  }
}
