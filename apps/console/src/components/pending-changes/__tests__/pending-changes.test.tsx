/**
 * Stackra file contract:
 * Purpose: a 409 conflict offers only the strategies the action declared, and resolving it leaves
 *          the queue clean.
 * Boundary: unit tier, jsdom; the queue fake replays against the committed offline-policy sample.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0059 decision 3, ADR 0252
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/react";
import { PendingChanges } from "#src/components/pending-changes";

/** Guards offline conflict handling, where a wrong choice can lose staff work. */
describe(PendingChanges, () => {
  /** Only strategies the action declared may be offered, and resolving must clear the conflict. */
  it("offers the declared strategies for a conflict and resolves it", async () => {
    const { queue } = render(<PendingChanges />, {
      locale: "en",
      conflicts: [
        {
          id: "q_1",
          actionKey: "orders.order.create",
          labelKey: "orders::quick_order.title",
          reason: "version_conflict",
        },
      ],
    });
    await userEvent.click(screen.getByRole("button", { name: "Pending changes: 1" }));
    expect(screen.getByRole("button", { name: "Keep server version" })).toBeTruthy();
    // create declares server_wins | manual only
    expect(screen.queryByRole("button", { name: "Retry on latest" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Keep server version" }));
    expect(queue.conflicts).toEqual([]);
  });
});
