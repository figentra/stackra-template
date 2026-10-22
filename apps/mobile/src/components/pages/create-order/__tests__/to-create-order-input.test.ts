/**
 * Stackra file contract:
 * Purpose: the fold back into the action input sends `extensions.loyalty` only when points are
 *          entered.
 * Boundary: unit tier, pure.
 * Runtime: isomorphic
 * Governing contract: ADR 0022, ADR 0055
 */
import { describe, expect, it } from "@stackra/testing";
import { toCreateOrderInput } from "#src/components/pages/create-order/to-create-order-input";

/** The reshape to `Commerce.actions.CreateOrder`'s input. */
describe("toCreateOrderInput", () => {
  /**
   * Zero means "not entered", so no loyalty extension travels and the server applies no redemption.
   */
  it("omits extensions.loyalty when no points are entered", () => {
    expect(toCreateOrderInput({ variantId: "var_1", quantity: 1, redeemPoints: 0 })).toEqual({
      lines: [{ variantId: "var_1", quantity: 1 }],
      extensions: {},
    });
  });

  /** Entered points travel in the loyalty extension the kit's hook reads. */
  it("sends the entered points in extensions.loyalty", () => {
    const input = toCreateOrderInput({ variantId: "var_1", quantity: 1, redeemPoints: 250 });
    expect(input.extensions).toEqual({ loyalty: { redeemPoints: 250 } });
  });
});
