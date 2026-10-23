/**
 * Stackra file contract:
 * Purpose: the quick-order form's shape, derived from the create-order action's input: its `lines`
 *          plus one UI-only field, the points to redeem, which `toInput` folds back into the
 *          loyalty extension.
 * Boundary: derived, never re-declared, so a change to the action's input changes this form; the
 *           base is the input class the generated commerce client carries. The route's `submit`
 *           validates with this class and calls `toInput` because a UI-only field exists; the
 *           server validates again with its own schema. Shared by the route and its page.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 4 and 8), ADR 0055 d1 (same schemas as the API)
 */
import type { ActionInput } from "@stackra/clients";
import { Int, PickType } from "@stackra/validation";
import { type CreateOrderAction, CreateOrderInput } from "#stackra/clients/commerce";

/** The order lines and the points to redeem; zero points means "no loyalty extension". */
export class QuickOrderForm extends PickType(CreateOrderInput, ["lines"]) {
  /** Points to redeem against this order; zero sends no loyalty extension. */
  @Int({ min: 0 })
  redeemPoints = 0;

  /**
   * `extensions.loyalty` is sent only when points are entered, so a tenant without loyalty never
   * sends the key.
   */
  static toInput(values: QuickOrderForm): ActionInput<typeof CreateOrderAction> {
    const loyalty =
      values.redeemPoints > 0 ? { loyalty: { redeemPoints: values.redeemPoints } } : {};
    return { lines: values.lines, extensions: loyalty };
  }
}
