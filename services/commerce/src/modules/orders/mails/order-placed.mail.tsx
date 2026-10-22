/**
 * Stackra file contract:
 * Purpose: the order confirmation email, as a React Email template owned by the module that knows
 *          the order.
 * Boundary: server-rendered React only (ADR 0164 bans client UI in a service, not server
 *           rendering). The producer renders and hands subject + html + text to the notifications
 *           service as a command; notifications owns delivery, preferences and the log, never the
 *           template. Strings are i18n keys; the brand image is an asset by key.
 * Runtime: node
 * Governing contract: ADR 0234 (module assets by key), ADR 0260 (command mode),
 *                     guides/programming-model.mdx#mails, D.12
 */
import { Button, Html, Img, Text } from "@react-email/components";
import { Mail, Mailable, type MailContext } from "@stackra/mail";
import { Assets } from "#stackra/assets";
import { I18n } from "#stackra/i18n";
import type { OrderView } from "#modules/orders/schemas/order-view.schema";

/** Props: the view the listener already has, and the storefront link it computed from config. */
export interface OrderPlacedMailProps {
  /** The pending order as the confirmation listener read it. */
  readonly order: OrderView;
  /** The absolute storefront link to the order. */
  readonly url: string;
}

/** `await this.mailer.send(new OrderPlacedMail({ order, url }).to(customerId))` after commit. */
@Mail({ key: "order_placed" })
export class OrderPlacedMail extends Mailable<OrderPlacedMailProps> {
  /** The subject line, with the order id, in the recipient's locale. */
  subject(ctx: MailContext): string {
    return ctx.t(I18n.orders.mail.order_placed.subject, { id: this.props.order.id });
  }

  /** The body: logo, the total in the order's currency, and a link to the order. */
  render(ctx: MailContext) {
    const { order, url } = this.props;
    const total = ctx.money(order.totals.totalMinor, order.totals.currency);
    return (
      <Html lang={ctx.locale} dir={ctx.dir}>
        <Img src={ctx.asset(Assets.orders.public.logo_svg)} alt="" width={120} />
        <Text>{ctx.t(I18n.orders.mail.order_placed.body, { total })}</Text>
        <Button href={url}>{ctx.t(I18n.orders.mail.order_placed.cta)}</Button>
      </Html>
    );
  }
}
