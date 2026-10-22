/**
 * Stackra file contract:
 * Purpose: refuses an order that asks to redeem more points than the customer holds.
 * Boundary: implements `OrderHooks.verifyPlacement`: returns nothing or throws an AppError with a
 *           snake_case code; runs before stock is reserved. The only implementer today, so it takes
 *           the default order 0. Ids cross into the kit as `MemberId` .
 * Runtime: node
 * Governing contract: ADR 0265, ADR 0140, guides/programming-model.mdx#hooks
 */
import { Hook, type HookContext, type Implements } from "@stackra/actions";
import { LoyaltyService, memberId } from "@stackra/loyalty-kit";
import { OrderHooks } from "#modules/orders/hooks/order.hook-point";
import type { OrderDraft } from "#modules/orders/schemas/order-draft.schema";
import { RedeemPointsExtension } from "#modules/loyalty/schemas/redeem-points-extension.schema";

/** Order hook that refuses redeeming more loyalty points than the customer holds. */
@Hook(OrderHooks)
export class VerifyPointsBalanceHook implements Implements<OrderHooks, "verifyPlacement"> {
  constructor(private readonly loyalty: LoyaltyService) {}

  /**
   * Checks the balance only when the caller asked to redeem; an order without the extension passes.
   * @throws AppError `insufficient_points` from the kit, shown as
   *         `loyalty_kit::refusals.insufficient_points`.
   */
  async verifyPlacement(draft: OrderDraft, _ctx: HookContext): Promise<void> {
    const ext = RedeemPointsExtension.safeParse(draft.extensions.loyalty);
    if (!ext.success) return;
    await this.loyalty.assertCanRedeem(memberId(draft.customerId), ext.data.redeemPoints);
  }
}
