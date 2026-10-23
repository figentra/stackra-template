/**
 * Stackra file contract:
 * Purpose: runtime values of orders, resolved per scope through the settings cascade (platform →
 *          tenant): whether orders are taken, the daily revenue target the KPI band measures
 *          against, and the cancellation section.
 * Boundary: the module's one settings group; its key is the module key (`orders`) and each field is
 *           a setting named by its path (`orders.acceptingOrders`,
 *           `orders.cancellation.autoCancelAfterMinutes`). A field typed by a schema class is a
 *           section (depth one, written with `!` and no initializer: the section class holds the
 *           defaults). `@Setting` narrows one field: its scopes, whether a higher scope may lock
 *           it, whether a change waits for a second approver, and whether clients receive it in the
 *           area bootstrap. `rules(r)` holds the cross-field rules, checked in the form and on
 *           save. Gen writes the settings page, the
 *           `orders.settings.get|update|history|revert|approve` operations and permissions, and the
 *           labels `orders::settings.<path>.label|help`. Code reads the resolved group with
 *           `SettingsReader#get(OrdersSettings)`. Never a secret: a credential is a Connection;
 *           deploy-time values are config.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 6, 13, 16 and 20, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0108, ADR 0213 (settings v2)
 */
import { Setting, SettingScope, Settings, type SettingsRules } from "@stackra/settings";
import { Int } from "@stackra/validation";
import { I18n } from "#stackra/i18n";
import type { OrderCancellationSettings } from "#modules/orders/schemas/order-cancellation-settings.schema";

/** A tenant admin changes these in the console without a deploy; the platform sets the defaults. */
export class OrdersSettings extends Settings({
  scopes: [SettingScope.Platform, SettingScope.Tenant],
  navigation: {
    group: I18n.orders.nav.sales,
    icon: "receipt",
    order: 20,
  },
}) {
  /** Whether new orders are taken; off pauses ordering while cancels and reads go on. */
  @Setting({ client: true })
  acceptingOrders = true;

  /**
   * Daily paid-revenue goal in minor units of the tenant's currency; OrderKpisQuery multiplies it
   * by the days in the period. Null means no target. A change waits for a second approver.
   */
  @Int({ min: 0 })
  @Setting({
    scopes: [SettingScope.Tenant],
    approval: true,
  })
  dailyRevenueTargetMinor: number | null = null;

  /** When unpaid orders expire, the platform's ceiling on that window, and customer cancels. */
  cancellation!: OrderCancellationSettings;

  /** A tenant's expiry window never exceeds the platform ceiling. */
  override rules(r: SettingsRules<OrdersSettings>) {
    return [
      r.atMost("cancellation.autoCancelAfterMinutes", "cancellation.maxAutoCancelAfterMinutes"),
    ];
  }
}
