/**
 * Stackra file contract:
 * Purpose: the message lifecycle: create the dedup row for a command, deliver it through the
 *          transport port, and mark it failed when delivery is dead-lettered.
 * Boundary: the only writer of Message. No rendering here: producers render (ADR 0223). The body is
 *           never stored (ADR 0134): it travels in the delivery job's payload only.
 * Runtime: node
 * Governing contract: ADR 0136, 0141 (the aggregate records), 0263, ADR 0134,
 *                     guides/programming-model.mdx#services
 */
import type { IdentityResolver } from "@stackra/contracts";
import type { Repository } from "@stackra/database";
import { UniqueViolation } from "@stackra/database";
import type { NotificationsConfig } from "#config/notifications.config";
import type { MailTransport } from "#modules/messages/contracts/mail-transport.port";
import type { Message } from "#modules/messages/models/message.model";
import { MessageSent } from "#modules/messages/events/message-sent.event";
import { MessageStatus } from "#modules/messages/enums/message-status.enum";
import type { SendMessageInput } from "#modules/messages/schemas/send-message-input.schema";
import type { DeliverMessageInput } from "#modules/messages/schemas/deliver-message-input.schema";

/** The whole message path; the two actions are thin shells over it. */
export class MessageService {
  /**
   * @param transport - the driver named by config `transport`, bound by gen.
   * @param identity - resolves a principal to its verified address at send time, so no address is
   *                   ever stored here.
   */
  constructor(
    private readonly messages: Repository<Message>,
    private readonly transport: MailTransport,
    private readonly identity: IdentityResolver,
    private readonly config: NotificationsConfig,
  ) {}

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
        status: MessageStatus.Queued,
        providerId: null,
        sentAt: null,
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
      new MessageSent({
        messageId: message.id,
        principalId: message.principalId,
        mail: message.mail,
      }),
    );
    return message;
  }

  /** Marks a message whose delivery job was dead-lettered, so support sees it in the console. */
  async markFailed(messageId: string): Promise<void> {
    const message = await this.messages.findOneOrFail({ id: messageId });
    if (message.status !== MessageStatus.Sent) message.status = MessageStatus.Failed;
  }
}
