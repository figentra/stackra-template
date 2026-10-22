/**
 * Stackra file contract:
 * Purpose: proves the open-palette command opens the palette store.
 * Boundary: unit tier; `runCommand` runs the class against the testing stores.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0245, ADR 0007
 */
import { runCommand } from "@stackra/kbd/testing";
import { describe, expect, it } from "@stackra/testing";
import { OpenPaletteCommand } from "#src/commands/open-palette.command";
import { CommandPaletteStore } from "#src/stores/command-palette.store";

/** Guards the palette shortcut. */
describe(OpenPaletteCommand, () => {
  /** The shortcut must open the dialog. */
  it("opens the palette", async () => {
    const { stores } = await runCommand(OpenPaletteCommand);
    expect(stores.get(CommandPaletteStore).state.isOpen).toBe(true);
  });
});
