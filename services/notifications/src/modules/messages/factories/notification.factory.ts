/**
 * Stackra file contract:
 * Purpose: builds Notification rows for tests.
 * Boundary: only tests import it; tests read the ids it returns instead of typing them.
 * Runtime: node
 * Governing contract: ADR 0190, guides/programming-model.mdx#factories
 */
import { Factory, type Faker } from "@stackra/database/testing";
import { Notification } from "#modules/messages/models/notification.model";
import { NotificationKind } from "#modules/messages/enums/notification-kind.enum";

/** An unread order-paid entry for a random principal; `.state("read")` stamps `readAt`. */
export class NotificationFactory extends Factory<Notification> {
  /** The model this factory builds. */
  model = Notification;

  /** A fresh, unread entry with a plausible order payload. */
  protected definition(faker: Faker): Partial<Notification> {
    return {
      principalId: `usr_${faker.string.alphanumeric({ length: 26, casing: "lower" })}`,
      kind: NotificationKind.OrderPaid,
      data: { totalMinor: faker.number.int({ min: 100, max: 50_000 }), lines: 1 },
      readAt: null,
    };
  }

  /** Named states; `.state("read")` merges one on top of the definition. */
  protected states = {
    read: (faker: Faker): Partial<Notification> => ({ readAt: faker.date.recent() }),
  };
}
