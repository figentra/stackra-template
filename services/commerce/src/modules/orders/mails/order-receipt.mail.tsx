/**
 * Stackra file contract:
 * Purpose: the paid-order receipt, as a React Email template owned by the module that knows the
 *          order (moved from the notifications service, ADR 0223).
 * Boundary: server-rendered React only. Strings are i18n keys; the line count is an ICU plural, so
 *           Arabic gets all six CLDR forms (ADR 0192). Notifications receives the rendered parts
 *           only.
 * Runtime: node
 * Governing contract: ADR 0234 (module assets by key), ADR 0080, ADR 0260,
 *                     guides/programming-model.mdx#mails, D.12, ADR 0223
 */
import { Html, Text } from "@react-email/components";
import { Mail, Mailable, type MailContext } from "@stackra/mail";
import { I18n } from "#stackra/i18n";
import type { OrderView } from "#modules/orders/schemas/order-view.schema";

/** Props: the order as the receipt listener read it after the capture. */
export interface OrderReceiptMailProps {
  /** The paid order with its final totals and lines. */
  readonly order: OrderView;
}

/** `await this.mailer.send(new OrderReceiptMail({ order }).to(customerId))` after `order.paid`. */
@Mail({ key: "order_receipt" })
export class OrderReceiptMail extends Mailable<OrderReceiptMailProps> {
  /** The subject line, with the order id, in the recipient's locale. */
  subject(ctx: MailContext): string {
    return ctx.t(I18n.orders.mail.order_receipt.subject, { id: this.props.order.id });
  }

  /** The body: a thank-you line, then the total and the pluralised line count. */
  render(ctx: MailContext) {
    const { order } = this.props;
    const total = ctx.money(order.totals.totalMinor, order.totals.currency);
    const lines = ctx.t(I18n.orders.order.lines_count, { count: order.lines.length });
    return (
      <Html lang={ctx.locale} dir={ctx.dir}>
        <Text>{ctx.t(I18n.orders.mail.order_receipt.intro, { id: order.id })}</Text>
        <Text>
          {total} · {lines}
        </Text>
      </Html>
    );
  }
}
