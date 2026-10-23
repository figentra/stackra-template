/**
 * Stackra file contract:
 * Purpose: where other modules may change order totals or refuse a placement.
 * Boundary: each property is one point, typed by `transform` (returns the changed value) or
 *           `verify` (refuses by throwing a Refusal); the extra tuple types are the read-only
 *           arguments every implementer also receives. OrderPricingService injects this class and
 *           calls each point as a method, so every call site is greppable. An implementer is an
 *           `Extension(OrderExtensionPoint, { order })` class with one method named after one
 *           point. No `around`, no replacement. Point keys are `orders.adjustTotals` and
 *           `orders.verifyPlacement`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 23), ADR 0265 (transform and verify)
 */
import { ExtensionPoint } from "@stackra/actions";
import type { OrderDraft } from "#modules/orders/schemas/order-draft.schema";
import type { OrderTotals } from "#modules/orders/schemas/order-totals.schema";

/** Part of the module's contract: a renamed point needs `@Renamed`, like any identity. */
export class OrderExtensionPoint extends ExtensionPoint {
  /** Runs while pricing a draft, in implementer `order`; each returns the totals it adjusted. */
  readonly adjustTotals = ExtensionPoint.transform<OrderTotals, [draft: OrderDraft]>();

  /** Runs before stock or payment is touched; an implementer refuses by throwing a Refusal. */
  readonly verifyPlacement = ExtensionPoint.verify<[draft: OrderDraft]>();
}
