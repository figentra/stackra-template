/**
 * Stackra file contract:
 * Purpose: proves the inbox shows a principal only their own entries and honours `unreadOnly`, and
 *          that `unread` counts the whole inbox, not the page.
 * Boundary: unit tier through the pipeline, memory drivers, rows from the factory.
 * Runtime: node
 * Governing contract: ADR 0098, cursor pagination in the HTTP conventions, ADR 0022
 */
import { run } from "@stackra/actions/testing";
import { createTestingModule } from "@stackra/container/testing";
import { actors } from "@stackra/iam/testing";
import { describe, expect, it } from "@stackra/testing";
import { NotificationsModule } from "#src/notifications.module";
import { InboxMessageFactory } from "#modules/messages/database/factories/inbox-message.factory";
import { ListInboxMessagesQuery } from "#modules/messages/queries/list-inbox-messages.query";

/** Guards the inbox, where one customer must never see another's entries. */
describe(ListInboxMessagesQuery, () => {
  /** Two entries of mine (one read), one of someone else: all of mine, then only the unread one. */
  it("lists only the actor's entries and filters unread", async () => {
    await createTestingModule(NotificationsModule).useDrivers("memory").compile();
    const unread = await InboxMessageFactory.new().create();
    await InboxMessageFactory.new().read().create({ principalId: unread.principalId });
    await InboxMessageFactory.new().create();
    const me = actors.customer(unread.principalId);

    const all = await run(ListInboxMessagesQuery, {}, { as: me });
    const fresh = await run(ListInboxMessagesQuery, { unreadOnly: true }, { as: me });

    expect(all.output.items).toHaveLength(2);
    expect(fresh.output.items.map((entry) => entry.id)).toEqual([unread.id]);
    expect(all.output.unread).toBe(1);
  });

  /** A one-entry page still reports every unread entry the actor has. */
  it("counts unread across the whole inbox, not the page", async () => {
    await createTestingModule(NotificationsModule).useDrivers("memory").compile();
    const first = await InboxMessageFactory.new().create();
    await InboxMessageFactory.new().count(2).create({ principalId: first.principalId });

    const page = await run(
      ListInboxMessagesQuery,
      { limit: 1 },
      { as: actors.customer(first.principalId) },
    );

    expect(page.output.items).toHaveLength(1);
    expect(page.output.unread).toBe(3);
  });
});
