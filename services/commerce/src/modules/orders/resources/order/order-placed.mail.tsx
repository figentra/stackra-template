/**
 * Stackra file contract:
 * Purpose: the body of the order confirmation mail, as a React Email template.
 * Boundary: a class component bound to OrderPlacedNotification by name; its props are the
 *           notification's data (OrderPlacedData), typed by
 *           `MailProps<typeof OrderPlacedNotification>`, so no Props file is written. Gen compiles
 *           the class to a function component; `mail` is a read-only hook field. Server-rendered
 *           React only (a service ships no client UI). Strings are i18n keys; the brand image is a
 *           module asset by key, which an app may override.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 7 and 13, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0223, ADR 0234 (module assets by key)
 */
import { Button, Html, Img, Text } from "@react-email/components";
import { type MailProps, useMail } from "@stackra/notifications/mail";
import { Component } from "@stackra/ui";
import { Assets } from "#stackra/assets";
import { I18n } from "#stackra/i18n";
import type { OrderPlacedNotification } from "#modules/orders/resources/order/order-placed.notification";

/** Logo, the total in the order's currency, and a link to the order. */
export class OrderPlacedMail extends Component<MailProps<typeof OrderPlacedNotification>> {
  /** Translation, money formatting, asset URLs, locale and direction for the recipient. */
  mail = useMail();

  /** The total in the order's currency, formatted for the recipient's locale. */
  get total(): string {
    const { totals } = this.props.order;
    return this.mail.money(totals.totalMinor, totals.currency);
  }

  /** The mail document. */
  render() {
    const { t, asset, locale, dir } = this.mail;
    const keys = I18n.orders.order_placed.mail;
    return (
      <Html lang={locale} dir={dir}>
        <Img src={asset(Assets.orders.public.logo_svg)} alt="" width={120} />
        <Text>{t(keys.body, { total: this.total })}</Text>
        <Button href={this.props.url}>{t(keys.cta)}</Button>
      </Html>
    );
  }
}
