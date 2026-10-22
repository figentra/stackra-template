/**
 * Stackra file contract:
 * Purpose: the public-area projection of products: `ProductView` plus price (pricing service),
 *          stock (inventory) and the storefront fields, so the web storefront renders a page or a
 *          grid from one call.
 * Boundary: read only, private to the catalogue module. Price is never stored here (pricing owns
 *           it); stock is read through the inventory module's exported service, never its table.
 *           `market` comes from the request.
 * Runtime: node
 * Governing contract: ADR 0082 (public area), 0260 (generated clients), 0263 (typed constructors),
 *                     guides/programming-model.mdx#services
 */
import type { Locale } from "@stackra/i18n";
import type { PricingClient } from "#stackra/clients";
import type { StockService } from "#modules/inventory/services/stock.service";
import type { Product } from "#modules/catalogue/models/product.model";
import type { StorefrontProductCard } from "#modules/catalogue/schemas/storefront-product-card.schema";
import type { StorefrontProductView } from "#modules/catalogue/schemas/storefront-product-view.schema";

/**
 * Per-request facts the storefront projection needs: the locale for text, the market for price and
 * currency.
 */
export interface StorefrontContext {
  /** The request locale every translated field is resolved in. */
  readonly locale: Locale;
  /** The request market the pricing service quotes for. */
  readonly market: string;
}

/** Prices one product's variants at once (one quote per product, never per variant). */
export class StorefrontService {
  /**
   * @param pricing - the remote pricing service; `quote` is authoritative for a market now.
   * @param stock - inventory's exported read; a variant with `trackInventory: false` is always in
   *   stock.
   */
  constructor(
    private readonly pricing: PricingClient,
    private readonly stock: StockService,
  ) {}

  /** The product page shape (variants must be populated). */
  async toView(p: Product, ctx: StorefrontContext): Promise<StorefrontProductView> {
    const lines = p.variants.map((v) => ({ variantId: v.id, quantity: 1 }));
    const quote = await this.pricing.price.quote.call({ market: ctx.market, lines });
    const tracked = p.variants.filter((v) => v.trackInventory).map((v) => v.id);
    const available = await this.stock.available(tracked);
    const priceOf = new Map(quote.lines.map((l) => [l.variantId, l.unitPriceMinor]));
    const variants = p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      priceMinor: priceOf.get(v.id) ?? 0,
      inStock: !v.trackInventory || (available.get(v.id) ?? 0) > 0,
      options: v.options,
    }));
    const title = p.title.in(ctx.locale);
    return {
      id: p.id,
      title,
      slug: p.slug,
      currency: quote.currency,
      inStock: variants.some((v) => v.inStock),
      images: p.images,
      description: p.description?.in(ctx.locale) ?? null,
      variants,
      seo: p.seo ?? { title, description: null, noindex: false },
      collections: p.collections,
    };
  }

  /** The grid card: the lowest priced variant and the first image. */
  async toCard(p: Product, ctx: StorefrontContext): Promise<StorefrontProductCard> {
    const view = await this.toView(p, ctx);
    return {
      id: view.id,
      title: view.title,
      slug: view.slug,
      priceMinor: Math.min(...view.variants.map((v) => v.priceMinor)),
      currency: view.currency,
      image: view.images[0] ?? null,
      inStock: view.inStock,
    };
  }
}
