/**
 * Stackra file contract:
 * Purpose: a person's notification preferences, resolved per user through the settings cascade.
 * Boundary: a settings group (`@Settings`) at user scope only; gen emits the user settings page the
 *           console and mobile render, and the inbox listener reads it at call time. Delivery of
 *           transactional mail (receipts, confirmations) is never switched off here: these switches
 *           decide only the in-app and push copies.
 * Runtime: node
 * Governing contract: ADR 0108, 0213 (settings v2), ADR 0095; ADR 0130 (notification preferences)
 */
import { Setting, SettingScope, Settings } from "@stackra/settings";
import { Bool } from "@stackra/validation";
import { I18n } from "#stackra/i18n";

/** Labels default to `messages::settings.<field>`. */
@Settings({ scopes: [SettingScope.User], page: { title: I18n.messages.settings.title } })
export class NotificationPreferences {
  /** Whether order status changes (paid, shipped, cancelled) reach the inbox; on by default. */
  @Bool() @Setting() orderUpdates = true;
  /**
   * Whether a receipt copy reaches the inbox and push when an order is paid; on by default. The
   * receipt email is transactional and always sent.
   */
  @Bool() @Setting() orderReceipts = true;
  /** Whether news about products the person bought (restocks, price drops) reaches them; off. */
  @Bool() @Setting() productUpdates = false;
  /** Whether promotional messages reach the person; off until they opt in. */
  @Bool() @Setting() marketing = false;
}
