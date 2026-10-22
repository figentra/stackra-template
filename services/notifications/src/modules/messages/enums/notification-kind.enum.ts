/**
 * Stackra file contract:
 * Purpose: what an in-app inbox entry is about; decides its icon and the label the console and
 *          mobile inbox render.
 * Boundary: a house enum (class); the `value` is stored on the Notification row.
 * Runtime: isomorphic
 * Governing contract: ADR 0231, guides/programming-model.mdx#enums
 */
import { Enum } from "@stackra/schema";
import { I18n } from "#stackra/i18n";

/** The kinds of in-app inbox entry this service writes. */
export class NotificationKind extends Enum<NotificationKind> {
  /** A customer's order was paid; data carries the order id, total and line count. */
  static readonly OrderPaid = NotificationKind.case("order_paid", {
    label: I18n.messages.notification_kind.order_paid,
  });
}
