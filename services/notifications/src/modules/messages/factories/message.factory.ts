/**
 * Stackra file contract:
 * Purpose: builds Message rows for tests.
 * Boundary: only tests import it.
 * Runtime: node
 * Governing contract: ADR 0190, guides/programming-model.mdx#factories
 */
import { Factory, type Faker } from "@stackra/database/testing";
import { Message } from "#modules/messages/models/message.model";
import { MessageStatus } from "#modules/messages/enums/message-status.enum";

/** A queued receipt for a random principal; `.state("sent")` adds a provider id and time. */
export class MessageFactory extends Factory<Message> {
  /** The model this factory builds. */
  model = Message;

  /** The default attributes of one record; tests override what they assert on. */
  protected definition(faker: Faker): Partial<Message> {
    return {
      commandKey: `receipt:ord_${faker.string.alphanumeric({ length: 26, casing: "lower" })}`,
      principalId: `usr_${faker.string.alphanumeric({ length: 26, casing: "lower" })}`,
      mail: "order_receipt",
      subject: faker.lorem.sentence(),
      status: MessageStatus.Queued,
      providerId: null,
      sentAt: null,
    };
  }

  /** Named states; `.state(name)` merges one on top of the definition. */
  protected states = {
    sent: (faker: Faker): Partial<Message> => ({
      status: MessageStatus.Sent,
      providerId: faker.string.uuid(),
      sentAt: faker.date.recent(),
    }),
  };
}
