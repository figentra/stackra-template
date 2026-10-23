/**
 * Stackra file contract:
 * Purpose: builds Message rows for tests.
 * Boundary: bound to Message by the base factory's argument; a named state is a method. Faker comes
 *           from @stackra/database/testing, so only tests import a factory. Tests read the ids it
 *           returns instead of typing them.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 11, 13 and 16), ADR 0190 (factories with states)
 */
import { Factory, type Faker } from "@stackra/database/testing";
import type { Attributes } from "@stackra/model";
import { MessageStatus } from "#modules/messages/enums/message-status.enum";
import { Message } from "#modules/messages/models/message.model";

/** A queued receipt for a random principal. */
export class MessageFactory extends Factory(Message) {
  /** The default attributes of one message; tests override what they assert on. */
  definition(faker: Faker): Attributes<Message> {
    return {
      commandKey: `receipt:${faker.publicId("ord")}`,
      principalId: faker.publicId("usr"),
      mail: "order_receipt",
      subject: faker.lorem.sentence(),
    };
  }

  /** Accepted by the transport recently. */
  sent(): this {
    return this.state((faker) => ({
      status: MessageStatus.Sent,
      providerId: faker.string.uuid(),
      sentAt: faker.date.recent(),
    }));
  }
}
