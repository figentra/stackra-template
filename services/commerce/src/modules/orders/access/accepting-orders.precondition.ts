/**
 * Stackra file contract:
 * Purpose: refuses order placement while the tenant has paused ordering (the `acceptingOrders`
 *          setting): whether the call may run now, whoever asks.
 * Boundary: a precondition runs after the tenancy and permission steps and before entitlement, flag
 *           and idempotency; it sees the context, never the record, and refuses by throwing. A
 *           suspended tenant is refused earlier by the tenancy step, never here.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 16 and 23), ADR 0138 (pipeline order, as amended),
 *                     ADR 0140 (precondition category), ADR 0108 (settings)
 */
import { Precondition, type PreconditionContext } from "@stackra/actions";
import type { SettingsReader } from "@stackra/settings";
import { OrdersPausedError } from "#modules/orders/errors/orders-paused.error";
import { OrdersSettings } from "#modules/orders/orders.settings";

/** Listed in `preconditions` of `orders.order.create`. */
export class AcceptingOrdersPrecondition extends Precondition {
  /** @param settings - reads the tenant's resolved group, so a pause applies without a deploy. */
  constructor(private readonly settings: SettingsReader) {
    super();
  }

  /** @throws OrdersPausedError when the tenant has switched `acceptingOrders` off. */
  async check(_ctx: PreconditionContext): Promise<void> {
    const { acceptingOrders } = await this.settings.get(OrdersSettings);
    if (!acceptingOrders) throw OrdersPausedError.create();
  }
}
