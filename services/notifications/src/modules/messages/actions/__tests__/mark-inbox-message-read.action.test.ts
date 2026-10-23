/**
 * Stackra file contract:
 * Purpose: proves marking read stamps one's own entry once, and that another principal's entry is a
 *          not-found refusal.
 * Boundary: unit tier through the pipeline, memory drivers, rows from the factory, clock frozen.
 * Runtime: node
 * Governing contract: ADR 0098, ADR 0140, ADR 0022
 */
import { run } from "@stackra/actions/testing";
import { createTestingModule } from "@stackra/container/testing";
import { refusal } from "@stackra/errors/testing";
import { actors } from "@stackra/iam/testing";
import { describe, expect, freezeClock, it } from "@stackra/testing";
import { NotificationsModule } from "#stackra/module";
import { MarkInboxMessageReadAction } from "#modules/messages/actions/mark-inbox-message-read.action";
import { InboxMessageFactory } from "#modules/messages/database/factories/inbox-message.factory";
import { InboxMessageNotFoundError } from "#modules/messages/errors/inbox-message-not-found.error";
import { InboxMessage } from "#modules/messages/models/inbox-message.model";

/** Guards the inbox, where one customer must never touch another's entries. */
describe(MarkInboxMessageReadAction, () => {
  /** Twice on my unread entry: the first `readAt` stays (an idempotent PUT). */
  it("marks the actor's own entry read once", async () => {
    await createTestingModule(NotificationsModule).useDrivers("memory").compile();
    const entry = await InboxMessageFactory.new().create();
    const me = actors.customer(entry.principalId);

    freezeClock("2026-10-21T09:00:00Z");
    const first = await run(MarkInboxMessageReadAction, { inboxMessageId: entry.id }, { as: me });
    freezeClock("2026-10-21T10:00:00Z");
    const again = await run(MarkInboxMessageReadAction, { inboxMessageId: entry.id }, { as: me });

    expect(first.output.readAt).toEqual(new Date("2026-10-21T09:00:00Z"));
    expect(again.output.readAt).toEqual(first.output.readAt);
  });

  /** Someone else's entry is refused as not found, and stays unread. */
  it("refuses another principal's entry as not found", async () => {
    const app = await createTestingModule(NotificationsModule).useDrivers("memory").compile();
    const entry = await InboxMessageFactory.new().create();

    const result = await run(
      MarkInboxMessageReadAction,
      { inboxMessageId: entry.id },
      { as: actors.customer() },
    );

    expect(result).toRefuseWith(refusal(InboxMessageNotFoundError));
    const [row] = await app.repository(InboxMessage).find({ id: entry.id });
    expect(row?.readAt).toBeNull();
  });
});
