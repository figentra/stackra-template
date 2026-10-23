/**
 * Stackra file contract:
 * Purpose: turns requested loyalty points into a negative adjustment on the order totals.
 * Boundary: an EXTENSION: one class in this module that plugs into exactly one slot of another
 *           module's extension POINT. The point (OrderExtensionPoint) is orders' published seam,
 *           owned and called by orders; this class is loyalty's contribution to it, and orders
 *           never imports it. The slot is the indexed type argument
 *           (`OrderExtensionPoint["adjustTotals"]`, an `after` slot: a value pipeline), so
 *           TypeScript checks `handle` against the slot's signature. It runs at order 200 (after
 *           promotions at 100, before gift cards at 300) and adds `extensions.loyalty`
 *           (RedeemPointsRequest) to the input of `orders.order.create@1`; the namespace is this
 *           module's key. Runs inside pricing: no writes and no network. HoldPointsExtension holds
 *           the points atomically when the order is written, SettleOnOrderPlacedListener settles
 *           them and ReleaseOnOrderCancelledListener gives them back. Ids cross into the kit as
 *           `MemberId` through `memberId(...)`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13 and 16, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0265 (extension points and typed extensions)
 */
import { type LoyaltyService, memberId } from "@acme/loyalty-kit";
import { Extension, type ExtensionContext } from "@stackra/actions";
import { validate } from "@stackra/validation";
import { I18n } from "#stackra/i18n";
import { AdjustmentCode } from "#modules/loyalty/enums/adjustment-code.enum";
import { RedeemPointsRequest } from "#modules/loyalty/schemas/redeem-points-request.schema";
import type { OrderExtensionPoint } from "#modules/orders/extensions/order.extension-point";
import type { OrderDraft } from "#modules/orders/schemas/order-draft.schema";
import { OrderTotals } from "#modules/orders/schemas/order-totals.schema";

/** One point is worth one minor unit; the kit caps the redemption by balance and percentage. */
export class RedeemPointsExtension extends Extension<OrderExtensionPoint["adjustTotals"]>({
  order: 200,
  input: RedeemPointsRequest,
}) {
  /** @param loyalty - the kit's service; `quote` reads the ledger and never writes in pricing. */
  constructor(private readonly loyalty: LoyaltyService) {
    super();
  }

  /** Returns `totals` itself when no points were requested or the quote is zero. */
  async handle(
    totals: OrderTotals,
    draft: OrderDraft,
    _ctx: ExtensionContext,
  ): Promise<OrderTotals> {
    const request = validate(RedeemPointsRequest, draft.extensions.loyalty);
    if (!request.success) return totals;
    const runningMinor = totals.adjustments.reduce(
      (sum, adjustment) => sum + adjustment.amountMinor,
      totals.subtotalMinor,
    );
    const member = memberId(draft.customerId);
    const quote = await this.loyalty.quote(member, request.data.redeemPoints, runningMinor);
    if (quote.amountMinor === 0) return totals;
    return OrderTotals.create({
      ...totals,
      adjustments: [
        ...totals.adjustments,
        {
          code: AdjustmentCode.LoyaltyPoints,
          label: I18n.loyalty_kit.adjustment.points,
          amountMinor: -quote.amountMinor,
        },
      ],
    });
  }
}
