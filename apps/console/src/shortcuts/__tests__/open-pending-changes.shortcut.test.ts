/**
 * Stackra file contract:
 * Purpose: proves the pending-changes shortcut lands on the settings page's queue section.
 * Boundary: unit tier; `runShortcut` runs the class against the testing router.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0252, ADR 0007
 */
import { runShortcut } from "@stackra/shortcuts/testing";
import { describe, expect, it } from "@stackra/testing";
import { OpenPendingChangesShortcut } from "#src/shortcuts/open-pending-changes.shortcut";

/** Guards the tray and palette entry to the offline queue. */
describe(OpenPendingChangesShortcut, () => {
  /** The queue lives in a section of settings, reached by its anchor. */
  it("navigates to the pending-changes section of settings", async () => {
    const { router } = await runShortcut(OpenPendingChangesShortcut);
    expect(router.state.location.pathname).toBe("/settings");
    expect(router.state.location.hash).toBe("#pending-changes");
  });
});
