/**
 * Stackra file contract:
 * Purpose: the form schema keeps the action's own line bounds and adds the points field with its
 *          typed message.
 * Boundary: unit tier, pure.
 * Runtime: isomorphic
 * Governing contract: ADR 0022, ADR 0095
 */
import { describe, expect, it } from "@stackra/testing";
import { CreateOrderForm } from "#src/schemas/create-order.schema";
import { I18n } from "#stackra/i18n";

/** The sheet's client-side validation. */
describe("CreateOrderForm", () => {
  /** The quantity bound is the action's, so the form cannot drift from what the server accepts. */
  it("refuses a zero quantity with the action's own bound", () => {
    const result = CreateOrderForm.safeParse({ variantId: "var_1", quantity: 0, redeemPoints: 0 });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual(["quantity"]);
  });

  /** The UI-only field carries a translation key, so the adapter can show it per locale. */
  it("refuses negative points with the typed key", () => {
    const result = CreateOrderForm.safeParse({ variantId: "var_1", quantity: 1, redeemPoints: -5 });
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      I18n.mobile.create_order.errors.points_min,
    ]);
  });

  /** Points default to zero, so an untouched field means "not entered". */
  it("defaults the points to zero", () => {
    expect(CreateOrderForm.parse({ variantId: "var_1", quantity: 3 }).redeemPoints).toBe(0);
  });
});
