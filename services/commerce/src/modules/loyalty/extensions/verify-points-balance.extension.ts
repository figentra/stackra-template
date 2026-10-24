/**
 * Stackra file contract:
 * Purpose: refuses, early, an order that asks to redeem more points than the customer holds.
 * Boundary: an EXTENSION of orders' extension POINT (the point is the seam orders owns and calls;
 *           this class is one implementer in another module, which orders never imports). It
 *           implements the `before` slot `OrderExtensionPoint["verifyPlacement"]`, named by the
 *           indexed type argument: it runs before stock is reserved and refuses by throwing a
 *           refusal with a snake_case code, or returns the arguments unchanged. The only
 *           implementer of that slot, so it takes the default order (the bare form, no options) and
 *           declares no input: RedeemPointsExtension already adds `extensions.loyalty`. A read, so
 *           it fails fast before stock is touched but guarantees nothing under concurrency: the
 *           atomic check is HoldPointsExtension's hold when the order is written. Ids cross into
 *           the kit as `MemberId`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13 and 16, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0265 (extension points), ADR 0140
 */
import { type LoyaltyService, memberId } from "@acme/loyalty-kit";
import { Extension, type ExtensionContext } from "@stackra/actions";
import { validate } from "@stackra/validation";
import { RedeemPointsRequest } from "#modules/loyalty/schemas/redeem-points-request.schema";
import type { OrderExtensionPoint } from "#modules/orders/extensions/order.extension-point";
import type { OrderDraft } from "#modules/orders/schemas/order-draft.schema";

/** Checks the balance with the kit before anything is reserved. */
export class VerifyPointsBalanceExtension extends Extension<
  OrderExtensionPoint["verifyPlacement"]
> {
  /**
   * @param loyalty - the kit's service; `assertCanRedeem` reads the ledger.
   */
  constructor(private readonly loyalty: LoyaltyService) {
    super();
  }

  /**
   * Checks the balance only when the caller asked to redeem; an order without the input passes.
   * @returns the draft unchanged: this slot refuses or passes, it never replaces the arguments.
   * @throws Refusal `insufficient_points` from the kit, shown as
   *         `loyalty_kit::errors.insufficient_points.message`.
   */
  async handle(draft: OrderDraft, _ctx: ExtensionContext): Promise<[draft: OrderDraft]> {
    const request = validate(RedeemPointsRequest, draft.extensions.loyalty);
    if (request.success) {
      await this.loyalty.assertCanRedeem(memberId(draft.customerId), request.data.redeemPoints);
    }
    return [draft];
  }
}
