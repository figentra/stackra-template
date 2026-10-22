/**
 * Stackra file contract:
 * Purpose: prices an order draft: sellable check (catalogue), unit prices (pricing service), then
 *          the adjustTotals hook chain, then verifyPlacement.
 * Boundary: computation plus reads; no writes. The single place where order totals are produced, so
 *           every extension of an amount is listed in .stackra/gen/hooks.ts under
 *           `orders.adjustTotals`. Arithmetic is `Money` from @stackra/money (no hand-summed
 *           integers); the row and the wire keep integer minor units (ADR 0220).
 * Runtime: node
 * Governing contract: ADR 0260 (call = authoritative answer now), ADR 0265 (hooks), ADR 0220
 *                     (money), guides/programming-model.mdx#hooks; ADR 0127 rows 2 and 29
 */
import type { ActionContext } from "@stackra/actions";
import type { Logger } from "@stackra/contracts";
import { Money } from "@stackra/money";
import type { PricingClient } from "#stackra/clients";
import type { ProductService } from "#modules/catalogue/services/product.service";
import type { OrderHooks } from "#modules/orders/hooks/order.hook-point";
import type { OrderDraft } from "#modules/orders/schemas/order-draft.schema";
import type { OrderTotals } from "#modules/orders/schemas/order-totals.schema";
import type { CreateOrderInput } from "#modules/orders/schemas/create-order-input.schema";

/** The structured log event this service writes once per priced draft. */
const DRAFT_PRICED = "orders.draft_priced";

/**
 * Turns a create-order input into a priced, verified draft. Called by the workflow's first step.
 */
export class OrderPricingService {
  /**
   * @param products - catalogue's exported service; gen records the orders → catalogue edge.
   * @param pricing - the generated pricing client; transport (in-process or RPC) follows runway.
   * @param hooks - the orders hook points; each property runs its implementers in `order`.
   * @param logger - the contracts port; @stackra/logger supplies the driver and the redaction that
   *                 src/config/logging.config.ts configures.
   */
  constructor(
    private readonly products: ProductService,
    private readonly pricing: PricingClient,
    private readonly hooks: OrderHooks,
    private readonly logger: Logger,
  ) {}

  /**
   * Builds the draft from the pricing service's current quote. A call, not an event: the order
   * needs the authoritative price now. The customer is the acting principal; the market comes from
   * the request context.
   * @throws VariantUnavailableError when a variant is missing or its product is not active.
   * @throws AppError whatever refusal the pricing service returns, unchanged.
   */
  async draft(input: CreateOrderInput, ctx: ActionContext): Promise<OrderDraft> {
    await this.products.assertSellable(input.lines.map((l) => l.variantId));
    const quote = await this.pricing.price.quote.call({ market: ctx.market, lines: input.lines });
    return {
      customerId: ctx.actor.id,
      currency: quote.currency,
      lines: quote.lines.map(({ variantId, quantity, unitPriceMinor }) => ({
        variantId,
        quantity,
        unitPriceMinor,
      })),
      extensions: input.extensions,
    };
  }

  /**
   * Subtotal, then every adjustTotals implementer in `order`; only this method computes the total.
   * @returns totals whose `totalMinor` is subtotal plus adjustments, clamped at zero so a generous
   *          discount never refunds.
   */
  async price(draft: OrderDraft, ctx: ActionContext): Promise<OrderTotals> {
    const zero = Money.zero(draft.currency);
    const subtotal = draft.lines.reduce(
      (sum, l) => sum.plus(Money.ofMinor(l.unitPriceMinor, draft.currency).times(l.quantity)),
      zero,
    );
    const base: OrderTotals = {
      currency: draft.currency,
      subtotalMinor: subtotal.minor,
      adjustments: [],
      totalMinor: subtotal.minor,
    };
    const adjusted = await this.hooks.adjustTotals(base, draft, ctx);
    const total = adjusted.adjustments.reduce(
      (sum, a) => sum.plus(Money.ofMinor(a.amountMinor, draft.currency)),
      Money.ofMinor(adjusted.subtotalMinor, draft.currency),
    );
    const totals = { ...adjusted, totalMinor: Money.max(total, zero).minor };
    this.logger.info(DRAFT_PRICED, {
      lines: draft.lines.length,
      adjustments: totals.adjustments.map((a) => a.code),
    });
    return totals;
  }

  /**
   * Lets other modules refuse the order before anything is reserved.
   * @throws AppError the first implementer's refusal, with its own code (`insufficient_points`).
   */
  async verify(draft: OrderDraft, ctx: ActionContext): Promise<void> {
    await this.hooks.verifyPlacement(draft, ctx);
  }
}
