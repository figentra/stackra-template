/**
 * Stackra file contract:
 * Purpose: `messages.inbox_message.mark_read@1`: mark one of the actor's own inbox entries read.
 * Boundary: an idempotent state change (PUT): marking a read entry again keeps its first `readAt`.
 *           Narrowed to the actor in the lookup itself, so another principal's entry is a not-found
 *           refusal, never a permission one. The key's verb is not a permission verb, so the
 *           permission is named (`InboxMessagePermissions.update`); the path is kept as
 *           `PUT /inbox-messages/:inboxMessageId/read` instead of the derived one. It reads through
 *           the generic InboxMessage repository: there are no named reads to fold into a service.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 3, 16 and 21), ADR 0098, ADR 0140, PUT for idempotent
 *                     state changes in the HTTP conventions
 */
import { Action, type ActionContext } from "@stackra/actions";
import { ActorKind, HttpMethod, type PublicId } from "@stackra/contracts";
import type { Repository } from "@stackra/database";
import { Schema } from "@stackra/validation";
import { InboxMessagePermissions } from "#modules/messages/access/inbox-message.permissions";
import { InboxMessageNotFoundError } from "#modules/messages/errors/inbox-message-not-found.error";
import type { InboxMessage } from "#modules/messages/models/inbox-message.model";
import { InboxMessageView } from "#modules/messages/schemas/inbox-message-view.schema";

/** The entry to mark read, taken from the path; the principal is the actor, never an input. */
export class MarkInboxMessageReadInput extends Schema {
  /** The entry's public id. */
  inboxMessageId!: PublicId<"inm">;
}

/** Behind the inbox's "Mark read" button. */
export class MarkInboxMessageReadAction extends Action({
  key: "inbox_message.mark_read",
  permission: InboxMessagePermissions.update,
  actors: [ActorKind.User],
  endpoint: {
    method: HttpMethod.Put,
    path: "/inbox-messages/:inboxMessageId/read",
  },
}) {
  /** @param inboxMessages - the generic repository of InboxMessage. */
  constructor(private readonly inboxMessages: Repository<InboxMessage>) {
    super();
  }

  /**
   * Stamps `readAt` with the pipeline clock once; returns the entry as the inbox renders it.
   * @throws InboxMessageNotFoundError when the actor has no entry with that id.
   */
  async handle(input: MarkInboxMessageReadInput, ctx: ActionContext): Promise<InboxMessageView> {
    const { inboxMessageId } = input;
    const entry = await this.inboxMessages.findOne({
      id: inboxMessageId,
      principalId: ctx.actor.id,
    });
    if (!entry) throw InboxMessageNotFoundError.create({ inboxMessageId });
    entry.readAt ??= ctx.now();
    return InboxMessageView.create({
      id: entry.id,
      kind: entry.kind,
      data: entry.data,
      createdAt: entry.createdAt,
      readAt: entry.readAt,
    });
  }
}
