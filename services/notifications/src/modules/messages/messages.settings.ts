/**
 * Stackra file contract:
 * Purpose: a person's notification preferences, resolved per user through the settings cascade.
 * Boundary: the module's one settings group, at user scope only; its key is the module key
 *           (`messages`) and each field is a setting named after the property
 *           (`messages.orderUpdates`). Gen writes the user settings page the console and mobile
 *           render; labels are the derived i18n keys `messages::settings.messages.<field>`. The
 *           inbox listener reads the resolved group at call time with
 *           `SettingsReader#for(MessagesSettings, { user })`. Transactional mail (receipts,
 *           confirmations) is never switched off here: these switches decide only the in-app and
 *           push copies.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 6, 13, 16 and 20), ADR 0108, ADR 0213 (settings v2),
 *                     ADR 0223 (preferences live in the notifications service)
 */
import { SettingScope, Settings } from "@stackra/settings";

/** Each person changes these for themselves; no tenant or platform default overrides them. */
export class MessagesSettings extends Settings({ scopes: [SettingScope.User] }) {
  /** Whether order status changes (paid, shipped, cancelled) reach the inbox; on by default. */
  orderUpdates = true;

  /** Whether a receipt copy reaches the inbox and push when an order is paid; on by default. */
  orderReceipts = true;

  /** Whether news about products the person bought (restocks, price drops) reaches them. */
  productUpdates = false;

  /** Whether promotional messages reach the person; off until they opt in. */
  marketing = false;
}
