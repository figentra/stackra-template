/**
 * Stackra file contract:
 * Purpose: the body of the paid-order receipt mail, as a React Email template.
 * Boundary: a class component bound to OrderReceiptNotification by name; its props are the
 *           notification's data (OrderReceiptData), typed by
 *           `MailProps<typeof OrderReceiptNotification>`, so no Props file is written. Gen compiles
 *           the class to a function component; `mail` is a read-only hook field. Server-rendered
 *           React only. Strings are i18n keys; the line count is an ICU plural, so Arabic gets all
 *           six CLDR forms (ADR 0192).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 7 and 13, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0223, ADR 0080, ADR 0192
 */
import { Html, Text } from "@react-email/components";
import { type MailProps, useMail } from "@stackra/notifications/mail";
import { Component } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import type { OrderReceiptNotification } from "#modules/orders/resources/order/order-receipt.notification";

/** A thank-you line, then the total and the pluralised line count. */
export class OrderReceiptMail extends Component<MailProps<typeof OrderReceiptNotification>> {
  /** Translation, money formatting, locale and direction for the recipient. */
  mail = useMail();

  /** The mail document. */
  render() {
    const { t, money, locale, dir } = this.mail;
    const { order } = this.props;
    const total = money(order.totals.totalMinor, order.totals.currency);
    const lines = t(I18n.orders.order.lines_count, { count: order.lines.length });
    return (
      <Html lang={locale} dir={dir}>
        <Text>{t(I18n.orders.order_receipt.mail.intro, { id: order.id })}</Text>
        <Text>
          {total} · {lines}
        </Text>
      </Html>
    );
  }
}
