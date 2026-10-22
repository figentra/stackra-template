/**
 * Stackra file contract:
 * Purpose: where other modules may change order totals ("cut an amount here") or refuse a placement
 *          ("verify there").
 * Boundary: a hook-point class: each property is one point, typed by `transform` or `verify`; the
 *           owner injects this class and calls the point as a method, so every call site is
 *           greppable. No `around`, no replacement.
 * Runtime: node
 * Governing contract: ADR 0265 (transform and verify), ADR 0101 d4,
 *                     guides/programming-model.mdx#hooks
 */
import { HookPoint, transform, verify } from "@stackra/actions";
import type { OrderTotals } from "#modules/orders/schemas/order-totals.schema";
import type { OrderDraft } from "#modules/orders/schemas/order-draft.schema";

/**
 * Part of the module's contract (renames follow deprecation). The chain per point, with file paths,
 * is printed in
 * `.stackra/gen/hooks.ts`. Implicit points `Before(Action)` and `After(Action)` exist for every
 * action.
 */
@HookPoint()
export class OrderHooks {
  /**
   * Runs while pricing a draft, in implementer `order`; each implementer returns the totals with
   * its adjustment added.
   */
  readonly adjustTotals = transform<OrderTotals, [draft: OrderDraft]>();
  /**
   * Runs before stock or payment is touched; an implementer refuses by throwing an AppError with a
   * snake_case code.
   */
  readonly verifyPlacement = verify<[draft: OrderDraft]>();
}
