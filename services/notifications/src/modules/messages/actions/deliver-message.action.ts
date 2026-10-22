/**
 * Stackra file contract:
 * Purpose: `messages.message.deliver`: the job that hands one message to the mail transport, the
 *          template's example of a failed job and its dead letter (ADR 0148).
 * Boundary: a job only (`@AsJob`, which adds `ActorKind.Job`); no endpoint. A retryable provider
 *           failure is retried five times with exponential backoff; after the last attempt the job
 *           goes to the dead-letter queue runway provisions, `markFailed` records it on the row,
 *           and the failed-jobs resource @stackra/queue contributes shows it in the console panel
 *           for a redrive.
 * Runtime: node
 * Governing contract: ADR 0098, ADR 0148 (queues), ADR 0130 (failed job + dead letter)
 */
import { Action, type ActionContext, AsJob } from "@stackra/actions";
import { ActorKind } from "@stackra/contracts";
import { Backoff } from "@stackra/queue";
import { Queues } from "#stackra/queues";
import { MessageService } from "#modules/messages/services/message.service";
import { MessagePermissions } from "#modules/messages/permissions/message.permission";
import { DeliverMessageInput } from "#modules/messages/schemas/deliver-message-input.schema";
import { DeliverMessageOutput } from "#modules/messages/schemas/deliver-message-output.schema";

/** Dispatched by SendMessageAction after commit; idempotent, so a redrive never mails twice. */
@Action({
  key: "message.deliver",
  input: DeliverMessageInput,
  output: DeliverMessageOutput,
  permission: MessagePermissions.send,
  actors: [ActorKind.System],
})
@AsJob({
  queue: Queues.Delivery,
  retries: 5,
  backoff: Backoff.Exponential,
  deadLetter: true,
  onDeadLetter: "markFailed",
})
export class DeliverMessageAction {
  constructor(private readonly messages: MessageService) {}

  /**
   * Sends through the transport; the pipeline clock stamps `sentAt`.
   * @throws MailProviderUnavailableError (retryable) so the queue retries, then dead-letters.
   */
  async handle(input: DeliverMessageInput, ctx: ActionContext): Promise<DeliverMessageOutput> {
    const message = await this.messages.deliver(input, ctx.now());
    return { messageId: message.id, status: message.status };
  }

  /** Called once by the queue when the last retry failed; the row then reads `failed`. */
  async markFailed(input: DeliverMessageInput): Promise<void> {
    await this.messages.markFailed(input.messageId);
  }
}
