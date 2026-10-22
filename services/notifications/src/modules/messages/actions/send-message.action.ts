/**
 * Stackra file contract:
 * Purpose: `messages.message.send`: the action other services queue (the `notifications` Mailer
 *          driver uses `message.send.queue(input)`) and staff may call directly. One key, one
 *          pipeline, three reaches (ADR 0260).
 * Boundary: `idempotency: Idempotency.Derived`: with no Idempotency-Key the pipeline derives one
 *           from the input, which makes a redelivered command harmless. It only opens the dedup row
 *           and dispatches DeliverMessageAction after commit; the slow, failing part runs as a job
 *           with retries and a dead letter. The `Service` actor is how commerce's command arrives.
 * Runtime: node
 * Governing contract: ADR 0098, 0136 (idempotency step), 0260 d4 (command mode),
 *                     guides/programming-model.mdx#actions
 */
import { Action, type ActionContext, AsEndpoint, Idempotency } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import { SendMessageInput } from "#modules/messages/schemas/send-message-input.schema";
import { SendMessageOutput } from "#modules/messages/schemas/send-message-output.schema";
import type { MessageService } from "#modules/messages/services/message.service";
import { MessagePermissions } from "#modules/messages/permissions/message.permission";
import { MessageStatus } from "#modules/messages/enums/message-status.enum";
import { DeliverMessageAction } from "#modules/messages/actions/deliver-message.action";

/** Accepts one message; the output is the same `messageId` for the same command key. */
@Action({
  key: "message.send",
  input: SendMessageInput,
  output: SendMessageOutput,
  permission: MessagePermissions.send,
  actors: [ActorKind.Service, ActorKind.User],
  idempotency: Idempotency.Derived,
  rateLimit: { perMinute: 600, by: "tenant" },
})
@AsEndpoint({ method: HttpMethod.Post, path: "/messages" })
export class SendMessageAction {
  constructor(private readonly messages: MessageService) {}

  /**
   * `ctx.idempotencyKey` is the derived or supplied key; a sent message is not dispatched again.
   */
  async handle(input: SendMessageInput, ctx: ActionContext): Promise<SendMessageOutput> {
    const message = await this.messages.open(input, ctx.idempotencyKey);
    if (message.status !== MessageStatus.Sent) {
      const job = { messageId: message.id, html: input.html, text: input.text };
      ctx.afterCommit(() => ctx.dispatch(DeliverMessageAction, job));
    }
    return { messageId: message.id };
  }
}
