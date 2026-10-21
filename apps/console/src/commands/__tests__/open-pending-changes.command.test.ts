/**
 * Stackra file contract:
 * Purpose: proves the pending-changes command lands on the settings route's pending-changes anchor.
 * Boundary: unit tier; `runCommand` runs the class against the memory router.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0252, ADR 0007
 */
import { runCommand } from "@stackra/kbd/testing";
import { describe, expect, it } from "@stackra/testing";
import { OpenPendingChangesCommand } from "#src/commands/open-pending-changes.command";

/** Guards the tray and palette entry to the offline queue. */
describe(OpenPendingChangesCommand, () => {
  /** The queue lives in a section of settings, reached by its anchor. */
  it("navigates to the pending-changes section of settings", async () => {
    const { router } = await runCommand(OpenPendingChangesCommand);
    expect(router.state.location.pathname).toBe("/settings");
    expect(router.state.location.hash).toBe("#pending-changes");
  });
});
