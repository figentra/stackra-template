/**
 * Stackra file contract:
 * Purpose: proves the derived form refuses an order without lines, defaults points to zero, and
 *          `toInput` omits the loyalty extension when no points are entered, so a tenant without
 *          the loyalty module never sends the key.
 * Boundary: unit tier; pure functions, no DOM.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0095, ADR 0007
 */
import { describe, expect, it } from "@stackra/testing";
import { QuickOrderForm } from "#src/schemas/quick-order-form.schema";

/** One line of the seeded demo variant. */
const LINE = { variantId: "var_01JA0000000000000000000001", quantity: 2 };

/** Guards the quick-order form contract between UI input and the create-order action. */
describe(QuickOrderForm, () => {
  /**
   * The action requires at least one line, so the derived form does too; points default to zero.
   */
  it("requires a line and defaults points to zero", () => {
    expect(QuickOrderForm.safeParse({ lines: [] }).success).toBe(false);
    expect(QuickOrderForm.parse({ lines: [LINE] })).toEqual({ lines: [LINE], redeemPoints: 0 });
  });

  /**
   * Without points the loyalty extension must be absent, or orders would carry a bogus redemption.
   */
  it("sends the extension only when points are entered", () => {
    expect(QuickOrderForm.toInput({ lines: [LINE], redeemPoints: 0 }).extensions).toEqual({});
    expect(QuickOrderForm.toInput({ lines: [LINE], redeemPoints: 250 }).extensions).toEqual({
      loyalty: { redeemPoints: 250 },
    });
  });
});
