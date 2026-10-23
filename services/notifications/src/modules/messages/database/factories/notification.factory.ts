/**
 * Stackra file contract:
 * Purpose: builds Notification (inbox entry) rows for tests.
 * Boundary: bound to Notification by the base factory's argument; a named state is a method. Only
 *           tests import it; they read the ids it returns instead of typing them.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 11, 13 and 16), ADR 0190 (factories with states)
 */
import { Factory, type Faker } from "@stackra/database/testing";
import type { Attributes } from "@stackra/model";
import { NotificationKind } from "#modules/messages/enums/notification-kind.enum";
import { Notification } from "#modules/messages/models/notification.model";

/** An unread order-paid entry for a random principal, with a plausible payload. */
export class NotificationFactory extends Factory(Notification) {
  /** The default attributes of one entry; tests override what they assert on. */
  definition(faker: Faker): Attributes<Notification> {
    return {
      principalId: faker.publicId("usr"),
      kind: NotificationKind.OrderPaid,
      data: { totalMinor: faker.number.int({ min: 100, max: 50_000 }), lines: 1 },
    };
  }

  /** Opened recently. */
  read(): this {
    return this.state((faker) => ({ readAt: faker.date.recent() }));
  }
}
