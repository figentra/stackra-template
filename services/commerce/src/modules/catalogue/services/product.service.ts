/**
 * Stackra file contract:
 * Purpose: the product aggregate's service: the cached view, the one row-to-view mapping and the
 *          sellable check orders runs before pricing.
 * Boundary: exported to sibling modules (catalogue.module.ts); runs inside the caller's
 *           transaction. `CrudService<Product>` (the model is the type argument) supplies the
 *           inherited reads and writes (`find`, `findOne`, `findOneOrFail`, `page`, `create`);
 *           ProductResource sets its `list`, `create` and `update` operations to `true`, so gen
 *           writes those three over them, and ProductLimitEntitlement gates the generated create
 *           because it counts Product. No transport and no permission checks: the pipeline does
 *           both.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 17), ADR 0105 (as amended), ADR 0137 (cache)
 */
import { CacheKey } from "@stackra/cache";
import type { Cache } from "@stackra/cache/contracts";
import { Duration, type PublicId } from "@stackra/contracts";
import { CrudService } from "@stackra/database";
import type { Locale } from "@stackra/i18n";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";
import { ProductNotFoundError } from "#modules/catalogue/errors/product-not-found.error";
import { VariantUnavailableError } from "#modules/catalogue/errors/variant-unavailable.error";
import { Product } from "#modules/catalogue/models/product.model";
import { ProductView } from "#modules/catalogue/schemas/product-view.schema";

/** The in-process surface orders uses: `assertSellable` before a price is quoted. */
export class ProductService extends CrudService<Product> {
  /**
   * @param cache - holds each view for ten minutes; ArchiveProductAction forgets it.
   */
  constructor(private readonly cache: Cache) {
    super();
  }

  /**
   * Product by public id, cached for ten minutes under a key of the model, the id and the locale
   * (the cache scopes keys by tenant). The key starts with the model and the id, so forgetting
   * `CacheKey.of(Product, id)` drops the view in every locale.
   * @throws ProductNotFoundError when no product has this id in the current tenant.
   */
  view(id: PublicId<"prd">, locale: Locale): Promise<ProductView> {
    return this.cache.remember(CacheKey.of(Product, id, locale), Duration.minutes(10), async () => {
      const product = await this.findOne({ id }, { populate: ["variants"] });
      if (!product) throw ProductNotFoundError.create({ id });
      return this.toView(product, locale);
    });
  }

  /** The one mapping from row to ProductView; the variants must be populated. */
  toView(product: Product, locale: Locale): ProductView {
    return ProductView.create({
      id: product.id,
      title: product.title.in(locale),
      slug: product.slug,
      status: product.status,
      variants: product.variants.map(({ id, sku }) => ({ id, sku })),
    });
  }

  /**
   * Ensures every variant exists and belongs to an active product. Orders calls it before pricing,
   * so a stale cart fails here with a clear code rather than deep in the workflow.
   * @throws VariantUnavailableError listing every id that is missing or not sellable.
   */
  async assertSellable(variantIds: readonly PublicId<"var">[]): Promise<void> {
    const products = await this.find(
      { status: ProductStatus.Active, variants: { id: { $in: [...variantIds] } } },
      { populate: ["variants"] },
    );
    const sellable = new Set(
      products.flatMap((product) => product.variants.map((variant) => variant.id)),
    );
    const missing = variantIds.filter((id) => !sellable.has(id));
    if (missing.length > 0) throw VariantUnavailableError.create({ variantIds: missing });
  }
}
