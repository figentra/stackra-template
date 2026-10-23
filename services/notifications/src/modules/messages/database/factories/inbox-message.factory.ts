/**
 * Stackra file contract:
 * Purpose: builds InboxMessage (inbox entry) rows for tests.
 * Boundary: bound to InboxMessage by the type argument (`Factory<InboxMessage>`); a named state is
 *           a method. Only tests import it; they read the ids it returns instead of typing them.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 11, 13 and 16), ADR 0190 (factories with states)
 */
import { Factory, type Faker } from "@stackra/database/testing";
import type { Attributes } from "@stackra/model";
import { InboxMessageKind } from "#modules/messages/enums/inbox-message-kind.enum";
import type { InboxMessage } from "#modules/messages/models/inbox-message.model";

/** An unread order-paid entry for a random principal, with a plausible payload. */
export class InboxMessageFactory extends Factory<InboxMessage> {
  /** The default attributes of one entry; tests override what they assert on. */
  definition(faker: Faker): Attributes<InboxMessage> {
    return {
      principalId: faker.publicId("usr"),
      kind: InboxMessageKind.OrderPaid,
      data: { totalMinor: faker.number.int({ min: 100, max: 50_000 }), lines: 1 },
    };
  }

  /** Opened recently. */
  read(): this {
    return this.state((faker) => ({ readAt: faker.date.recent() }));
  }
}
