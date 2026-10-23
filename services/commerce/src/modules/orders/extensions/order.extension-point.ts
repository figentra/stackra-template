/**
 * Stackra file contract:
 * Purpose: the seams orders publishes for other modules: change an order's totals while it is
 *          priced, refuse a placement before anything is reserved, or reserve what the order spends
 *          before it commits.
 * Boundary: an extension POINT is owned by the module that calls it and is part of that module's
 *           contract, like an event: orders declares it, injects it and calls each slot as a method
 *           (OrderPricingService), so every call site is greppable. An EXTENSION is one class in
 *           another module that plugs into exactly one slot
 *           (`extends Extension<OrderExtensionPoint["adjustTotals"]>`, see
 *           ../../loyalty/extensions); orders never imports its extensions. Slots use Magento's
 *           words: `after` is a value pipeline (each extension receives the previous result and
 *           returns the adjusted value, ascending `order`); `before` runs ahead of the owner's step
 *           and may refuse by throwing a Refusal or return replacement arguments of the same type.
 *           Magento's `around` is not a slot: it is an `Interceptor` on a whole action call.
 *           `reservePlacement` is called by CreateOrderWorkflow inside the `createOrder` step's
 *           transaction, after the pending order is built and before it commits: a hold an
 *           extension takes there commits or rolls back with the order, and a refusal rolls the
 *           order back and undoes the stock reservation. Slot keys are `orders.adjustTotals`,
 *           `orders.verifyPlacement` and `orders.reservePlacement`; a renamed slot needs
 *           `@Renamed`, like any identity.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 23, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0265 (extension points; no method-level around)
 */
import { ExtensionPoint } from "@stackra/actions";
import type { PublicId } from "@stackra/contracts";
import type { OrderDraft } from "#modules/orders/schemas/order-draft.schema";
import type { OrderTotals } from "#modules/orders/schemas/order-totals.schema";
import type { PricedOrder } from "#modules/orders/schemas/priced-order.schema";

/** The three slots orders calls while it prices, verifies and places a draft. */
export class OrderExtensionPoint extends ExtensionPoint {
  /** After the subtotal is priced; each extension returns the totals it adjusted, in `order`. */
  readonly adjustTotals = ExtensionPoint.after<OrderTotals, [draft: OrderDraft]>();

  /** Before stock or payment is touched; an extension refuses by throwing a Refusal. */
  readonly verifyPlacement = ExtensionPoint.before<[draft: OrderDraft]>();

  /**
   * Before the pending order commits, in its transaction; an extension reserves what the order
   * spends under its id (points, a gift-card balance) or refuses by throwing a Refusal. The order
   * is already priced, so the arguments it returns are not used.
   */
  readonly reservePlacement =
    ExtensionPoint.before<[orderId: PublicId<"ord">, priced: PricedOrder]>();
}
