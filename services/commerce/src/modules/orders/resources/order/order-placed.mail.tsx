/**
 * Stackra file contract:
 * Purpose: the body of the order confirmation mail, as a React Email template.
 * Boundary: a function, bound to OrderPlacedNotification by name; its props are the notification's
 *           data. Server-rendered React only (a service ships no client UI). Strings are i18n
 *           keys; the brand image is a module asset by key, which an app may override.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 7 and 13), ADR 0223, ADR 0234 (module assets by key)
 */
import { Button, Html, Img, Text } from "@react-email/components";
import { type MailProps, useMail } from "@stackra/notifications/mail";
import { Assets } from "#stackra/assets";
import { I18n } from "#stackra/i18n";
import type { OrderPlacedNotification } from "#modules/orders/resources/order/order-placed.notification";

/** Logo, the total in the order's currency, and a link to the order. */
export function OrderPlacedMail({ order, url }: MailProps<typeof OrderPlacedNotification>) {
  const { t, money, asset, locale, dir } = useMail();
  const keys = I18n.orders.order_placed.mail;
  const total = money(order.totals.totalMinor, order.totals.currency);
  return (
    <Html lang={locale} dir={dir}>
      <Img src={asset(Assets.orders.public.logo_svg)} alt="" width={120} />
      <Text>{t(keys.body, { total })}</Text>
      <Button href={url}>{t(keys.cta)}</Button>
    </Html>
  );
}
