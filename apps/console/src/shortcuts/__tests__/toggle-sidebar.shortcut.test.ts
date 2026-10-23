/**
 * Stackra file contract:
 * Purpose: proves the sidebar shortcut collapses an expanded sidebar.
 * Boundary: unit tier; `runShortcut` builds the class with the testing stores and runs it.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0079, ADR 0007
 */
import { runShortcut } from "@stackra/shortcuts/testing";
import { describe, expect, it } from "@stackra/testing";
import { ToggleSidebarShortcut } from "#src/shortcuts/toggle-sidebar.shortcut";
import { UiStore } from "#src/stores/ui.store";

/** Guards the sidebar shortcut that the menu and the rail share. */
describe(ToggleSidebarShortcut, () => {
  /** An expanded sidebar collapses. */
  it("collapses an expanded sidebar", async () => {
    const { stores } = await runShortcut(ToggleSidebarShortcut);
    expect(stores.get(UiStore).sidebarCollapsed).toBe(true);
  });
});
