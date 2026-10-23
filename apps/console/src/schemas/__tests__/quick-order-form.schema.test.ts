/**
 * Stackra file contract:
 * Purpose: proves the derived form keeps the action's rule (at least one line), defaults the points
 *          to zero, and folds the points into the loyalty extension only when entered.
 * Boundary: unit tier; the shape alone, validated through `validate` with the schema gen compiled
 *           from it.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0294 (decision 4), ADR 0007
 */
import { describe, expect, it } from "@stackra/testing";
import { validate } from "@stackra/validation";
import { QuickOrderForm } from "#src/schemas/quick-order-form.schema";

/** One line of the seeded demo variant. */
const LINE = { variantId: "var_01JA0000000000000000000001", quantity: 2 };

/** Guards the quick-order form contract between UI input and the create-order action. */
describe(QuickOrderForm, () => {
  /**
   * The action requires at least one line, so the derived form does too; points default to zero.
   */
  it("requires a line and defaults points to zero", () => {
    expect(validate(QuickOrderForm, { lines: [] }).success).toBe(false);
    const parsed = validate(QuickOrderForm, { lines: [LINE] });
    expect(parsed.success && parsed.data).toEqual({ lines: [LINE], redeemPoints: 0 });
  });

  /**
   * Without points the loyalty extension must be absent, or orders would carry a bogus redemption.
   */
  it("sends the extension only when points are entered", () => {
    const none = QuickOrderForm.create({ lines: [LINE], redeemPoints: 0 });
    const some = QuickOrderForm.create({ lines: [LINE], redeemPoints: 250 });
    expect(QuickOrderForm.toInput(none).extensions).toEqual({});
    expect(QuickOrderForm.toInput(some).extensions).toEqual({ loyalty: { redeemPoints: 250 } });
  });
});
