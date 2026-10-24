/**
 * Stackra file contract:
 * Purpose: holds the loyalty points an order spends, atomically, while the order is placed; refuses
 *          the placement when the balance no longer covers them.
 * Boundary: an EXTENSION of orders' extension POINT, implementing the `before` slot
 *           `OrderExtensionPoint["reservePlacement"]`, named by the indexed type argument. Orders
 *           calls it inside the `createOrder` step's transaction, after pricing, so the points are
 *           the ones RedeemPointsExtension put on the totals. `LoyaltyService#hold` is one covered
 *           debit per member (a conditional update of the ledger's balance row in postgres), so of
 *           two orders racing for the same points the second is refused with
 *           `insufficient_points`: the refusal rolls its order back and undoes its stock
 *           reservation, and no overdraft is ever written. The hold commits with the order, is
 *           settled by SettleOnOrderPlacedListener and released by ReleaseOnOrderCancelledListener.
 *           The only implementer of the slot, so the bare form. Ids cross into the kit as
 *           `MemberId`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13 and 16, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0265 (extension points), ADR 0140
 */
import { type LoyaltyService, memberId } from "@acme/loyalty-kit";
import { Extension, type ExtensionContext } from "@stackra/actions";
import type { PublicId } from "@stackra/contracts";
import { AdjustmentCode } from "#modules/loyalty/enums/adjustment-code.enum";
import type { OrderExtensionPoint } from "#modules/orders/extensions/order.extension-point";
import type { PricedOrder } from "#modules/orders/schemas/priced-order.schema";

/** The write half of redemption: RedeemPointsExtension priced the discount, this reserves it. */
export class HoldPointsExtension extends Extension<OrderExtensionPoint["reservePlacement"]> {
  /**
   * @param loyalty - the kit's service; `hold` is the atomic covered debit.
   */
  constructor(private readonly loyalty: LoyaltyService) {
    super();
  }

  /**
   * Holds the points of the order's loyalty adjustment under the order id; an order without one
   * passes untouched.
   * @returns the arguments unchanged: this slot reserves or refuses, it never replaces them.
   * @throws Refusal `insufficient_points` (or `not_a_member`) from the kit.
   */
  async handle(
    orderId: PublicId<"ord">,
    priced: PricedOrder,
    ctx: ExtensionContext,
  ): Promise<[orderId: PublicId<"ord">, priced: PricedOrder]> {
    const used = priced.totals.adjustments.find(
      (adjustment) => adjustment.code === AdjustmentCode.LoyaltyPoints,
    );
    if (used) {
      const points = this.loyalty.pointsFor(-used.amountMinor);
      await this.loyalty.hold(memberId(priced.draft.customerId), points, orderId, ctx.now());
    }
    return [orderId, priced];
  }
}
