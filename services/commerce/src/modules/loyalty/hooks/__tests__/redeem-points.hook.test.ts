/**
 * Stackra file contract:
 * Purpose: proves the hook adds one capped adjustment when asked, and leaves totals untouched when
 *          not.
 * Boundary: unit tier; LoyaltyService is faked by class; the hook is called directly with a fake
 *           hook context. The customer and variant ids come from the actor helper and a factory.
 * Runtime: node
 * Governing contract: ADR 0265, ADR 0022, guides/programming-model.mdx#hooks
 */
import { describe, expect, it } from "@stackra/testing";
import { actors } from "@stackra/iam/testing";
import { createTestingModule } from "@stackra/container/testing";
import { fakeHookContext } from "@stackra/actions/testing";
import { LoyaltyService } from "@acme/loyalty-kit";
import type { RedemptionQuote } from "@acme/loyalty-kit/contracts";
import { LoyaltyModule } from "#modules/loyalty/loyalty.module";
import { RedeemPointsHook } from "#modules/loyalty/hooks/redeem-points.hook";
import { AdjustmentCode } from "#modules/loyalty/enums/adjustment-code.enum";
import { VariantFactory } from "#modules/catalogue/factories/variant.factory";
import type { OrderDraft } from "#modules/orders/schemas/order-draft.schema";
import type { OrderTotals } from "#modules/orders/schemas/order-totals.schema";

/** Totals of a 10 000 minor-unit order with nothing applied yet. */
const totals: OrderTotals = {
  currency: "USD",
  subtotalMinor: 10_000,
  adjustments: [],
  totalMinor: 10_000,
};

/** The hook under test, with the kit's quote fixed, and a draft builder for one line. */
async function setup(quote: RedemptionQuote) {
  const mod = await createTestingModule(LoyaltyModule)
    .override(LoyaltyService, { quote: async () => quote })
    .compile();
  const variant = new VariantFactory(mod.em).makeOne();
  const draft = (extensions: OrderDraft["extensions"]): OrderDraft => ({
    customerId: actors.customer().id,
    currency: totals.currency,
    lines: [{ variantId: variant.id, quantity: 1, unitPriceMinor: totals.subtotalMinor }],
    extensions,
  });
  return { hook: mod.get(RedeemPointsHook), draft };
}

/** Guards the order-total hook that applies loyalty redemption. */
describe(RedeemPointsHook, () => {
  /** 9 999 requested, the kit quotes 3 000: the adjustment is the quote, negative, coded. */
  it("adds a capped negative adjustment", async () => {
    const { hook, draft } = await setup({ points: 3_000, amountMinor: 3_000 });
    const request = draft({ loyalty: { redeemPoints: 9_999 } });

    const out = await hook.adjustTotals(totals, request, fakeHookContext());

    const code = AdjustmentCode.LoyaltyPoints;
    expect(out.adjustments).toEqual([{ code: code.value, label: code.label, amountMinor: -3_000 }]);
  });

  /** No extension means the same `totals` object back, so the chain stays referentially cheap. */
  it("does nothing without the extension", async () => {
    const { hook, draft } = await setup({ points: 0, amountMinor: 0 });
    expect(await hook.adjustTotals(totals, draft({}), fakeHookContext())).toBe(totals);
  });
});
