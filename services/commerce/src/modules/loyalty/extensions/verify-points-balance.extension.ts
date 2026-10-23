/**
 * Stackra file contract:
 * Purpose: refuses an order that asks to redeem more points than the customer holds.
 * Boundary: implements `orders.verifyPlacement`: returns nothing or throws a refusal with a
 *           snake_case code, before stock is reserved. The only implementer of that point, so it
 *           takes the default order (the bare `Extension(OrderExtensionPoint)` form) and declares
 *           no input: RedeemPointsExtension already adds `extensions.loyalty`. Ids cross into the
 *           kit as `MemberId`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13 and 16), ADR 0265 (verify), ADR 0140
 */
import { type LoyaltyService, memberId } from "@acme/loyalty-kit";
import { Extension, type ExtensionContext } from "@stackra/actions";
import { validate } from "@stackra/validation";
import { RedeemPointsRequest } from "#modules/loyalty/schemas/redeem-points-request.schema";
import { OrderExtensionPoint } from "#modules/orders/extensions/order.extension-point";
import type { OrderDraft } from "#modules/orders/schemas/order-draft.schema";

/** Checks the balance with the kit before anything is reserved. */
export class VerifyPointsBalanceExtension extends Extension(OrderExtensionPoint) {
  /** @param loyalty - the kit's service; `assertCanRedeem` reads the ledger. */
  constructor(private readonly loyalty: LoyaltyService) {
    super();
  }

  /**
   * Checks the balance only when the caller asked to redeem; an order without the input passes.
   * @throws Refusal `insufficient_points` from the kit, shown as
   *         `loyalty_kit::errors.insufficient_points.message`.
   */
  async verifyPlacement(draft: OrderDraft, _ctx: ExtensionContext): Promise<void> {
    const request = validate(RedeemPointsRequest, draft.extensions.loyalty);
    if (!request.success) return;
    await this.loyalty.assertCanRedeem(memberId(draft.customerId), request.data.redeemPoints);
  }
}
