/**
 * Stackra file contract:
 * Purpose: proves the sidebar command flips the UI store's collapsed flag.
 * Boundary: unit tier; `runCommand` runs the class against the testing stores.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0079, ADR 0007
 */
import { runCommand } from "@stackra/kbd/testing";
import { describe, expect, it } from "@stackra/testing";
import { ToggleSidebarCommand } from "#src/commands/toggle-sidebar.command";
import { UiStore } from "#src/stores/ui.store";

/** Guards the sidebar shortcut that the menu and the rail share. */
describe(ToggleSidebarCommand, () => {
  /** An expanded sidebar collapses. */
  it("collapses an expanded sidebar", async () => {
    const { stores } = await runCommand(ToggleSidebarCommand);
    expect(stores.get(UiStore).state.sidebarCollapsed).toBe(true);
  });
});
