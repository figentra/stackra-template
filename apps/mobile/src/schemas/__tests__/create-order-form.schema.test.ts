/**
 * Stackra file contract:
 * Purpose: the form keeps the action's own line bounds and adds the points field with its typed
 *          message and its zero default.
 * Boundary: unit tier, pure; `validate` runs the schema gen compiled from the class.
 * Runtime: isomorphic
 * Governing contract: ADR 0022, ADR 0294 (decisions 4 and 26)
 */
import { describe, expect, it } from "@stackra/testing";
import { validate } from "@stackra/validation";
import { CreateOrderForm } from "#src/schemas/create-order-form.schema";
import { I18n } from "#stackra/i18n";

const variantId = "var_01H2J3K4L5M6N7P8Q9R0ABCDEF";

/** The sheet's client-side validation. */
describe("CreateOrderForm", () => {
  /** The quantity bound is the action's, so the form cannot drift from what the server accepts. */
  it("refuses a zero quantity with the action's own bound", () => {
    const result = validate(CreateOrderForm, { variantId, quantity: 0, redeemPoints: 0 });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual(["quantity"]);
  });

  /** The UI-only field carries a translation key, so the adapter can show it per locale. */
  it("refuses negative points with the typed key", () => {
    const result = validate(CreateOrderForm, { variantId, quantity: 1, redeemPoints: -5 });
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      I18n.pages.create_order.errors.points_min,
    ]);
  });

  /** Points default to zero, so an untouched field means "not entered". */
  it("defaults the points to zero", () => {
    expect(validate(CreateOrderForm, { variantId, quantity: 3 }).data?.redeemPoints).toBe(0);
  });
});
