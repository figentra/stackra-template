/**
 * Stackra file contract:
 * Purpose: prices an order: the sellable check (catalogue), unit prices (the pricing service), the
 *          `verifyPlacement` (before) extensions, then the `adjustTotals` (after) extensions.
 * Boundary: a plain `Service`: computation plus reads; no writes. The one caller of the orders
 *           extension point and the single place where order totals are produced, so every
 *           extension of an amount is listed under `orders.adjustTotals` in `#stackra/extensions`.
 *           Arithmetic is `Money` from @stackra/money (no hand-summed integers); the wire keeps
 *           integer minor units (ADR 0220).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 16 and 17, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0260 (a call is the authoritative answer now),
 *                     ADR 0265, ADR 0220 (money)
 */
import type { ActionContext } from "@stackra/actions";
import { Service } from "@stackra/app";
import type { Logger } from "@stackra/contracts";
import { Money } from "@stackra/money";
import type { PricingClient } from "#stackra/clients/pricing";
import type { ProductService } from "#modules/catalogue/services/product.service";
import { DRAFT_PRICED } from "#modules/orders/constants/draft-priced.constant";
import type { OrderExtensionPoint } from "#modules/orders/extensions/order.extension-point";
import type { CreateOrderInput } from "#modules/orders/schemas/create-order-input.schema";
import { OrderDraft } from "#modules/orders/schemas/order-draft.schema";
import { OrderTotals } from "#modules/orders/schemas/order-totals.schema";

/** Turns a create-order input into a priced, verified draft; the workflow's first step calls it. */
export class OrderPricingService extends Service {
  /**
   * @param products - catalogue's exported service; gen records the orders → catalogue edge.
   * @param pricing - the generated pricing client; the transport (in-process or RPC) follows the
   *                  root runway topology.
   * @param extensions - the orders extension point; each slot runs its extensions in `order`.
   * @param logger - the contracts port; @stackra/logger supplies the driver and the redaction that
   *                 src/config/logging.config.ts configures.
   */
  constructor(
    private readonly products: ProductService,
    private readonly pricing: PricingClient,
    private readonly extensions: OrderExtensionPoint,
    private readonly logger: Logger,
  ) {
    super();
  }

  /**
   * Builds the draft from the pricing service's current quote: a call, not an event, because the
   * order needs the authoritative price now. The customer is the acting principal; the market
   * comes from the request context.
   * @throws VariantUnavailableError when a variant is missing or its product is not active.
   * @throws Refusal whatever refusal the pricing service returns, unchanged.
   */
  async draft(input: CreateOrderInput, ctx: ActionContext): Promise<OrderDraft> {
    await this.products.assertSellable(input.lines.map((line) => line.variantId));
    const quote = await this.pricing.price.quote.call({ market: ctx.market, lines: input.lines });
    return OrderDraft.create({
      customerId: ctx.actor.id,
      currency: quote.currency,
      lines: quote.lines.map(({ variantId, quantity, unitPriceMinor }) => ({
        variantId,
        quantity,
        unitPriceMinor,
      })),
      extensions: input.extensions,
    });
  }

  /**
   * Subtotal, then every `adjustTotals` extension in `order`, each receiving the previous result;
   * only this method computes a total.
   * @returns totals whose `totalMinor` is subtotal plus adjustments, clamped at zero so a generous
   *          discount never refunds.
   */
  async price(draft: OrderDraft, ctx: ActionContext): Promise<OrderTotals> {
    const zero = Money.zero(draft.currency);
    const subtotal = draft.lines.reduce(
      (sum, line) =>
        sum.plus(Money.ofMinor(line.unitPriceMinor, draft.currency).times(line.quantity)),
      zero,
    );
    const base = OrderTotals.create({
      currency: draft.currency,
      subtotalMinor: subtotal.minor,
      adjustments: [],
      totalMinor: subtotal.minor,
    });
    const adjusted = await this.extensions.adjustTotals(base, draft, ctx);
    const total = adjusted.adjustments.reduce(
      (sum, adjustment) => sum.plus(Money.ofMinor(adjustment.amountMinor, draft.currency)),
      Money.ofMinor(adjusted.subtotalMinor, draft.currency),
    );
    const totals = OrderTotals.create({ ...adjusted, totalMinor: Money.max(total, zero).minor });
    this.logger.info(DRAFT_PRICED, {
      lines: draft.lines.length,
      adjustments: totals.adjustments.map((adjustment) => adjustment.code),
    });
    return totals;
  }

  /**
   * Lets other modules refuse the order before anything is reserved. A `before` slot may also hand
   * back a replacement draft of the same type, so the draft the workflow prices is the one
   * returned.
   * @throws Refusal the first extension's refusal, with its own code (`insufficient_points`).
   */
  async verify(draft: OrderDraft, ctx: ActionContext): Promise<OrderDraft> {
    const [verified] = await this.extensions.verifyPlacement(draft, ctx);
    return verified;
  }
}
