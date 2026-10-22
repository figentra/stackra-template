/**
 * Stackra file contract:
 * Purpose: the quick-order form's shape, derived from the create-order action's input: its `lines`
 *          plus one UI-only field, the points to redeem, which `toInput` folds back into the
 *          loyalty extension.
 * Boundary: derived, never re-declared, so a change to the action's input changes this form. The
 *           route's `submits` adapter parses with this class and calls `toInput` because a UI-only
 *           field exists; the server re-validates with its own schema.
 * Runtime: browser
 * Governing contract: ADR 0095 (Zod inside schema classes), ADR 0055 d1 (same schemas as the API)
 */
import type { ActionInput } from "@stackra/clients";
import { Schema, z } from "@stackra/schema";
import { Commerce } from "#stackra/clients";

/** The order lines and the points to redeem; zero points means "no loyalty extension". */
export class QuickOrderForm extends Schema(
  Commerce.actions.CreateOrder.input
    .pick({ lines: true })
    .extend({ redeemPoints: z.number().int().min(0).default(0) }),
) {
  /**
   * `extensions.loyalty` is sent only when points are entered, so a tenant without loyalty never
   * sends the key.
   */
  static toInput(values: QuickOrderForm): ActionInput<typeof Commerce.actions.CreateOrder> {
    const loyalty =
      values.redeemPoints > 0 ? { loyalty: { redeemPoints: values.redeemPoints } } : {};
    return { lines: values.lines, extensions: loyalty };
  }
}
