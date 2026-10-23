/**
 * Stackra file contract:
 * Purpose: `OrderCancellationSettings`: the cancellation section of OrdersSettings: when unpaid
 *          orders expire, the platform's ceiling on that window, and whether customers may cancel.
 * Boundary: a shape class in schemas/, one declaration per file, typed as a field of
 *           OrdersSettings, which makes it a section (depth one; keys
 *           `orders.cancellation.<field>`). Defaults live here only: the section field in
 *           OrdersSettings has no initializer. `@Renamed` takes the old key relative to the group,
 *           so stored values move from `orders.<field>` to `orders.cancellation.<field>` without a
 *           migration. Runtime values only, never a secret.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 6 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0108, ADR 0213
 */
import { Setting, SettingScope } from "@stackra/settings";
import { Int, Renamed, Schema } from "@stackra/validation";

/** The platform sets the ceiling; a tenant picks its window at or below it. */
export class OrderCancellationSettings extends Schema {
  /** Minutes an order may stay unpaid before the expiry job ends it; at most the ceiling below. */
  @Int({
    min: 5,
    max: 1440,
  })
  @Renamed("autoCancelAfterMinutes")
  autoCancelAfterMinutes = 30;

  /** The longest window any tenant may choose; a platform guard, not a tenant choice. */
  @Int({
    min: 5,
    max: 1440,
  })
  @Setting({ scopes: [SettingScope.Platform] })
  maxAutoCancelAfterMinutes = 60;

  /** Whether a customer may cancel their own unpaid order; the platform may lock it off. */
  @Setting({
    lockable: true,
    client: true,
  })
  @Renamed("customersMayCancel")
  customersMayCancel = true;
}
