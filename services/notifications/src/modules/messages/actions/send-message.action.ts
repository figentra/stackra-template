/**
 * Stackra file contract:
 * Purpose: `messages.message.send@1`: the action other services queue (the `notifications` Notifier
 *          driver of @stackra/notifications calls `message.send.queue(input)`) and staff may call
 *          directly. One key, one pipeline, every reach (ADR 0260).
 * Boundary: `Idempotency.Derived`: with no Idempotency-Key the pipeline derives one from the input,
 *           which makes a redelivered queued call harmless. It only opens the dedup row and
 *           dispatches DeliverMessageAction after commit; the slow, failing part runs as a job with
 *           retries and a dead letter. The `Service` actor is how commerce's queued call arrives.
 *           The permission is derived (`MessagePermissions.send`, L1); the path is kept as
 *           `POST /messages` instead of the derived one.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 3, 16 and 21), ADR 0098, ADR 0136 (idempotency step),
 *                     ADR 0260 d4
 */
import { Action, type ActionContext, Idempotency } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import { DeliverMessageAction } from "#modules/messages/actions/deliver-message.action";
import { MessageStatus } from "#modules/messages/enums/message-status.enum";
import { DeliverMessageInput } from "#modules/messages/schemas/deliver-message-input.schema";
import type { SendMessageInput } from "#modules/messages/schemas/send-message-input.schema";
import { SendMessageOutput } from "#modules/messages/schemas/send-message-output.schema";
import type { MessageService } from "#modules/messages/services/message.service";

/** Accepts one message; at most 600 per minute per tenant. */
export class SendMessageAction extends Action({
  key: "message.send",
  actors: [ActorKind.Service, ActorKind.User],
  idempotency: Idempotency.Derived,
  rateLimit: {
    perMinute: 600,
    by: "tenant",
  },
  endpoint: {
    method: HttpMethod.Post,
    path: "/messages",
  },
}) {
  /**
   * @param messages - opens the dedup row.
   */
  constructor(private readonly messages: MessageService) {
    super();
  }

  /** `ctx.idempotencyKey` is the derived or supplied key; a sent message is not sent again. */
  async handle(input: SendMessageInput, ctx: ActionContext): Promise<SendMessageOutput> {
    const message = await this.messages.open(input, ctx.idempotencyKey);
    if (message.status !== MessageStatus.Sent) {
      const job = DeliverMessageInput.create({
        messageId: message.id,
        html: input.html,
        text: input.text,
      });
      ctx.afterCommit(() => ctx.dispatch(DeliverMessageAction, job));
    }
    return SendMessageOutput.create({ messageId: message.id });
  }
}
