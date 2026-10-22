/**
 * Stackra file contract:
 * Purpose: turns requested loyalty points into a negative adjustment on the order totals.
 * Boundary: implements `OrderHooks.adjustTotals` at order 200 (after promotions 100, before gift
 *           cards 300). Runs inside pricing: no writes, no network. The debit happens after commit
 *           in a listener. Ids cross into the kit as `MemberId` through `memberId(...)` .
 * Runtime: node
 * Governing contract: ADR 0265, guides/programming-model.mdx#hooks
 */
import { Hook, type HookContext, type Implements } from "@stackra/actions";
import { LoyaltyService, memberId } from "@stackra/loyalty-kit";
import { OrderHooks } from "#modules/orders/hooks/order.hook-point";
import type { OrderDraft } from "#modules/orders/schemas/order-draft.schema";
import type { OrderTotals } from "#modules/orders/schemas/order-totals.schema";
import { RedeemPointsExtension } from "#modules/loyalty/schemas/redeem-points-extension.schema";
import { AdjustmentCode } from "#modules/loyalty/enums/adjustment-code.enum";

/** `extends` makes `extensions.loyalty` a typed part of `orders.order.create` input everywhere. */
@Hook(OrderHooks, { order: 200, extends: { loyalty: RedeemPointsExtension } })
export class RedeemPointsHook implements Implements<OrderHooks, "adjustTotals"> {
  /** @param loyalty - the kit's service; `quote` reads the ledger, it never writes in pricing. */
  constructor(private readonly loyalty: LoyaltyService) {}

  /** Returns `totals` unchanged when no points were requested or the quote is zero. */
  async adjustTotals(
    totals: OrderTotals,
    draft: OrderDraft,
    _ctx: HookContext,
  ): Promise<OrderTotals> {
    const ext = RedeemPointsExtension.safeParse(draft.extensions.loyalty);
    if (!ext.success) return totals;
    const runningMinor =
      totals.subtotalMinor + totals.adjustments.reduce((s, a) => s + a.amountMinor, 0);
    const member = memberId(draft.customerId);
    const quote = await this.loyalty.quote(member, ext.data.redeemPoints, runningMinor);
    if (quote.amountMinor === 0) return totals;
    const code = AdjustmentCode.LoyaltyPoints;
    return {
      ...totals,
      adjustments: [
        ...totals.adjustments,
        { code: code.value, label: code.label, amountMinor: -quote.amountMinor },
      ],
    };
  }
}
