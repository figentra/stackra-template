/**
 * Stackra file contract:
 * Purpose: proves discarding a conflicting change asks first: "keep it" leaves the conflict, the
 *          confirm removes it; and an empty queue shows the empty state, in Arabic too.
 * Boundary: unit tier, jsdom; the queue fake replays against the committed offline-policy sample.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0252
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen, userEvent, within } from "@stackra/testing/react";
import { PendingChangesList } from "#src/components/pending-changes-list";

/** One conflict the server refused on replay. */
const CONFLICT = {
  id: "q_1",
  actionKey: "orders.order.create",
  labelKey: "orders::quick_order.title",
  reason: "version_conflict",
};

/** Guards the queue list, where a discarded change is gone for good. */
describe(PendingChangesList, () => {
  /** A local change is the only copy of the user's work, so discarding it must be confirmed. */
  it("asks before discarding and keeps the change on cancel", async () => {
    const { queue } = render(<PendingChangesList />, { locale: "en", conflicts: [CONFLICT] });
    await userEvent.click(screen.getByRole("button", { name: "Discard my change" }));
    expect(screen.getByRole("alertdialog", { name: "Discard this change?" })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Keep it" }));
    expect(queue.conflicts).toHaveLength(1);

    await userEvent.click(screen.getByRole("button", { name: "Discard my change" }));
    const dialog = screen.getByRole("alertdialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Discard my change" }));
    expect(queue.conflicts).toEqual([]);
  });

  /** Nothing waiting is a state worth saying, not a blank region. */
  it("shows the empty state in Arabic when nothing waits", () => {
    render(<PendingChangesList />, { locale: "ar" });
    expect(screen.getByText("لا شيء بانتظار المزامنة")).toBeTruthy();
  });
});
