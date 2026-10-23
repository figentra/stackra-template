/**
 * Stackra file contract:
 * Purpose: proves the extension adds one capped adjustment when asked, and leaves totals untouched
 *          when not.
 * Boundary: unit tier; LoyaltyService is faked by class; the extension is called directly with a
 *           fake extension context. The customer and variant ids come from the actor helper and a
 *           factory.
 * Runtime: node
 * Governing contract: ADR 0265, ADR 0022
 */
import { LoyaltyService } from "@acme/loyalty-kit";
import type { RedemptionQuote } from "@acme/loyalty-kit/contracts";
import { fakeExtensionContext } from "@stackra/actions/testing";
import { createTestingModule } from "@stackra/container/testing";
import { actors } from "@stackra/iam/testing";
import { describe, expect, it } from "@stackra/testing";
import { I18n } from "#stackra/i18n";
import { VariantFactory } from "#modules/catalogue/database/factories/variant.factory";
import { AdjustmentCode } from "#modules/loyalty/enums/adjustment-code.enum";
import { RedeemPointsExtension } from "#modules/loyalty/extensions/redeem-points.extension";
import { LoyaltyModule } from "#modules/loyalty/loyalty.module";
import { OrderDraft } from "#modules/orders/schemas/order-draft.schema";
import { OrderTotals } from "#modules/orders/schemas/order-totals.schema";

/** Totals of a 10 000 minor-unit order with nothing applied yet. */
const totals = OrderTotals.create({
  currency: "USD",
  subtotalMinor: 10_000,
  adjustments: [],
  totalMinor: 10_000,
});

/** The extension under test, with the kit's quote fixed, and a draft builder for one line. */
async function setup(quote: RedemptionQuote) {
  const mod = await createTestingModule(LoyaltyModule)
    .override(LoyaltyService, { quote: async () => quote })
    .compile();
  const variant = VariantFactory.new().make();
  const draft = (extensions: OrderDraft["extensions"]) =>
    OrderDraft.create({
      customerId: actors.customer().id,
      currency: totals.currency,
      lines: [{ variantId: variant.id, quantity: 1, unitPriceMinor: totals.subtotalMinor }],
      extensions,
    });
  return { extension: mod.get(RedeemPointsExtension), draft };
}

/** Guards the order-total extension that applies loyalty redemption. */
describe(RedeemPointsExtension, () => {
  /** 9 999 requested, the kit quotes 3 000: the adjustment is the quote, negative, coded. */
  it("adds a capped negative adjustment", async () => {
    const { extension, draft } = await setup({ points: 3_000, amountMinor: 3_000 });
    const request = draft({ loyalty: { redeemPoints: 9_999 } });

    const out = await extension.adjustTotals(totals, request, fakeExtensionContext());

    expect(out.adjustments).toEqual([
      {
        code: AdjustmentCode.LoyaltyPoints,
        label: I18n.loyalty_kit.adjustment.points,
        amountMinor: -3_000,
      },
    ]);
  });

  /** No input means the same `totals` object back, so the chain stays referentially cheap. */
  it("does nothing without the input", async () => {
    const { extension, draft } = await setup({ points: 0, amountMinor: 0 });
    expect(await extension.adjustTotals(totals, draft({}), fakeExtensionContext())).toBe(totals);
  });
});
