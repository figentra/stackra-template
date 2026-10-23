/**
 * Stackra file contract:
 * Purpose: a person's notification preferences, resolved per user through the settings cascade.
 * Boundary: the module's one settings group, at user scope only; its key is the module key
 *           (`messages`) and each field is a setting named by its path (`messages.orders.updates`).
 *           Each field typed by a schema class is a section (depth one, written with `!` and no
 *           initializer: the section class holds the defaults). Every field is `client: true`, so
 *           the console and mobile render the toggles from the bootstrap without a round trip. Gen
 *           writes the "My preferences" page (user scope needs no permission beyond being signed
 *           in) and the labels `messages::settings.<path>.label|help`. The inbox listener reads the
 *           resolved group at call time with `SettingsReader#get(MessagesSettings, { user })`.
 *           Never a secret.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 6, 13, 16 and 20, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0108, ADR 0213 (settings v2), ADR 0223 (preferences
 *                     live in the notifications service)
 */
import { SettingScope, Settings } from "@stackra/settings";
import type { OrderMessageSettings } from "#modules/messages/schemas/order-message-settings.schema";
import type { PromotionMessageSettings } from "#modules/messages/schemas/promotion-message-settings.schema";

/** Each person changes these for themselves; no tenant or platform default overrides them. */
export class MessagesSettings extends Settings({ scopes: [SettingScope.User] }) {
  /** What a person hears about their own orders. */
  orders!: OrderMessageSettings;

  /** News and offers, off until the person opts in. */
  promotions!: PromotionMessageSettings;
}
