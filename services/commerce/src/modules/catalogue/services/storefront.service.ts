/**
 * Stackra file contract:
 * Purpose: the public-area projection of products: the product page and the grid card, priced by
 *          the pricing service and stocked from inventory, so the web storefront renders either
 *          from one call.
 * Boundary: read only and private to the catalogue module. Price is never stored here (pricing owns
 *           it); stock is read through inventory's exported StockService, never its table. The
 *           locale and the market come from the query context.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13 and 16), ADR 0082 (public area), ADR 0260 (generated
 *                     clients), ADR 0263 (typed constructors)
 */
import type { QueryContext } from "@stackra/actions";
import { Service } from "@stackra/app";
import type { PricingClient } from "#stackra/clients";
import type { StockService } from "#modules/inventory/services/stock.service";
import type { Product } from "#modules/catalogue/models/product.model";
import { StorefrontProductCard } from "#modules/catalogue/schemas/storefront-product-card.schema";
import { StorefrontProductView } from "#modules/catalogue/schemas/storefront-product-view.schema";

/** Prices one product's variants at once: one quote per product, never one per variant. */
export class StorefrontService extends Service {
  /**
   * @param pricing - the generated pricing client; `quote` is authoritative for a market now.
   * @param stock - inventory's exported reads; a variant that tracks no stock is always in stock.
   */
  constructor(
    private readonly pricing: PricingClient,
    private readonly stock: StockService,
  ) {
    super();
  }

  /** The product page shape; the variants must be populated. */
  async toView(product: Product, ctx: QueryContext): Promise<StorefrontProductView> {
    const lines = product.variants.map((variant) => ({ variantId: variant.id, quantity: 1 }));
    const quote = await this.pricing.price.quote.call({ market: ctx.market, lines });
    const tracked = product.variants
      .filter((variant) => variant.trackInventory)
      .map((variant) => variant.id);
    const available = await this.stock.available(tracked);
    const priceOf = new Map(quote.lines.map((line) => [line.variantId, line.unitPriceMinor]));
    const variants = product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      priceMinor: priceOf.get(variant.id) ?? 0,
      inStock: !variant.trackInventory || (available.get(variant.id) ?? 0) > 0,
      options: variant.options,
    }));
    const title = product.title.in(ctx.locale);
    return StorefrontProductView.create({
      id: product.id,
      title,
      slug: product.slug,
      currency: quote.currency,
      inStock: variants.some((variant) => variant.inStock),
      images: product.images,
      description: product.description?.in(ctx.locale) ?? null,
      variants,
      seo: product.seo ?? { title, description: null, noindex: false },
      collections: product.collections,
    });
  }

  /** The grid card: the lowest priced variant and the first image. */
  async toCard(product: Product, ctx: QueryContext): Promise<StorefrontProductCard> {
    const view = await this.toView(product, ctx);
    return StorefrontProductCard.create({
      id: view.id,
      title: view.title,
      slug: view.slug,
      priceMinor: Math.min(...view.variants.map((variant) => variant.priceMinor)),
      currency: view.currency,
      image: view.images[0] ?? null,
      inStock: view.inStock,
    });
  }
}
