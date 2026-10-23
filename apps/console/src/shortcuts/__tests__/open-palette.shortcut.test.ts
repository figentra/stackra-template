/**
 * Stackra file contract:
 * Purpose: proves the palette shortcut opens the palette store.
 * Boundary: unit tier; `runShortcut` builds the class with the testing stores and runs it.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0245, ADR 0007
 */
import { runShortcut } from "@stackra/shortcuts/testing";
import { describe, expect, it } from "@stackra/testing";
import { OpenPaletteShortcut } from "#src/shortcuts/open-palette.shortcut";
import { PaletteStore } from "#src/stores/palette.store";

/** Guards the palette shortcut. */
describe(OpenPaletteShortcut, () => {
  /** The shortcut must open the dialog. */
  it("opens the palette", async () => {
    const { stores } = await runShortcut(OpenPaletteShortcut);
    expect(stores.get(PaletteStore).isOpen).toBe(true);
  });
});
