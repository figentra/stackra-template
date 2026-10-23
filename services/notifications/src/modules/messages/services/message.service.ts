/**
 * Stackra file contract:
 * Purpose: the message lifecycle: open the dedup row for a queued call, deliver it through the
 *          transport port, and mark it failed when delivery is dead-lettered.
 * Boundary: the only writer of Message. It extends `Service` and injects the generic Message
 *           repository, because opening a row needs an immediate insert that the unique index can
 *           refuse in a race. No rendering here: producers render (ADR 0223). The body is never
 *           stored (ADR 0134): it travels in the delivery job's payload only. `message.sent` is
 *           recorded on the aggregate and reaches the outbox at flush.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 17), ADR 0136, ADR 0141, ADR 0263, ADR 0134
 */
import { Service } from "@stackra/app";
import type { IdentityResolver } from "@stackra/contracts";
import { type Repository, UniqueViolation } from "@stackra/database";
import type { MailTransport } from "@stackra/notifications/contracts";
import type { DeliveryConfig } from "#config/delivery.config";
import { MessageStatus } from "#modules/messages/enums/message-status.enum";
import { MessageSent } from "#modules/messages/events/message-sent.event";
import type { Message } from "#modules/messages/models/message.model";
import type { DeliverMessageInput } from "#modules/messages/schemas/deliver-message-input.schema";
import type { SendMessageInput } from "#modules/messages/schemas/send-message-input.schema";

/** The whole message path; the two actions are thin shells over it. */
export class MessageService extends Service {
  /**
   * @param messages - the generic repository of Message.
   * @param transport - the driver named by config `transport`, bound by gen.
   * @param identity - resolves a principal to its verified address at send time, so no address is
   *                   ever stored here.
   * @param config - the platform sender.
   */
  constructor(
    private readonly messages: Repository<Message>,
    private readonly transport: MailTransport,
    private readonly identity: IdentityResolver,
    private readonly config: DeliveryConfig,
  ) {
    super();
  }

  /**
   * Finds or creates the row for `commandKey`. The unique index on (tenant, commandKey) decides a
   * race; the loser reads the winner's row.
   */
  async open(input: SendMessageInput, commandKey: string): Promise<Message> {
    const existing = await this.messages.findOne({ commandKey });
    if (existing) return existing;
    try {
      return await this.messages.insert({
        commandKey,
        principalId: input.to.principalId,
        mail: input.mail,
        subject: input.subject,
      });
    } catch (error) {
      if (error instanceof UniqueViolation) return this.messages.findOneOrFail({ commandKey });
      throw error;
    }
  }

  /**
   * Sends a queued message once and records `message.sent`; an already sent message returns as is.
   * @throws MailProviderUnavailableError (retryable) when the transport cannot take it now.
   */
  async deliver(input: DeliverMessageInput, at: Date): Promise<Message> {
    const message = await this.messages.findOneOrFail({ id: input.messageId });
    if (message.status === MessageStatus.Sent) return message;
    const to = await this.identity.emailOf(message.principalId);
    const mail = {
      to,
      from: this.config.fromAddress,
      subject: message.subject,
      html: input.html,
      text: input.text,
    };
    message.providerId = await this.transport.send(mail, message.commandKey);
    message.status = MessageStatus.Sent;
    message.sentAt = at;
    message.record(
      MessageSent.create({
        messageId: message.id,
        principalId: message.principalId,
        mail: message.mail,
      }),
    );
    return message;
  }

  /** Marks a message whose delivery job was dead-lettered, so support sees it in the console. */
  async markFailed(messageId: Message["id"]): Promise<void> {
    const message = await this.messages.findOneOrFail({ id: messageId });
    if (message.status !== MessageStatus.Sent) message.status = MessageStatus.Failed;
  }
}
