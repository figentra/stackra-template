/**
 * Stackra file contract:
 * Purpose: `messages.message.deliver@1`: the job that hands one message to the mail transport, the
 *          template's example of a failed job and its dead letter (ADR 0148).
 * Boundary: a job is an action run from a queue; its `job` option names the queue, five retries
 *           with exponential backoff, the dead letter runway provisions and the method the queue
 *           calls once the last retry failed. The only actor is the system (the job adds
 *           `ActorKind.Job` itself), so it gets no public endpoint. The key's verb is not a
 *           permission verb, so the permission is named (`MessagePermissions.send`). After the dead
 *           letter, `markFailed` records it on the row and the failed-jobs resource @stackra/queue
 *           contributes shows it in the console for a redrive.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 16, 18 and 21), ADR 0098, ADR 0148 (queues), ADR 0130
 *                     (failed job and dead letter)
 */
import { Action, type ActionContext } from "@stackra/actions";
import { ActorKind, type PublicId } from "@stackra/contracts";
import { Backoff } from "@stackra/queue";
import { Schema } from "@stackra/validation";
import { Queues } from "#stackra/queues";
import { MessagePermissions } from "#modules/messages/access/message.permissions";
import type { MessageStatus } from "#modules/messages/enums/message-status.enum";
import type { DeliverMessageInput } from "#modules/messages/schemas/deliver-message-input.schema";
import type { MessageService } from "#modules/messages/services/message.service";

/** The result of one delivery attempt that succeeded. */
export class DeliverMessageOutput extends Schema {
  /** The message's public id. */
  messageId!: PublicId<"msg">;

  /** The status it ended in; always `sent` on a successful run. */
  status!: MessageStatus;
}

/** Dispatched by SendMessageAction after commit; idempotent, so a redrive never mails twice. */
export class DeliverMessageAction extends Action({
  key: "message.deliver",
  permission: MessagePermissions.send,
  actors: [ActorKind.System],
  job: {
    queue: Queues.Delivery,
    retries: 5,
    backoff: Backoff.Exponential,
    deadLetter: true,
    onDeadLetter: "markFailed",
  },
}) {
  /** @param messages - delivers through the transport and marks failures. */
  constructor(private readonly messages: MessageService) {
    super();
  }

  /**
   * Sends through the transport; the pipeline clock stamps `sentAt`.
   * @throws MailProviderUnavailableError (retryable), so the queue retries, then dead-letters.
   */
  async handle(input: DeliverMessageInput, ctx: ActionContext): Promise<DeliverMessageOutput> {
    const message = await this.messages.deliver(input, ctx.now());
    return DeliverMessageOutput.create({ messageId: message.id, status: message.status });
  }

  /** Called once by the queue when the last retry failed; the row then reads `failed`. */
  async markFailed(input: DeliverMessageInput): Promise<void> {
    await this.messages.markFailed(input.messageId);
  }
}
