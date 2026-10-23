/**
 * Stackra file contract:
 * Purpose: `OrderMessageSettings`: the "Orders" section of a person's notification preferences.
 * Boundary: a shape class in schemas/, one declaration per file, typed as a field of
 *           MessagesSettings, which makes it a section (keys `messages.orders.<field>`). Defaults
 *           live here only. `@Renamed` takes the old key relative to the group, so stored choices
 *           move from `messages.orderUpdates` without a migration. Transactional mail (receipts,
 *           confirmations) is never switched off here: these switches decide only the in-app and
 *           push copies.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 6 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0108, ADR 0213, ADR 0223
 */
import { Setting } from "@stackra/settings";
import { Renamed, Schema } from "@stackra/validation";

/** What a person hears about their own orders in the app; both on by default. */
export class OrderMessageSettings extends Schema {
  /** Whether order status changes (paid, shipped, cancelled) reach the inbox. */
  @Setting({ client: true })
  @Renamed("orderUpdates")
  updates = true;

  /** Whether a receipt copy reaches the inbox and push when an order is paid. */
  @Setting({ client: true })
  @Renamed("orderReceipts")
  receipts = true;
}
