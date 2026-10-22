/**
 * Stackra file contract:
 * Purpose: refuses new orders while the tenant has paused ordering (the `acceptingOrders` setting);
 *          a business precondition of the action, not a record rule.
 * Boundary: a guard runs in its named slot after the tenancy and iam gates, for every action that
 *           lists it; it sees the context, not the record, and refuses by throwing. It never checks
 *           whether the tenant is suspended: the tenancy gate refuses a suspended tenant's calls
 *           before any guard runs. Marked by `extends Guard`, no class decorator.
 * Runtime: node
 * Governing contract: ADR 0138 (fixed order: tenancy → iam → named gate slots → policy), ADR 0210
 *                     decision 2 (suspension is the tenant lifecycle's), ADR 0108 (settings),
 *                     guides/programming-model.mdx#policies-and-guards
 */
import { Guard, type GuardContext } from "@stackra/actions";
import { SettingsReader } from "@stackra/settings";
import { OrdersPausedError } from "#modules/orders/errors/orders-paused.error";
import { OrderSettings } from "#modules/orders/settings/order.setting";

/** Applied with `@Action({ guards: [AcceptingOrdersGuard] })` on `orders.order.create`. */
export class AcceptingOrdersGuard extends Guard {
  constructor(private readonly settings: SettingsReader) {
    super();
  }

  /**
   * Reads the tenant's resolved orders settings, so a pause takes effect without a deploy.
   * @throws OrdersPausedError when the tenant has switched `acceptingOrders` off.
   */
  async check(_ctx: GuardContext): Promise<void> {
    const { acceptingOrders } = await this.settings.for(OrderSettings);
    if (!acceptingOrders) throw new OrdersPausedError();
  }
}
